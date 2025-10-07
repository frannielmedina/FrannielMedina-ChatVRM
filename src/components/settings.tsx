// src/components/settings.tsx

import React, { useCallback, useState } from "react";
import { Message } from "@/features/messages/messages";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { GitHubLink } from "./githubLink";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { SimpleSlider } from "./simpleSlider";
import { ModelSelector } from "./modelSelector";
import { OpenRouterModels } from "@/features/constants/openRouterModels";
import { ColorPicker } from "./colorPicker";
import Image from 'next/image';

type Props = {
  // ... (Las props de tu componente)
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
  onChangeAiKey: (key: string) => void;
  onChangeElevenLabsKey: (key: string) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSystemPrompt: (systemPrompt: string) => void;
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

// Definición de las pestañas
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
    // Un pequeño retardo para mostrar la animación de fade out/in
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabChanging(false);
    }, 200); // Duración de la transición CSS
  }, [activeTab]);

  // Componente para el encabezado de las pestañas
  const TabHeader = ({ tab, label }: { tab: Tab, label: string }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`py-2 px-4 text-sm font-semibold transition-colors duration-300 ${
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
              onChange={onChangeElevenLabsKey}
              className="bg-white border border-gray-300 rounded-md p-2 w-full mb-4 focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
            />
            {/* ... (Aquí puedes poner la selección de voz de ElevenLabs) ... */}
          </>
        );
      case 'Model':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Modelo de Lenguaje (LLM)</h2>
            <ModelSelector
                models={OpenRouterModels}
                selectedModelId={selectedModelId}
                onChange={onChangeSelectedModelId}
            />
            {/* ... (Aquí iría la configuración de Koeiro si la usas) ... */}
          </>
        );
      case 'SystemPrompt':
        return (
          <>
            <h2 className="text-xl font-bold mb-4" style={{ color: uiColor }}>Personalidad y Rol</h2>
            <div className="text-sm font-bold text-gray-800">System Prompt</div>
            <textarea
              value={systemPrompt}
              onChange={(e) => onChangeSystemPrompt(e.target.value)}
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
            <div className="text-sm font-bold text-gray-800 mt-4 mb-2">Fondo de Pantalla</div>
            {/* ... (Aquí iría tu lógica de cambio de fondo) ... */}
            <TextButton
                onClick={() => alert("Función de cambio de fondo pendiente de implementación.")}
                style={{ backgroundColor: uiColor }}
            >
                Cambiar Fondo
            </TextButton>
            <div className="mt-6">
                <div className="text-sm font-bold text-red-600 mb-2">Zona Roja</div>
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
                <Image
                    src="/chatvrmlogo.png" // Usar la ruta relativa a 'public'
                    alt="ChatVRM Logo"
                    layout="fill"
                    objectFit="contain"
                    priority
                />
            </div>
            <p className="text-gray-700 mb-4">
              Esta aplicación está impulsada por el proyecto original **ChatVRM** y ha sido mejorada para funcionar con la API de OpenRouter.
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
