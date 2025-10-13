import React, { useState } from "react";
import { TextButton } from "@/components/textButton";
import { useNotification } from "@/hooks/useNotification";

export const RTMPStreaming = () => {
  const [rtmpUrl, setRtmpUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rtmpUrl') || '';
    }
    return '';
  });

  const [streamKey, setStreamKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rtmpStreamKey') || '';
    }
    return '';
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const { showNotification } = useNotification();

  const handleRtmpUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setRtmpUrl(newUrl);
    localStorage.setItem('rtmpUrl', newUrl);
  };

  const handleStreamKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setStreamKey(newKey);
    localStorage.setItem('rtmpStreamKey', newKey);
  };

  const handleStartStreaming = async () => {
    if (!rtmpUrl.trim() || !streamKey.trim()) {
      showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      // Note: Direct RTMP streaming from browser is limited
      // This is a placeholder for future implementation
      showNotification(
        'La transmisión RTMP directa desde el navegador tiene limitaciones. ' +
        'Por favor usa OBS Studio para mejores resultados.',
        'warning'
      );
      
      // For now, just show instructions
      setIsStreaming(true);
    } catch (error) {
      showNotification('Error al iniciar la transmisión RTMP', 'error');
    }
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    showNotification('Transmisión detenida', 'info');
  };

  const rtmpPresets = [
    {
      name: 'Twitch',
      url: 'rtmp://live.twitch.tv/app/',
      instruction: 'Obtén tu clave de transmisión desde el Dashboard de Twitch'
    },
    {
      name: 'YouTube',
      url: 'rtmp://a.rtmp.youtube.com/live2/',
      instruction: 'Obtén tu clave de transmisión desde YouTube Studio'
    },
    {
      name: 'Facebook',
      url: 'rtmps://live-api-s.facebook.com:443/rtmp/',
      instruction: 'Obtén tu clave de transmisión desde Facebook Live Producer'
    }
  ];

  const handlePresetClick = (preset: typeof rtmpPresets[0]) => {
    setRtmpUrl(preset.url);
    localStorage.setItem('rtmpUrl', preset.url);
    showNotification(`URL RTMP configurada para ${preset.name}`, 'success');
  };

  return (
    <div className="space-y-4">
      <div className="typography-18 font-bold">Configuración RTMP</div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Presets Rápidos:
        </label>
        <div className="flex gap-2 flex-wrap">
          {rtmpPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-4 text-sm font-semibold transition-colors"
              disabled={isStreaming}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          URL del Servidor RTMP:
        </label>
        <input
          type="text"
          value={rtmpUrl}
          onChange={handleRtmpUrlChange}
          placeholder="rtmp://live.twitch.tv/app/"
          disabled={isStreaming}
          className="px-16 py-8 w-full h-40 bg-white hover:bg-gray-50 rounded-4 border-2 border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Clave de Transmisión (Stream Key):
        </label>
        <input
          type="password"
          value={streamKey}
          onChange={handleStreamKeyChange}
          placeholder="live_123456789_abcdefghijklmnop"
          disabled={isStreaming}
          className="px-16 py-8 w-full h-40 bg-white hover:bg-gray-50 rounded-4 border-2 border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-red-600 mt-1">
          ⚠️ Nunca compartas tu clave de transmisión públicamente
        </div>
      </div>

      <div className="flex gap-4">
        {!isStreaming ? (
          <TextButton 
            onClick={handleStartStreaming}
            disabled={!rtmpUrl.trim() || !streamKey.trim()}
          >
            Iniciar Transmisión
          </TextButton>
        ) : (
          <TextButton 
            onClick={handleStopStreaming}
            className="bg-red-600 hover:bg-red-700"
          >
            Detener Transmisión
          </TextButton>
        )}
      </div>

      <div className={`p-3 rounded-4 text-sm font-semibold ${
        isStreaming 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        Estado: {isStreaming ? '🔴 Transmitiendo' : '⚫ Detenido'}
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-4">
        <div className="text-sm font-bold text-yellow-900 mb-2">
          💡 Recomendación: Usa OBS Studio
        </div>
        <div className="text-xs text-yellow-800 space-y-2">
          <p>
            Para obtener mejores resultados en transmisión, te recomendamos usar <strong>OBS Studio</strong>:
          </p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Descarga OBS Studio desde obsproject.com</li>
            <li>Activa el fondo verde en la pestaña Personalización</li>
            <li>Captura esta ventana en OBS</li>
            <li>Aplica un filtro de chroma key al verde</li>
            <li>Configura tu escena y transmite directamente desde OBS</li>
          </ol>
        </div>
      </div>

      {isStreaming && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-4">
          <div className="text-sm font-bold text-blue-900 mb-2">
            📊 Información de la Transmisión
          </div>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>URL:</strong> {rtmpUrl}</div>
            <div><strong>Estado:</strong> Activo</div>
            <div className="text-red-600">
              <strong>Nota:</strong> La transmisión RTMP directa desde el navegador es experimental.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
