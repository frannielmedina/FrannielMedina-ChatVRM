import { useState, useCallback, useRef } from 'react';

type MessageCallback = (username: string, message: string) => void;

export const useYouTubeChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<MessageCallback | null>(null);
  const liveChatIdRef = useRef<string | null>(null);
  const nextPageTokenRef = useRef<string | null>(null);
  const apiKeyRef = useRef<string | null>(null);

  const fetchLiveChatId = async (videoId: string, apiKey: string): Promise<string> => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();
    const liveChatId = data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
    
    if (!liveChatId) {
      throw new Error('No active live chat found for this video');
    }

    return liveChatId;
  };

  const fetchChatMessages = async () => {
    if (!liveChatIdRef.current || !apiKeyRef.current) return;

    try {
      let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatIdRef.current}&part=snippet,authorDetails&key=${apiKeyRef.current}`;
      
      if (nextPageTokenRef.current) {
        url += `&pageToken=${nextPageTokenRef.current}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const data = await response.json();
      
      // Update next page token
      nextPageTokenRef.current = data.nextPageToken;

      // Process messages
      if (data.items && callbackRef.current) {
        data.items.forEach((item: any) => {
          const username = item.authorDetails.displayName;
          const message = item.snippet.displayMessage;
          
          if (username && message) {
            callbackRef.current!(username, message);
          }
        });
      }

      // Set timeout for next poll based on pollingIntervalMillis
      const pollInterval = data.pollingIntervalMillis || 5000;
      intervalRef.current = setTimeout(fetchChatMessages, pollInterval);
    } catch (error) {
      console.error('Error fetching YouTube chat:', error);
    }
  };

  const connect = useCallback(async (videoId: string, apiKey: string, onMessage: MessageCallback) => {
    try {
      callbackRef.current = onMessage;
      apiKeyRef.current = apiKey;

      // Get live chat ID
      const liveChatId = await fetchLiveChatId(videoId, apiKey);
      liveChatIdRef.current = liveChatId;

      setIsConnected(true);

      // Start polling for messages
      fetchChatMessages();
    } catch (error) {
      console.error('Failed to connect to YouTube chat:', error);
      setIsConnected(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    
    liveChatIdRef.current = null;
    nextPageTokenRef.current = null;
    apiKeyRef.current = null;
    setIsConnected(false);
  }, []);

  return { connect, disconnect, isConnected };
};
