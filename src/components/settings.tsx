// src/components/settings.tsx

import React, { useCallback, useState } from "react";
import { Message } from "@/features/messages/messages";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { GitHubLink } from "./githubLink";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { ModelSelector } from "./modelSelector";
// CORRECCIÓN: Usamos 'OPENROUTER_MODELS' que es el nombre de la constante exportada.
import { OPENROUTER_MODELS } from "@/features/constants/openRouterModels";
import { ColorPicker } from "./colorPicker";
import Image from 'next/image';

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  elevenLabsParam: ElevenLabsParam;
  chatLog: Message[];
  systemPrompt: string;
  koeiroParam: KoeiroParam;
  selectedModelId: string;
  uiColor: string;
  onClickClose: () => void;
  // Props que esperan un STRING
  onChangeAiKey: (key: string) => void; 
  onChangeElevenLabsKey: (key: string) => void; 
  onChangeSystemPrompt: (systemPrompt: string) => void;
  // Otras props
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (value: string) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSelectedModelId: (id: string) => void;
  onDeleteAllData: () => void;
  onChangeUiColor: (color: string) => void;
};

type Tab = 'API' | 'Appearance' | 'SystemPrompt' | 'Model' | 'About';

export const Settings = ({
  openAiKey,
  elevenLabsKey,
  openRouterKey,
  elevenLabsParam,
  chatLog,
  systemPrompt,
  koeiroParam,
  selectedModelId,
  uiColor,
  onClickClose,
  onChangeAiKey,
  onChangeElevenLabsKey,
  onChangeElevenLabsVoice,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  backgroundImage,
  onChangeBackgroundImage,
  onTokensUpdate,
  onChatMessage,
  onChangeOpenRouterKey,
  onChangeSelectedModelId,
  onDeleteAllData,
  onChangeUiColor,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('API');
  const [isTabChanging, setIsTabChanging] = useState(false);

  // Implementación de la animación de cambio de pestaña
  const handleTabChange = useCallback((tab: Tab) => {
    if (tab === activeTab) return;
    setIsTabChanging(true);
    // Retardo para la transición de opacidad
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabChanging(false);
    }, 200); 
  }, [activeTab]);

  // --- Funciones locales para manejar los eventos de INPUTS ---
  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey]
  );

  const handleElevenLabsKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeElevenLabsKey(event.target.value);
    },
    [onChangeElevenLabsKey]
  );
  
  const handleChangeSystemPrompt = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeSystemPrompt(event.target.value);
    },
    [onChangeSystemPrompt]
  );
  // --- FIN Funciones locales ---

  // Componente para el encabezado de las pestañas
  const TabHeader = ({ tab, label }: { tab: Tab, label: string }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`py-2 px-4 text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${
        activeTab === tab
          ? 'border-b-2 border-[var(--main-ui-color)] text-[var(--main-ui-color)]'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      style={{ borderColor: activeTab === tab ? uiColor : undefined, color: activeTab === tab ? uiColor : undefined }}
    >
      {label}
    </button>
  );

  // Componente para renderizar el contenido de la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'API':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Claves de API</h2>
            
            <div className="text-sm font-bold text-gray-800">Clave de OpenRouter</div>
            <input
              type="text"
              value={openRouterKey}
              onChange={onChangeOpenRouterKey}
              className="bg-white border border-gray-300 rounded-md p-2 w-full mb-4 focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
            />

            <div className="text-sm font-bold text-gray-800">Clave de ElevenLabs</div>
            <input
              type="text"
              value={elevenLabsKey}
              onChange={handleElevenLabsKeyChange}
              className="bg-white border border-gray-300 rounded-md p-2 w-full mb-4 focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
            />

            <div className="text-sm font-bold text-gray-800">Clave de OpenAI (Legacy)</div>
            <input
              type="text"
              value={openAiKey}
              onChange={handleAiKeyChange}
              className="bg-white border border-gray-300 rounded-md p-2 w-full mb-4 focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
            />
          </>
        );
      case 'Model':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Modelo de Lenguaje (LLM)</h2>
            <ModelSelector
                // Usamos la constante corregida OPENROUTER_MODELS
                models={OPENROUTER_MODELS}
                selectedModelId={selectedModelId}
                onChange={onChangeSelectedModelId}
            />
            {/* Opciones de Voz ElevenLabs */}
            <h3 className="text-lg font-bold mt-6 mb-2">Voz de Asistente</h3>
            <label htmlFor="eleven-labs-voice" className="text-sm font-bold text-gray-800">
                ElevenLabs Voice ID
            </label>
            <select
                id="eleven-labs-voice"
                value={elevenLabsParam.voiceId}
                onChange={onChangeElevenLabsVoice}
                className="bg-white border border-gray-300 rounded-md p-2 w-full focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
                disabled={!elevenLabsKey}
            >
                <option value="EXAVITQu4vr4xnSDz7Sg">Rachel (Predeterminado)</option>
                <option value="pOz8qP9jPq8cK2kM0Z0v">Emily</option>
                <option value="S0WkUo39u8D4k0uK5S4u">Adam</option>
                {/* Agrega más opciones de voz si las tienes */}
            </select>
          </>
        );
      case 'SystemPrompt':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Personalidad y Rol</h2>
            <div className="text-sm font-bold text-gray-800">System Prompt</div>
            <textarea
              value={systemPrompt}
              onChange={handleChangeSystemPrompt}
              rows={10}
              className="bg-white border border-gray-300 rounded-md p-2 w-full mb-4 focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
            ></textarea>
            <TextButton
              onClick={onClickResetSystemPrompt}
              style={{ backgroundColor: uiColor }}
            >
              Restablecer System Prompt
            </TextButton>
          </>
        );
      case 'Appearance':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Apariencia</h2>
            <div className="text-sm font-bold text-gray-800 mb-2">Color de la Interfaz (UI)</div>
            <ColorPicker currentColor={uiColor} onChangeColor={onChangeUiColor} />
            
            <h3 className="text-lg font-bold mt-6 mb-2">Visual</h3>
            <div className="flex items-center space-x-2 mb-4">
                <TextButton
                    onClick={onClickOpenVrmFile}
                    style={{ backgroundColor: uiColor }}
                >
                    Cargar archivo VRM
                </TextButton>
                {/* Preview de fondo si existe */}
                {backgroundImage && (
                    <div className="w-16 h-10 border rounded overflow-hidden relative">
                        <img 
                            src={backgroundImage} 
                            alt="Fondo actual" 
                            className="object-cover w-full h-full" 
                        /> 
                    </div>
                )}
            </div>

            <div className="mt-6 border-t pt-4 border-gray-200">
                <div className="text-sm font-bold text-red-600 mb-2">Zona Roja (Danger Zone)</div>
                <TextButton
                    onClick={onDeleteAllData}
                    style={{ backgroundColor: 'red' }}
                >
                    ELIMINAR TODOS LOS DATOS
                </TextButton>
            </div>
          </>
        );
      case 'About':
        return (
          <div className="text-center p-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Acerca de ChatVRM</h2>
            <div className="mx-auto mb-6 w-32 h-32 relative">
                {/* Logo de la aplicación con optimización de Next.js */}
                <Image
                    src="/chatvrmlogo.png" 
                    alt="ChatVRM Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                />
            </div>
            <p className="text-gray-700 mb-4">
              Esta aplicación es una versión personalizada y mejorada del proyecto original **ChatVRM**, adaptada para utilizar **OpenRouter** como proveedor de modelos de lenguaje.
            </p>
            <p className="text-gray-700 mb-6">
              **Versión:** 1.0.0 (Custom Build)
            </p>
            <GitHubLink />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full max-w-2xl bg-white shadow-2xl rounded-t-xl overflow-hidden flex flex-col">
      {/* Encabezado y botón de cierre */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-800">Configuración</h1>
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
          color={uiColor}
        />
      </header>

      {/* Navegación por pestañas */}
      <nav className="flex justify-start border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <TabHeader tab="API" label="API" />
        <TabHeader tab="Model" label="Modelo LLM" />
        <TabHeader tab="SystemPrompt" label="Personalidad" />
        <TabHeader tab="Appearance" label="Apariencia" />
        <TabHeader tab="About" label="Acerca de" />
      </nav>

      {/* Contenido de la pestaña con animación */}
      <div className="p-4 overflow-y-auto flex-grow">
        <div 
          key={activeTab} // Usar key para forzar el re-render y reiniciar la animación
          className={`transition-opacity duration-200 ease-in-out ${
            isTabChanging ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
