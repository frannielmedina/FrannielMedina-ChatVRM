// src/components/settings.tsx (Código completo corregido)
import React, { useEffect, useState, cache } from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import {
  KoeiroParam,
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from "@/features/constants/koeiroParam";
import { Link } from "./link";
import { getVoices } from "@/features/elevenlabs/elevenlabs";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { RestreamTokens } from "./restreamTokens";
import Cookies from 'js-cookie';
import { OPENROUTER_MODELS } from "@/features/constants/openRouterModels";

// Definición de las pestañas
const TABS = [
  { id: 'general', label: 'General', icon: '24/Setting' },
  { id: 'api', label: 'API', icon: '24/Key' },
  { id: 'personality', label: 'Personalidad', icon: '24/Person' },
  { id: 'customization', label: 'Personalización', icon: '24/Image' },
  { id: 'stream', label: 'Stream', icon: '24/Play' },
  { id: 'about', label: 'Acerca de', icon: '24/Info' },
];

// Tipos de las propiedades
type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  selectedModelId: string;
  uiColor: string;
  isReasoningEnabled: boolean;
  isShowChatLogEnabled: boolean; // 🚨 NUEVA PROP: Control de visibilidad del ChatLog
  onChangeReasoningEnabled: (isEnabled: boolean) => void;
  onChangeShowChatLog: (isEnabled: boolean) => void; // 🚨 NUEVA PROP: Función para cambiar la visibilidad del ChatLog
  onClickClose: () => void;
  onChangeAiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onChangeSelectedModelId: (id: string) => void;
  onChangeUiColor: (color: string) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  onDeleteAllData: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (image: string) => void;
  onRestreamTokensUpdate?: (tokens: { access_token: string; refresh_token: string; } | null) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
};

export const Settings = ({
  openAiKey,
  elevenLabsKey,
  openRouterKey,
  chatLog,
  systemPrompt,
  elevenLabsParam,
  koeiroParam,
  selectedModelId,
  uiColor,
  onClickClose,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeOpenRouterKey,
  onChangeElevenLabsKey,
  onChangeElevenLabsVoice,
  onChangeChatLog,
  onChangeKoeiroParam,
  onChangeSelectedModelId,
  onChangeUiColor,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  onDeleteAllData,
  backgroundImage,
  onChangeBackgroundImage,
  onRestreamTokensUpdate = () => {},
  onTokensUpdate,
  onChatMessage,
  isReasoningEnabled,
  onChangeReasoningEnabled,
  isShowChatLogEnabled, // 🚨 NUEVA PROP
  onChangeShowChatLog, // 🚨 NUEVA PROP
}: Props) => {

  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  useEffect(() => {
    if (elevenLabsKey) {
      getVoices(elevenLabsKey).then((data) => {
        const voices = data.voices;
        setElevenLabsVoices(voices);
      });
    }
  }, [elevenLabsKey]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChangeBackgroundImage(base64String);
        localStorage.setItem('backgroundImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onChangeBackgroundImage('');
    localStorage.removeItem('backgroundImage');
  };

  const handleSaveOptions = () => {
    localStorage.setItem('openRouterKey', openRouterKey);
    localStorage.setItem('elevenLabsKey', elevenLabsKey);
    localStorage.setItem('uiColor', uiColor);
    localStorage.setItem('isReasoningEnabled', JSON.stringify(isReasoningEnabled));
    localStorage.setItem('isShowChatLogEnabled', JSON.stringify(isShowChatLogEnabled)); // 🚨 Guardar estado del ChatLog
    alert("Opciones guardadas con éxito en tu navegador.");
  };

  const handleLoadOptions = () => {
    const savedOpenRouterKey = localStorage.getItem('openRouterKey');
    if (savedOpenRouterKey) onChangeOpenRouterKey({ target: { value: savedOpenRouterKey } } as React.ChangeEvent<HTMLInputElement>);
    const savedElevenLabsKey = localStorage.getItem('elevenLabsKey');
    if (savedElevenLabsKey) onChangeElevenLabsKey({ target: { value: savedElevenLabsKey } } as React.ChangeEvent<HTMLInputElement>);
    const savedUiColor = localStorage.getItem('uiColor');
    if (savedUiColor) onChangeUiColor(savedUiColor);

    const savedReasoningEnabled = localStorage.getItem('isReasoningEnabled');
    if (savedReasoningEnabled !== null) onChangeReasoningEnabled(JSON.parse(savedReasoningEnabled));

    const savedShowChatLogEnabled = localStorage.getItem('isShowChatLogEnabled'); // 🚨 Cargar estado del ChatLog
    if (savedShowChatLogEnabled !== null) onChangeShowChatLog(JSON.parse(savedShowChatLogEnabled));

    if (window.localStorage.getItem("chatVRMParams")) {
        const params = JSON.parse(window.localStorage.getItem("chatVRMParams") as string);
        onChangeSystemPrompt({ target: { value: params.systemPrompt || '' } } as React.ChangeEvent<HTMLTextAreaElement>);
        onChangeSelectedModelId(params.selectedModelId || OPENROUTER_MODELS[0].id);
    }

    alert("Opciones cargadas desde tu navegador.");
  };
  
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeUiColor(event.target.value);
  };
  
  const handleToggleReasoning = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeReasoningEnabled(event.target.checked);
  };

  // 🚨 Manejador para el nuevo toggle de ChatLog
  const handleToggleChatLog = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeShowChatLog(event.target.checked);
  };

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur" style={{ color: 'var(--main-ui-color)' }}>
      <div className="absolute m-4 md:m-8">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
          color="var(--main-ui-color)"
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-5xl mx-auto px-4 py-8 md:px-24 md:py-16">
          <div className="my-16 typography-32 font-bold text-center">Settings</div>

          {/* Selector de pestañas */}
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition duration-300 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                style={{ backgroundColor: activeTab === tab.id ? 'var(--main-ui-color)' : 'transparent' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className={`w-6 h-6 mr-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-700'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white/90 p-6 md:p-10 rounded-xl shadow-2xl border-2 border-gray-100">
            
            {/* Contenedor de Contenido con Transición (Fundido) */}
            <div key={activeTab} className="transition-opacity duration-300 ease-in-out opacity-100 animate-fadeIn"> 
                {/* Pestaña General */}
                {activeTab === 'general' && (
                  <div className="space-y-8">
                    <h2 className="typography-24 font-bold" style={{ color: 'var(--main-ui-color)' }}>Opciones Generales</h2>
                    
                    {/* 🚨 NUEVA CASILLA: Visibilidad de ChatLog */}
                    <div className="my-16">
                        <div className="my-16 typography-20 font-bold">Registro de Conversación (Chat Log)</div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isShowChatLogEnabled}
                                onChange={handleToggleChatLog}
                                className="form-checkbox h-5 w-5"
                                style={{ 
                                    '--tw-ring-color': 'var(--main-ui-color)',
                                    backgroundColor: isShowChatLogEnabled ? 'var(--main-ui-color)' : 'white',
                                    borderColor: 'var(--main-ui-color)'
                                } as React.CSSProperties}
                            />
                            <span className="text-gray-800">
                                Mostrar registro de conversación en la pantalla principal (Ideal para Streamers).
                            </span>
                        </label>
                        <div className="text-sm text-gray-600 mt-2">
                            Si está activado, el historial de chat se mantendrá visible en la parte inferior izquierda de la pantalla.
                        </div>
                    </div>

                    <div className="flex gap-4">
                      <TextButton onClick={handleSaveOptions}>Guardar Opciones</TextButton>
                      <TextButton onClick={handleLoadOptions}>Cargar Opciones</TextButton>
                    </div>

                    <div className="border border-red-500 p-4 rounded-lg bg-red-50">
                      <div className="typography-20 font-bold text-red-600 mb-2">🔴 Zona Roja</div>
                      <div className="text-gray-700 mb-4">
                        Al hacer clic en el botón, se borrarán **todos** los datos guardados de ChatVRM en tu navegador (claves API, historial, configuraciones, etc.) y la página se recargará.
                      </div>
                      <TextButton onClick={onDeleteAllData} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition">
                        Eliminar Todos los Datos
                      </TextButton>
                    </div>
                  </div>
                )}

                {/* Pestaña API */}
                {activeTab === 'api' && (
                  <div className="space-y-8">
                    <h2 className="typography-24 font-bold" style={{ color: 'var(--main-ui-color)' }}>Configuración de API</h2>
                    
                    {/* OpenRouter API */}
                    <div className="my-24">
                      <div className="my-16 typography-20 font-bold">OpenRouter API</div>
                      <input
                        type="text"
                        placeholder="OpenRouter API key"
                        value={openRouterKey}
                        onChange={onChangeOpenRouterKey}
                        className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis text-gray-800"
                      ></input>
                      <div className="text-gray-600">
                        Ingresa tu clave de OpenRouter API. Obtén la tuya en&nbsp;
                        <Link
                          url="https://openrouter.ai/"
                          label="OpenRouter website"
                        />.
                      </div>
                    </div>

                    {/* ElevenLabs API */}
                    <div className="my-24">
                      <div className="my-16 typography-20 font-bold">ElevenLabs API</div>
                      <input
                        type="text"
                        placeholder="ElevenLabs API key"
                        value={elevenLabsKey}
                        onChange={onChangeElevenLabsKey}
                        className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis text-gray-800"
                      ></input>
                      <div className="text-gray-600">
                        Ingresa tu clave de ElevenLabs API para habilitar la síntesis de voz. Obtén la tuya en&nbsp;
                        <Link
                          url="https://beta.elevenlabs.io/"
                          label="ElevenLabs website"
                        />.
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Pestaña Personalidad */}
                {activeTab === 'personality' && (
                  <div className="space-y-8">
                    <h2 className="typography-24 font-bold" style={{ color: 'var(--main-ui-color)' }}>Ajustes de Personalidad</h2>
                    
                    {/* Selector de Modelo de Lenguaje */}
                    <div className="my-16">
                        <div className="my-16 typography-20 font-bold">Modelo de Lenguaje (LLM)</div>
                        <select
                            className="h-40 px-8 w-full md:w-auto bg-surface3 hover:bg-surface3-hover rounded-4 text-gray-800"
                            value={selectedModelId}
                            onChange={(e) => onChangeSelectedModelId(e.target.value)}
                        >
                            {OPENROUTER_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Selector de Voz ElevenLabs */}
                    <div className="my-16">
                        <div className="my-16 typography-20 font-bold">Voz de ElevenLabs</div>
                        <select
                            className="h-40 px-8 w-full md:w-auto bg-surface3 hover:bg-surface3-hover rounded-4 text-gray-800"
                            value={elevenLabsParam.voiceId}
                            onChange={onChangeElevenLabsVoice}
                            disabled={!elevenLabsKey || elevenLabsVoices.length === 0}
                        >
                            {elevenLabsVoices.length === 0 ? (
                                <option value="" disabled>
                                    {!elevenLabsKey ? 'Introduce tu API Key' : 'Cargando voces...'}
                                </option>
                            ) : (
                                elevenLabsVoices.map((voice) => (
                                    <option key={voice.voice_id} value={voice.voice_id}>
                                        {voice.name}
                                    </option>
                                ))
                            )}
                        </select>
                        <div className="text-sm text-gray-600 mt-2">
                            Selecciona una voz de ElevenLabs. Asegúrate de que tu clave API sea válida.
                        </div>
                    </div>

                    {/* Control de Razonamiento */}
                    <div className="my-16">
                        <div className="my-16 typography-20 font-bold">Control de Razonamiento (Reasoning)</div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isReasoningEnabled}
                                onChange={handleToggleReasoning}
                                className="form-checkbox h-5 w-5"
                                style={{ 
                                    '--tw-ring-color': 'var(--main-ui-color)',
                                    backgroundColor: isReasoningEnabled ? 'var(--main-ui-color)' : 'white',
                                    borderColor: 'var(--main-ui-color)'
                                } as React.CSSProperties}
                            />
                            <span className="text-gray-800">
                                Activar razonamiento (Permitir que el modelo muestre su proceso de pensamiento).
                            </span>
                        </label>
                        <div className="text-sm text-gray-600 mt-2">
                            Si está desactivado, el modelo recibirá una instrucción estricta para ser de **&quot;sólo salida&quot;** y ocultar su proceso interno.
                        </div>
                    </div>


                    {/* Character Settings (System Prompt) */}
                    <div className="my-40">
                      <div className="my-8">
                        <div className="my-16 typography-20 font-bold">
                          Character Settings (System Prompt)
                        </div>
                        <TextButton onClick={onClickResetSystemPrompt}>
                          Resetear ajustes de personaje
                        </TextButton>
                      </div>

                      <textarea
                        value={systemPrompt}
                        onChange={onChangeSystemPrompt}
                        className="px-16 py-8  bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full text-gray-800"
                      ></textarea>
                    </div>

                    {/* Historial de Conversación */}
                    {chatLog.length > 0 && (
                      <div className="my-40">
                        <div className="my-8 flex justify-between items-center">
                          <div className="my-16 typography-20 font-bold">Historial de Conversación</div>
                          <TextButton onClick={onClickResetChatLog}>
                            Resetear Historial
                          </TextButton>
                        </div>
                        <div className="my-8 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                          {chatLog.map((value, index) => {
                            return (
                              <div
                                key={index}
                                className="my-4 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                              >
                                <div className="w-[64px] py-2 font-semibold">
                                  {value.role === "assistant" ? "Personaje" : "Tú"}
                                </div>
                                <input
                                  key={index}
                                  className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8 text-gray-800"
                                  type="text"
                                  value={value.content}
                                  onChange={(event) => {
                                    onChangeChatLog(index, event.target.value);
                                  }}
                                ></input>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña Personalización */}
                {activeTab === 'customization' && (
                  <div className="space-y-8">
                    <h2 className="typography-24 font-bold" style={{ color: 'var(--main-ui-color)' }}>Personalización de la Interfaz</h2>
                    
                    {/* Subir Modelo VRM */}
                    <div className="my-40">
                      <div className="my-16 typography-20 font-bold">
                        Modelo de Personaje (.vrm)
                      </div>
                      <div className="my-8">
                        <TextButton onClick={onClickOpenVrmFile}>Abrir VRM</TextButton>
                      </div>
                    </div>

                    {/* Color de la IU */}
                    <div className="my-40">
                      <div className="my-16 typography-20 font-bold">
                        Color Principal de la IU
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={uiColor}
                          onChange={handleColorChange}
                          className="w-12 h-12 rounded-full border-2 cursor-pointer"
                          style={{ borderColor: uiColor }}
                        />
                        <input
                          type="text"
                          value={uiColor}
                          onChange={handleColorChange}
                          className="px-4 py-2 w-32 bg-surface3 rounded-md text-gray-800"
                        />
                        <div className="text-sm text-gray-600">
                          Cambia el color de todos los botones, diálogos y bordes.
                        </div>
                      </div>
                    </div>

                    {/* Imagen de Fondo */}
                    <div className="my-40">
                      <div className="my-16 typography-20 font-bold">
                        Imagen de Fondo
                      </div>
                      <div className="my-16">Elige una imagen de fondo personalizada:</div>
                      <div className="my-8 flex flex-col gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="my-4"
                        />
                        {backgroundImage && (
                          <div className="flex flex-col gap-4">
                            <div className="my-8">
                              <img
                                src={backgroundImage}
                                alt="Background Preview"
                                className="max-w-[200px] rounded-4"
                              />
                            </div>
                            <div className="my-8">
                              <TextButton onClick={handleRemoveBackground}>
                                Eliminar Fondo
                              </TextButton>
                            </div>
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          La imagen de fondo se guarda localmente en tu navegador.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña Stream */}
                {activeTab === 'stream' && (
                    <div className="space-y-8">
                        <h2 className="typography-24 font-bold" style={{ color: 'var(--main-ui-color)' }}>Configuración de Stream</h2>
                        <RestreamTokens onTokensUpdate={onTokensUpdate} onChatMessage={onChatMessage} />
                    </div>
                )}

                {/* Pestaña Acerca de (Modificada con logo y GitHub ajustado) */}
                {activeTab === 'about' && (
                  <div className="space-y-8 text-center p-8 bg-gray-50 rounded-lg">
                    
                    {/* Logo */}
                    <img
                      src="/chatvrmlogo.png"
                      alt="ChatVRM Logo"
                      className="mx-auto w-32 h-32 md:w-48 md:h-48 object-contain"
                    />

                    <div className="typography-28 font-extrabold" style={{ color: 'var(--main-ui-color)' }}>
                      ChatVRM - Chatea con personajes basado en IA
                    </div>
                    
                    {/* Enlace a GitHub - TAMAÑO AJUSTADO */}
                    <a
                        href="https://github.com/zoan37/ChatVRM"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-lg font-bold text-gray-700 hover:text-gray-900 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-2" // 🚨 Ajuste a h-6 w-6 para que sea más pequeño
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        <span>Código Fuente en GitHub</span>
                    </a>
                    
                    <div className="typography-16 font-semibold mt-4">
                      Fork creado por **Franniel Medina** a través de <Link url="https://github.com/zoan37/ChatVRM" label="https://github.com/zoan37/ChatVRM" />
                    </div>
                    <div className="text-lg mt-4">
                      Inspirado por ElevenLabs, OpenRouter y VRoid de Pixiv.
                    </div>
                    <div className="pt-4 text-sm text-gray-600">
                      ©2025 Franniel Medina - Todos los derechos reservados.
                    </div>
                    <div className="text-base font-bold">
                      <Link url="https://beacons.ai/frannielmedinatv" label="beacons.ai/frannielmedinatv" />
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
