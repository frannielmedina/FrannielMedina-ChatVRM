import React, { useState, useEffect } from "react";
import { TextButton } from "../textButton";
import { TwitchIntegration } from "../streaming/TwitchIntegration";
import { YouTubeIntegration } from "../streaming/YouTubeIntegration";
import { RTMPStreaming } from "../streaming/RTMPStreaming";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
  streamerMode: boolean;
  onStreamerModeChange: (enabled: boolean) => void;
};

export const StreamingTab = (props: Props) => {
  const [activeIntegration, setActiveIntegration] = useState<'twitch' | 'youtube' | 'rtmp' | null>(null);
  const { showNotification } = useNotification();

  const handleStreamerModeToggle = () => {
    const newValue = !props.streamerMode;
    props.onStreamerModeChange(newValue);
    
    showNotification(
      newValue 
        ? '🔒 Modo Streamer activado. Las pestañas API y General están bloqueadas.' 
        : '🔓 Modo Streamer desactivado.',
      'info'
    );
  };

  return (
    <div className="space-y-8">
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Modo Streamer</div>
        <div className="text-sm text-gray-600 mb-4">
          Activa el modo streamer para bloquear las pestañas de API y General, protegiendo tu información sensible durante las transmisiones.
        </div>
        
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={props.streamerMode}
              onChange={handleStreamerModeToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {props.streamerMode ? '🔒 Activado' : '🔓 Desactivado'}
            </span>
          </label>
        </div>
        
        {props.streamerMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-4 text-sm text-blue-800">
            ℹ️ Las pestañas API y General están bloqueadas para proteger tus claves y configuraciones.
          </div>
        )}
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Integración de Chat</div>
        <div className="text-sm text-gray-600 mb-4">
          Conecta ChatVRM con Twitch o YouTube para que tu personaje responda a los mensajes del chat en tiempo real.
        </div>

        <div className="flex gap-4 mb-6">
          <TextButton
            onClick={() => setActiveIntegration('twitch')}
            className={activeIntegration === 'twitch' ? 'ring-2 ring-purple-500' : ''}
          >
            🎮 Twitch
          </TextButton>
          <TextButton
            onClick={() => setActiveIntegration('youtube')}
            className={activeIntegration === 'youtube' ? 'ring-2 ring-red-500' : ''}
          >
            ▶️ YouTube
          </TextButton>
        </div>

        {activeIntegration === 'twitch' && (
          <TwitchIntegration onChatMessage={props.onChatMessage} />
        )}

        {activeIntegration === 'youtube' && (
          <YouTubeIntegration onChatMessage={props.onChatMessage} />
        )}

        {!activeIntegration && (
          <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-8 text-center">
            <div className="text-gray-600">
              Selecciona una plataforma arriba para comenzar la integración del chat
            </div>
          </div>
        )}
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Transmisión RTMP</div>
        <div className="text-sm text-gray-600 mb-4">
          Transmite directamente a Twitch o YouTube usando RTMP. Ingresa la URL del servidor RTMP y la clave de transmisión.
        </div>

        <TextButton
          onClick={() => setActiveIntegration('rtmp')}
          className={activeIntegration === 'rtmp' ? 'ring-2 ring-green-500' : ''}
        >
          📡 Configurar RTMP
        </TextButton>

        {activeIntegration === 'rtmp' && (
          <div className="mt-6">
            <RTMPStreaming />
          </div>
        )}
      </div>

      <div className="my-24 p-4 bg-yellow-50 border border-yellow-300 rounded-4">
        <div className="typography-16 font-bold text-yellow-900 mb-2">
          ⚠️ Nota sobre RTMP
        </div>
        <div className="text-sm text-yellow-800">
          La transmisión RTMP directa desde el navegador tiene limitaciones técnicas. Para mejores resultados,
          considera usar software de streaming como OBS Studio y capturar esta ventana con el fondo verde activado.
        </div>
      </div>

      <div className="my-24 p-4 bg-green-50 border border-green-300 rounded-4">
        <div className="typography-16 font-bold text-green-900 mb-2">
          💡 Consejos para Streaming
        </div>
        <ul className="text-sm text-green-800 list-disc list-inside space-y-1">
          <li>Activa el modo streamer antes de iniciar tu transmisión</li>
          <li>Usa el fondo verde en Personalización para chroma key</li>
          <li>Configura el chat de Twitch/YouTube para interacción en vivo</li>
          <li>Prueba la configuración antes de transmitir en vivo</li>
        </ul>
      </div>
    </div>
  );
};
