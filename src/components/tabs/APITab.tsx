import React, { useState, useEffect } from "react";
import { Link } from "../link";
import { useNotification } from "@/hooks/useNotification";

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

  const handleCustomMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setCustomMessage(newMessage);
    localStorage.setItem('openRouterCustomMessage', newMessage);
  };

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
          Por defecto, esta aplicación usa su propia clave API de OpenRouter para que las personas puedan probar fácilmente,
          pero esa puede quedarse sin créditos y necesitar ser recargada.
        </div>
        {props.openRouterKey.trim() === '' && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-4 text-sm">
            ⚠️ Advertencia: No has configurado una API key de OpenRouter. Se usará la clave por defecto que puede tener límites.
          </div>
        )}
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">API de ElevenLabs</div>
        <input
          type="password"
          placeholder="ElevenLabs API key"
          value={props.elevenLabsKey}
          onChange={handleElevenLabsKeyChange}
          className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis"
        />
        <div className="text-sm text-gray-600 mt-2">
          Ingresa tu clave API de ElevenLabs para habilitar la conversión de texto a voz.
          Puedes obtener una clave en el{' '}
          <Link url="https://beta.elevenlabs.io/" label="sitio web de ElevenLabs" />.
        </div>
        {props.elevenLabsKey.trim() === '' && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-4 text-sm">
            ⚠️ Advertencia: No has configurado una API key de ElevenLabs. La síntesis de voz no funcionará.
          </div>
        )}
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
