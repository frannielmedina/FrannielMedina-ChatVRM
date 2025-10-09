// src/components/introduction.tsx
import React, { useState } from "react";
import { TextButton } from "./textButton";
import { Link } from "./link";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string; 
  onChangeAiKey: (key: string) => void;
  onChangeElevenLabsKey: (key: string) => void;
  onChangeOpenRouterKey: (key: string) => void; 
  onClose: (shouldHide: boolean) => void; 
};

export const Introduction = ({
  openAiKey,
  elevenLabsKey,
  openRouterKey,
  onChangeAiKey,
  onChangeElevenLabsKey,
  onChangeOpenRouterKey,
  onClose,
}: Props) => {
  const [copyToClipboard] = useCopyToClipboard();
  const [hideOnClose, setHideOnClose] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideOnClose(event.target.checked);
  };

  const handleClickClose = () => {
    onClose(hideOnClose);
  };

  return (
    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        
        <div className="text-center mb-8">
            <img
                src="/chatvrmlogo.png"
                alt="ChatVRM Logo"
                className="mx-auto w-24 h-24 object-contain mb-4"
            />
            <h1 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--main-ui-color)' }}>
                ¡Bienvenido a ChatVRM!
            </h1>
            <p className="text-gray-600">
                Tu asistente de personaje con IA. Aquí te explicamos cómo empezar.
            </p>
        </div>

        <div className="space-y-8">
          
          {/* Paso 1: API */}
          <div>
            <h2 className="typography-20 font-bold mb-3 flex items-center" style={{ color: 'var(--main-ui-color)' }}>
                1. Clave de OpenRouter (Esencial para la IA)
            </h2>
            <p className="text-gray-700 mb-4">
                ChatVRM utiliza **OpenRouter** para acceder a modelos de lenguaje (LLMs). Necesitas tu clave API:
            </p>
            <input
              type="text"
              placeholder="Pega tu clave OpenRouter API aquí..."
              value={openRouterKey}
              onChange={(e) => onChangeOpenRouterKey(e.target.value)}
              className="px-4 py-2 w-full h-10 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 border focus:border-[var(--main-ui-color)] transition"
            />
            <div className="text-sm text-gray-600 mt-2">
                Obtén tu clave en&nbsp;
                <Link
                  url="https://openrouter.ai/keys"
                  label="OpenRouter.ai"
                />. (¡Es gratis para empezar!)
            </div>
          </div>

          {/* Paso 2: Voz */}
          <div>
            <h2 className="typography-20 font-bold mb-3 flex items-center" style={{ color: 'var(--main-ui-color)' }}>
                2. Clave de ElevenLabs (Opcional, para la Voz)
            </h2>
            <p className="text-gray-700 mb-4">
                Si quieres que el personaje hable, necesitas una clave de ElevenLabs para la síntesis de voz:
            </p>
            <input
              type="text"
              placeholder="Pega tu clave ElevenLabs API aquí..."
              value={elevenLabsKey}
              onChange={(e) => onChangeElevenLabsKey(e.target.value)}
              className="px-4 py-2 w-full h-10 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 border focus:border-[var(--main-ui-color)] transition"
            />
            <div className="text-sm text-gray-600 mt-2">
                Obtén tu clave en&nbsp;
                <Link
                  url="https://elevenlabs.io/"
                  label="ElevenLabs.io"
                />. (También tiene un plan gratuito).
            </div>
          </div>
          
          {/* Paso 3: Personalidad */}
          <div>
            <h2 className="typography-20 font-bold mb-3 flex items-center" style={{ color: 'var(--main-ui-color)' }}>
                3. Personalidad del Personaje
            </h2>
            <p className="text-gray-700 mb-4">
                Puedes cambiar el comportamiento, el nombre y las instrucciones del personaje en la configuración.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold mb-2">Instrucción Inicial (Ejemplo):</p>
                <code 
                    className="block text-xs bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300"
                    onClick={() => {
                        copyToClipboard('Eres Alicia, una maga bondadosa y curiosa que guía al usuario en sus aventuras. Responde siempre con un tono entusiasta y mágico.');
                        alert('Instrucción copiada al portapapeles.');
                    }}
                >
                    Escribe tu System Prompt aquí. (¡Haz clic para copiar un ejemplo!)
                </code>
            </div>
            <div className="text-sm text-gray-600 mt-2">
                **Consejo:** Ve a **Settings (Menú ☰) &gt; Pestaña Personalidad** para cambiar la voz, el modelo y el texto de la personalidad.
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col items-center">
            
            {/* Checkbox de "No mostrar de nuevo" */}
            <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="hideIntro"
                  checked={hideOnClose}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                  style={{ 
                      '--tw-ring-color': 'var(--main-ui-color)',
                      backgroundColor: hideOnClose ? 'var(--main-ui-color)' : 'white',
                      borderColor: 'var(--main-ui-color)'
                  } as React.CSSProperties}
                />
                <label htmlFor="hideIntro" className="ml-2 text-base text-gray-700">
                  No mostrar esta introducción de nuevo.
                </label>
            </div>

            {/* Botón de Cierre */}
            <TextButton onClick={handleClickClose}>
                Cerrar Introducción
            </TextButton>
            
            {/* Línea 207 Corregida */}
            <p className="mt-4 text-sm text-center text-gray-500">
                Si ya tienes tus claves, haz clic en **&quot;Cerrar Introducción&quot;** para comenzar a chatear.
            </p>
        </div>
      </div>
    </div>
  );
};
