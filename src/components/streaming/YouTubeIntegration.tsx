import React, { useState, useEffect } from "react";
import { TextButton } from "../textButton";
import { useYouTubeChat } from "@/hooks/useYouTubeChat";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  onChatMessage: (message: string) => void;
};

export const YouTubeIntegration = ({ onChatMessage }: Props) => {
  const [videoId, setVideoId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('youtubeVideoId') || '';
    }
    return '';
  });

  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('youtubeApiKey') || '';
    }
    return '';
  });

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const { showNotification } = useNotification();
  const { connect, disconnect, isConnected: chatConnected } = useYouTubeChat();

  useEffect(() => {
    setIsConnected(chatConnected);
  }, [chatConnected]);

  const handleVideoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVideoId = e.target.value;
    setVideoId(newVideoId);
    localStorage.setItem('youtubeVideoId', newVideoId);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('youtubeApiKey', newApiKey);
  };

  const handleConnect = async () => {
    if (!videoId.trim()) {
      showNotification('Por favor ingresa un ID de video de YouTube', 'error');
      return;
    }

    if (!apiKey.trim()) {
      showNotification('Por favor ingresa tu API Key de YouTube', 'error');
      return;
    }

    try {
      await connect(videoId, apiKey, (username, message) => {
        const newMessage = {
          username,
          message,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Send to AI
        const formattedMessage = `${username}: ${message}`;
        onChatMessage(formattedMessage);
      });
      
      showNotification('Conectado al chat de YouTube', 'success');
    } catch (error) {
      showNotification('Error al conectar con YouTube. Verifica el ID del video y la API key.', 'error');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showNotification('Desconectado de YouTube', 'info');
  };

  return (
    <div className="space-y-4 p-6 bg-red-50 border-2 border-red-300 rounded-8">
      <div className="typography-20 font-bold text-red-900">
        ▶️ Integración con YouTube
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          ID del Video de YouTube:
        </label>
        <input
          type="text"
          value={videoId}
          onChange={handleVideoIdChange}
          placeholder="dQw4w9WgXcQ"
          disabled={isConnected}
          className="px-16 py-8 w-full h-40 bg-white hover:bg-gray-50 rounded-4 border-2 border-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-600 mt-1">
          El ID del video se encuentra en la URL después de v= (ej: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          YouTube API Key:
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder="Tu API Key de YouTube Data v3"
          disabled={isConnected}
          className="px-16 py-8 w-full h-40 bg-white hover:bg-gray-50 rounded-4 border-2 border-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-600 mt-1">
          Obtén una API key en <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>
        </div>
      </div>

      <div className="flex gap-4">
        {!isConnected ? (
          <TextButton onClick={handleConnect} disabled={!videoId.trim() || !apiKey.trim()}>
            Conectar al Chat
          </TextButton>
        ) : (
          <TextButton onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700">
            Desconectar
          </TextButton>
        )}
      </div>

      <div className={`p-3 rounded-4 text-sm font-semibold ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      </div>

      {messages.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-2">
            Mensajes recientes ({messages.length}):
          </div>
          <div className="bg-white p-4 rounded-4 max-h-64 overflow-y-auto border-2 border-red-200">
            {messages.slice(-10).map((msg, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="font-bold text-red-700">{msg.username}:</span>{' '}
                <span className="text-gray-800">{msg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-4">
        ℹ️ Los mensajes del chat de YouTube aparecerán aquí y serán procesados por la IA automáticamente.
      </div>
    </div>
  );
};
