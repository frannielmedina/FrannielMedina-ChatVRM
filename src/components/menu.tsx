// src/components/menu.tsx

import { IconButton } from "./iconButton";
import { Message } from "@/features/messages/messages";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { ChatLog } from "./chatLog";
import React, { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Settings } from "./settings"; // Asegúrate de que este es el componente
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";

// ... (El tipo Props sigue siendo el mismo) ...
type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  assistantMessage: string;
  selectedModelId: string;
  uiColor: string;
  isUiVisible: boolean;
  onChangeSystemPrompt: (systemPrompt: string) => void;
  onChangeAiKey: (key: string) => void;
  onChangeElevenLabsKey: (key: string) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeElevenLabsParam: (param: ElevenLabsParam) => void;
  onChangeKoeiromapParam: (param: KoeiroParam) => void;
  onChangeSelectedModelId: (id: string) => void;
  onChangeUiColor: (color: string) => void;
  handleClickResetChatLog: () => void;
  handleClickResetSystemPrompt: () => void;
  onDeleteAllData: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (value: string) => void;
  onChatMessage: (message: string) => void;
  onTokensUpdate: (tokens: any) => void;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export const Menu = ({
  openAiKey,
  elevenLabsKey,
  openRouterKey,
  systemPrompt,
  chatLog,
  elevenLabsParam,
  koeiroParam,
  assistantMessage,
  selectedModelId,
  uiColor,
  isUiVisible,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeElevenLabsKey,
  onChangeChatLog,
  onChangeElevenLabsParam,
  onChangeKoeiromapParam,
  onChangeSelectedModelId,
  onChangeUiColor,
  handleClickResetChatLog,
  handleClickResetSystemPrompt,
  onDeleteAllData,
  backgroundImage,
  onChangeBackgroundImage,
  onChatMessage,
  onTokensUpdate,
  onChangeOpenRouterKey,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Nuevo estado para la animación de cierre (unmount delay)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleCloseSettings = useCallback(() => {
    setIsAnimatingOut(true);
    // Espera el tiempo de la animación (500ms) antes de desmontar el componente
    setTimeout(() => {
      setShowSettings(false);
      setIsAnimatingOut(false);
    }, 500);
  }, []);

  const handleClickOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // ... (Resto de useEffects y otras funciones sin modificar) ...

  const handleChangeVrmFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const file = files[0];
      if (!file) return;

      const file_type = file.name.split(".").pop();

      if (file_type === "vrm") {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        viewer.loadVrm(url);
      }

      event.target.value = "";
    },
    [viewer]
  );

  const handleBackgroundImageChange = (image: string) => {
    onChangeBackgroundImage(image);
  };

  return (
    <>
      {/* Contenedor principal con lógica de opacidad y visibilidad */}
      <div 
        className={`absolute z-10 m-4 md:m-8 transition-opacity duration-500 ${
          isUiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Menu"
            label="Settings"
            isProcessing={false}
            onClick={handleClickOpenSettings} // Usar la nueva función para abrir
            color={uiColor}
          ></IconButton>
          {/* ... (Botón de ChatLog sin modificar) ... */}
          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label="Conversation Log"
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
              color={uiColor}
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label="Conversation Log"
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
              color={uiColor}
            />
          )}
        </div>
      </div>
      {showChatLog && <ChatLog messages={chatLog} />}
      
      {/* --- Lógica de la Animación del Menú de Opciones --- */}
      {(showSettings || isAnimatingOut) && (
        <div 
          className={`fixed inset-0 z-40 flex items-end justify-center transition-all duration-500 ease-in-out ${
            showSettings ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
        >
          <Settings
            openAiKey={openAiKey}
            elevenLabsKey={elevenLabsKey}
            openRouterKey={openRouterKey}
            elevenLabsParam={elevenLabsParam}
            chatLog={chatLog}
            systemPrompt={systemPrompt}
            koeiroParam={koeiroParam}
            onClickClose={handleCloseSettings} // Usar la nueva función para cerrar
            // ... (resto de props pasados) ...
            onChangeAiKey={handleAiKeyChange}
            onChangeElevenLabsKey={handleElevenLabsKeyChange}
            onChangeElevenLabsVoice={handleElevenLabsVoiceChange}
            onChangeSystemPrompt={handleChangeSystemPrompt}
            onChangeChatLog={onChangeChatLog}
            onChangeKoeiroParam={handleChangeKoeiroParam}
            onClickOpenVrmFile={handleClickOpenVrmFile}
            onClickResetChatLog={handleClickResetChatLog}
            onClickResetSystemPrompt={handleClickResetSystemPrompt}
            backgroundImage={backgroundImage}
            onChangeBackgroundImage={handleBackgroundImageChange}
            onTokensUpdate={onTokensUpdate}
            onChatMessage={onChatMessage}
            onChangeOpenRouterKey={onChangeOpenRouterKey}
            selectedModelId={selectedModelId}
            onChangeSelectedModelId={onChangeSelectedModelId}
            onDeleteAllData={onDeleteAllData}
            uiColor={uiColor}
            onChangeUiColor={onChangeUiColor}
          />
        </div>
      )}
      {/* --------------------------------------------------- */}
      
      {/* Mostrar mensaje del asistente solo si la IU es visible */}
      {!showChatLog && assistantMessage && isUiVisible && (
        <AssistantText message={assistantMessage} />
      )}
      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={fileInputRef}
        onChange={handleChangeVrmFile}
      />
    </>
  );
};
