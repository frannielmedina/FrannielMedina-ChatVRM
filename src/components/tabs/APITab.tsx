import React, { useState, useEffect } from "react";
import { Link } from "../link";
import { useNotification } from "@/hooks/useNotification";
import { TTS_PROVIDERS, TTSProvider } from "@/lib/ttsProviders";

type Props = {
  openRouterKey: string;
  elevenLabsKey: string;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const APITab = (props: Props) => {
  const { showNotification } = useNotification();
  const [openRouterStatus, setOpenRouterStatus] = useState<string>('');
  const [customMessage, setCustomMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openRouterCustomMessage') || '';
    }
    return '';
  });

  const [selectedTTSProvider, setSelectedTTSProvider] = useState<TTSProvider>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ttsProvider') as TTSProvider) || 'browser';
    }
    return 'browser';
  });

  const [googleTTSKey, setGoogleTTSKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('googleTTSKey') || '';
    }
    return '';
  });

  const [azureTTSKey, setAzureTTSKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('azureTTSKey') || '';
    }
    return '';
  });

  const [koeiromapKey, setKoeiromapKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('koeiromapKey') || '';
    }
    return '';
  });

  useEffect(() => {
    checkOpenRouterStatus();
  }, []);

  const checkOpenRouterStatus = async () => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setOpenRouterStatus('🟢 OpenRouter está operativo');
      } else {
        setOpenRouterStatus('🔴 OpenRouter puede estar experimentando problemas');
      }
    } catch (error) {
      setOpenRouterStatus('🔴 No se pudo conectar con OpenRouter');
    }
  };

  const handleOpenRouterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChangeOpenRouterKey(e);
    
    if (e.target.value.trim() === '') {
      showNotification('⚠️ La API de OpenRouter está vacía. Por favor ingresa una clave válida.', 'error');
    }
  };

  const handleElevenLabsKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChangeElevenLabsKey(e);
    
    if (e.target.value.trim() === '') {
      showNotification('⚠️ La API de ElevenLabs está vacía. Por favor ingresa una clave válida.', 'error');
    }
  };

  const handleGoogleTTSKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setGoogleTTSKey(newKey);
    localStorage.setItem('googleTTSKey', newKey);
  };

  const handleAzureTTSKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setAzureTTSKey(newKey);
    localStorage.setItem('azureTTSKey', newKey);
  };

  const handleKoeiromapKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setKoeiromapKey(newKey);
    localStorage.setItem('koeiromapKey', newKey);
  };

  const handleCustomMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setCustomMessage(newMessage);
    localStorage.setItem('openRouterCustomMessage', newMessage);
  };

  const providerNeedsKey = TTS_PROVIDERS.find(p => p.id === selectedTTSProvider)?.requiresApiKey;

  return (
    <div className="space-y-8">
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Estado de OpenRouter</div>
        <div className="p-4 bg-gray-100 rounded-4 mb-4">
          {openRouterStatus}
        </div>
        <button
          onClick={checkOpenRouterStatus}
          className="text-sm text-primary hover:text-primary-hover underline"
        >
          Verificar estado nuevamente
        </button>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Mensaje Personalizado de OpenRouter</div>
        <textarea
          value={customMessage}
          onChange={handleCustomMessageChange}
          placeholder="Escribe un mensaje personalizado que se mostrará si OpenRouter está caído..."
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover h-96 rounded-8 w-full"
        />
        <div className="text-sm text-gray-600 mt-2">
          Este mensaje se mostrará a los usuarios cuando OpenRouter no esté disponible.
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">API de OpenRouter</div>
        <input
          type="password"
          placeholder="OpenRouter API key"
          value={props.openRouterKey}
          onChange={handleOpenRouterKeyChange}
          className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
        />
        <div className="text-sm text-gray-600 mt-2">
          Ingresa tu clave API de OpenRouter para acceso personalizado. Puedes obtener una clave en el{' '}
          <Link url="https://openrouter.ai/" label="sitio web de OpenRouter" />.
        </div>
        {props.openRouterKey.trim() === '' && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-4 text-sm">
            ⚠️ Advertencia: No has configurado una API key de OpenRouter.
          </div>
        )}
      </div>

      {/* APIs de TTS */}
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">APIs de Síntesis de Voz (TTS)</div>
        <div className="text-sm text-gray-600 mb-4">
          Configura las API keys para los proveedores TTS que requieren autenticación.
        </div>

        {/* ElevenLabs */}
        <div className="mb-6">
          <div className="font-semibold mb-2">ElevenLabs TTS</div>
          <input
            type="password"
            placeholder="ElevenLabs API key"
            value={props.elevenLabsKey}
            onChange={handleElevenLabsKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
          />
          <div className="text-xs text-gray-600">
            Obtén tu clave en{' '}
            <Link url="https://beta.elevenlabs.io/" label="ElevenLabs" />
          </div>
        </div>

        {/* Koeiromap */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Koeiromap TTS (Gratis)</div>
          <input
            type="password"
            placeholder="Koeiromap API key (opcional - gratis)"
            value={koeiromapKey}
            onChange={handleKoeiromapKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
          />
          <div className="text-xs text-gray-600">
            Obtén una clave gratuita en{' '}
            <Link url="http://koeiromap.rinna.jp" label="Koeiromap" />
          </div>
        </div>

        {/* Google Cloud TTS */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Google Cloud TTS</div>
          <input
            type="password"
            placeholder="Google Cloud TTS API key"
            value={googleTTSKey}
            onChange={handleGoogleTTSKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
          />
          <div className="text-xs text-gray-600">
            Obtén tu clave en{' '}
            <Link url="https://console.cloud.google.com/" label="Google Cloud Console" />
          </div>
        </div>

        {/* Azure TTS */}
        <div className="mb-6">
          <div className="font-semibold mb-2">Azure TTS</div>
          <input
            type="password"
            placeholder="Azure TTS API key"
            value={azureTTSKey}
            onChange={handleAzureTTSKeyChange}
            className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
          />
          <div className="text-xs text-gray-600">
            Obtén tu clave en{' '}
            <Link url="https://portal.azure.com/" label="Azure Portal" />
          </div>
        </div>
      </div>

      <div className="my-24 p-4 bg-blue-50 border border-blue-300 rounded-4">
        <div className="typography-16 font-bold text-blue-900 mb-2">
          🔒 Seguridad de las Claves API
        </div>
        <div className="text-sm text-blue-800">
          Las claves API ingresadas se almacenan de forma segura en el almacenamiento local de tu navegador
          y solo se utilizan para realizar llamadas a las APIs respectivas. No se envían a ningún servidor externo.
        </div>
      </div>
    </div>
  );
};
