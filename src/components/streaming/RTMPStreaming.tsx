import React, { useState } from "react";
import { TextButton } from "@/components/textButton";
import { useNotification } from "@/hooks/useNotification";

export const RTMPStreaming = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { showNotification } = useNotification();

  const streamingPlatforms = [
    {
      name: 'Twitch',
      rtmpUrl: 'rtmp://live.twitch.tv/app/',
      keyLocation: 'Twitch Dashboard → Settings → Stream → Primary Stream key',
      color: 'bg-purple-600'
    },
    {
      name: 'YouTube',
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2/',
      keyLocation: 'YouTube Studio → Go Live → Stream Settings → Stream key',
      color: 'bg-red-600'
    },
    {
      name: 'Facebook',
      rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
      keyLocation: 'Facebook Live Producer → Settings → Stream key',
      color: 'bg-blue-600'
    },
    {
      name: 'Kick',
      rtmpUrl: 'rtmp://stream.kick.com:1935/app/',
      keyLocation: 'Kick Dashboard → Settings → Stream Key',
      color: 'bg-green-600'
    }
  ];

  const handleCopyUrl = (url: string, platform: string) => {
    navigator.clipboard.writeText(url);
    showNotification(`URL RTMP de ${platform} copiada al portapapeles`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-yellow-50 border-2 border-yellow-400 rounded-8">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <div className="text-lg font-bold text-yellow-900 mb-2">
              Transmisión RTMP desde el navegador NO es posible
            </div>
            <div className="text-sm text-yellow-800">
              Los navegadores web no soportan transmisión RTMP directa debido a limitaciones técnicas.
              Para transmitir, necesitas usar <strong>OBS Studio</strong> o software similar.
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-8">
        <div className="text-xl font-bold text-blue-900 mb-4">
          📺 Guía: Cómo transmitir ChatVRM con OBS Studio
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="font-bold text-blue-900 mb-2">Paso 1: Descarga OBS Studio</div>
            <a 
              href="https://obsproject.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              🔗 https://obsproject.com/
            </a>
            <div className="text-sm text-blue-700 mt-1">
              OBS Studio es gratuito y de código abierto. Compatible con Windows, Mac y Linux.
            </div>
          </div>

          <div>
            <div className="font-bold text-blue-900 mb-2">Paso 2: Configura el fondo verde en ChatVRM</div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• Ve a la pestaña <strong>Personalización</strong></div>
              <div>• Activa el <strong>Fondo Verde (Chroma Key)</strong></div>
              <div>• Esto hará que el fondo sea completamente verde (#00FF00)</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-blue-900 mb-2">Paso 3: Captura la ventana en OBS</div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. Abre OBS Studio</div>
              <div>2. En <strong>Fuentes</strong>, haz clic en el botón <strong>+</strong></div>
              <div>3. Selecciona <strong>&quot;Captura de ventana&quot;</strong></div>
              <div>4. Elige la ventana del navegador con ChatVRM</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-blue-900 mb-2">Paso 4: Aplica el filtro Chroma Key</div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. Haz clic derecho en la fuente capturada</div>
              <div>2. Selecciona <strong>Filtros</strong></div>
              <div>3. En <strong>Filtros de efectos</strong>, haz clic en <strong>+</strong></div>
              <div>4. Selecciona <strong>&quot;Croma / Chroma Key&quot;</strong></div>
              <div>5. Ajusta la configuración (el verde debería eliminarse automáticamente)</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-blue-900 mb-2">Paso 5: Configura tu transmisión</div>
            <div className="text-sm text-blue-800 space-y-1">
              <div>1. Ve a <strong>Configuración → Emisión</strong> en OBS</div>
              <div>2. Selecciona tu plataforma o elige <strong>&quot;Personalizado&quot;</strong></div>
              <div>3. Ingresa la URL del servidor RTMP y tu clave de transmisión</div>
              <div>4. Haz clic en <strong>&quot;Iniciar transmisión&quot;</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-2 border-gray-300 rounded-8">
        <div className="text-xl font-bold text-gray-900 mb-4">
          🔑 Datos RTMP por plataforma
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Haz clic en una plataforma para ver sus datos RTMP y copiar la URL del servidor:
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {streamingPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              className={`p-4 rounded-8 text-white font-bold transition-all hover:scale-105 ${
                selectedPlatform === platform.name 
                  ? `${platform.color} ring-4 ring-offset-2 ring-gray-400` 
                  : `${platform.color} opacity-80`
              }`}
            >
              {platform.name}
            </button>
          ))}
        </div>

        {selectedPlatform && (
          <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-8">
            {streamingPlatforms
              .filter(p => p.name === selectedPlatform)
              .map(platform => (
                <div key={platform.name} className="space-y-3">
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Servidor RTMP:</div>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm">
                        {platform.rtmpUrl}
                      </code>
                      <TextButton 
                        onClick={() => handleCopyUrl(platform.rtmpUrl, platform.name)}
                        className="whitespace-nowrap"
                      >
                        📋 Copiar
                      </TextButton>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-900 mb-1">Dónde obtener tu Stream Key:</div>
                    <div className="text-sm text-gray-700 p-2 bg-yellow-50 border border-yellow-300 rounded">
                      {platform.keyLocation}
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-300 rounded">
                    <div className="text-sm font-bold text-red-900 mb-1">
                      ⚠️ NUNCA compartas tu Stream Key públicamente
                    </div>
                    <div className="text-xs text-red-700">
                      Cualquiera con tu Stream Key puede transmitir en tu canal.
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-green-50 border-2 border-green-300 rounded-8">
        <div className="text-lg font-bold text-green-900 mb-3">
          💡 Consejos Pro para Streaming
        </div>
        <ul className="text-sm text-green-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Resolución recomendada:</strong> 1920x1080 (Full HD) a 30 o 60 FPS</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Bitrate recomendado:</strong> 4500-6000 Kbps para 1080p</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Encoder:</strong> Usa x264 o NVENC (si tienes GPU NVIDIA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Audio:</strong> Configura un micrófono separado en OBS para mejor calidad</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Chroma Key:</strong> Ajusta la similitud y el suavizado para mejores resultados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Prueba local:</strong> Usa "Iniciar grabación" en OBS antes de tu primera transmisión en vivo</span>
          </li>
        </ul>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-300 rounded-8">
        <div className="text-sm text-purple-900">
          <strong>¿Necesitas ayuda?</strong> La comunidad de OBS tiene tutoriales completos en YouTube y foros de ayuda.
        </div>
      </div>
    </div>
  );
};
