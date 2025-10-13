import React, { useState, useEffect } from "react";
import { TextButton } from "../textButton";
import { useTwitchChat } from "@/hooks/useTwitchChat";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  onChatMessage: (message: string) => void;
};

export const TwitchIntegration = ({ onChatMessage }: Props) => {
  const [channel, setChannel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('twitchChannel') || '';
    }
    return '';
  });

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const { showNotification } = useNotification();
  const { connect, disconnect, isConnected: chatConnected } = useTwitchChat();

  useEffect(() => {
    setIsConnected(chatConnected);
  }, [chatConnected]);

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChannel = e.target.value;
    setChannel(newChannel);
    localStorage.setItem('twitchChannel', newChannel);
  };

  const handleConnect = async () => {
    if (!channel.trim()) {
      showNotification('Por favor ingresa un canal de Twitch', 'error');
      return;
    }

    try {
      await connect(channel, (username, message) => {
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
      
      showNotification(`Conectado al canal de Twitch: ${channel}`, 'success');
    } catch (error) {
      showNotification('Error al conectar con Twitch', 'error');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showNotification('Desconectado de Twitch', 'info');
  };

  return (
    <div className="space-y-4 p-6 bg-purple-50 border-2 border-purple-300 rounded-8">
      <div className="typography-20 font-bold text-purple-900">
        🎮 Integración con Twitch
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Canal de Twitch:
        </label>
        <input
          type="text"
          value={channel}
          onChange={handleChannelChange}
          placeholder="nombre_del_canal"
          disabled={isConnected}
          className="px-16 py-8 w-full h-40 bg-white hover:bg-gray-50 rounded-4 border-2 border-purple-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-600 mt-1">
          Ingresa el nombre del canal sin el símbolo @
        </div>
      </div>

      <div className="flex gap-4">
        {!isConnected ? (
          <TextButton onClick={handleConnect} disabled={!channel.trim()}>
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
          <div className="bg-white p-4 rounded-4 max-h-64 overflow-y-auto border-2 border-purple-200">
            {messages.slice(-10).map((msg, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="font-bold text-purple-700">{msg.username}:</span>{' '}
                <span className="text-gray-800">{msg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-4">
        ℹ️ Los mensajes del chat de Twitch aparecerán aquí y serán procesados por la IA automáticamente.
      </div>
    </div>
  );
};
