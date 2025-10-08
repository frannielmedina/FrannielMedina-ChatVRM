// menu.tsx
import { IconButton } from "./iconButton";
import { Message } from "@/features/messages/messages";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { ChatLog } from "./chatLog";
import React, { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Settings } from "./settings";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  assistantMessage: string;
  selectedModelId: string; // Nuevo
  uiColor: string; // Nuevo
  // 🆕 Nuevas props para el razonamiento
  isReasoningEnabled: boolean;
  onChangeReasoningEnabled: (isEnabled: boolean) => void;
  // ... (otras props)
  onChangeSystemPrompt: (systemPrompt: string) => void;
  onChangeAiKey: (key: string) => void;
  onChangeElevenLabsKey: (key: string) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeElevenLabsParam: (param: ElevenLabsParam) => void;
  onChangeKoeiromapParam: (param: KoeiroParam) => void;
  onChangeSelectedModelId: (id: string) => void; // Nuevo
  onChangeUiColor: (color: string) => void; // Nuevo
  handleClickResetChatLog: () => void;
  handleClickResetSystemPrompt: () => void;
  onDeleteAllData: () => void; // Nuevo
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
  selectedModelId, // Nuevo
  uiColor, // Nuevo
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
  onDeleteAllData, // Nuevo
  backgroundImage,
  onChangeBackgroundImage,
  onChatMessage,
  onTokensUpdate,
  onChangeOpenRouterKey,
  // 🆕 Nuevas props para el razonamiento
  isReasoningEnabled,
  onChangeReasoningEnabled,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
      onChangeBackgroundImage(savedBackground);
    }
  }, [onChangeBackgroundImage]);

  const handleChangeSystemPrompt = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeSystemPrompt(event.target.value);
    },
    [onChangeSystemPrompt]
  );

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

  const handleElevenLabsVoiceChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChangeElevenLabsParam({
        voiceId: event.target.value
      });
    },
    [onChangeElevenLabsParam]
  );

  const handleChangeKoeiroParam = useCallback(
    (x: number, y: number) => {
      onChangeKoeiromapParam({
        speakerX: x,
        speakerY: y,
      });
    },
    [onChangeKoeiromapParam]
  );

  const handleClickOpenVrmFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
      <div className="absolute z-10 m-4 md:m-8">
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Menu"
            label="Settings"
            isProcessing={false}
            onClick={() => setShowSettings(true)}
            color={uiColor} // Aplicar color
          ></IconButton>
          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label="Conversation Log"
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
              color={uiColor} // Aplicar color
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label="Conversation Log"
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
              color={uiColor} // Aplicar color
            />
          )}
        </div>
      </div>
      {showChatLog && <ChatLog messages={chatLog} />}
      {showSettings && (
        <Settings
          openAiKey={openAiKey}
          elevenLabsKey={elevenLabsKey}
          openRouterKey={openRouterKey}
          elevenLabsParam={elevenLabsParam}
          chatLog={chatLog}
          systemPrompt={systemPrompt}
          koeiroParam={koeiroParam}
          onClickClose={() => setShowSettings(false)}
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
          // Nuevas props
          selectedModelId={selectedModelId}
          onChangeSelectedModelId={onChangeSelectedModelId}
          onDeleteAllData={onDeleteAllData}
          uiColor={uiColor}
          onChangeUiColor={onChangeUiColor}
          // 🆕 Pasar nueva prop de razonamiento
          isReasoningEnabled={isReasoningEnabled} 
          onChangeReasoningEnabled={onChangeReasoningEnabled}
        />
      )}
      {!showChatLog && assistantMessage && (
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
