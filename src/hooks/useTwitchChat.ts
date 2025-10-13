import { useState, useCallback, useRef } from 'react';

type MessageCallback = (username: string, message: string) => void;

export const useTwitchChat = () => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbackRef = useRef<MessageCallback | null>(null);

  const connect = useCallback(async (channel: string, onMessage: MessageCallback) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    callbackRef.current = onMessage;

    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    
    ws.onopen = () => {
      // Anonymous connection to Twitch IRC
      ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      ws.send('PASS SCHMOOPIIE'); // Anonymous login
      ws.send('NICK justinfan12345'); // Anonymous username
      ws.send(`JOIN #${channel.toLowerCase()}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = event.data;
      
      // Handle PING/PONG
      if (message.startsWith('PING')) {
        ws.send('PONG :tmi.twitch.tv');
        return;
      }

      // Parse chat messages
      if (message.includes('PRIVMSG')) {
        const usernameMatch = message.match(/:(\w+)!/);
        const messageMatch = message.match(/PRIVMSG #\w+ :(.+)/);
        
        if (usernameMatch && messageMatch) {
          const username = usernameMatch[1];
          const chatMessage = messageMatch[1].trim();
          
          if (callbackRef.current) {
            callbackRef.current(username, chatMessage);
          }
        }
      }
    };

    ws.onerror = (error) => {
      console.error('Twitch WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return { connect, disconnect, isConnected };
};
