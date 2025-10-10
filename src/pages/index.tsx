// src/pages/index.tsx
import { useCallback, useContext, useEffect, useState, useRef } from "react";
import Head from 'next/head';
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_KOEIRO_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { Meta } from "@/components/meta";
import { ElevenLabsParam, DEFAULT_ELEVEN_LABS_PARAM } from "@/features/constants/elevenLabsParam";
import { buildUrl } from "@/utils/buildUrl";
import { websocketService } from '../services/websocketService';
import { MessageMiddleOut } from "@/features/messages/messageMiddleOut";
import { ErrorDialog, ErrorDialogProps } from "@/components/errorDialog";
import { OPENROUTER_MODELS, DEFAULT_MODEL_ID } from "@/features/constants/openRouterModels";
import { LoadingScreen } from "@/components/loadingScreen";
// ⭐️ IMPORTAR EL CHATLOG ⭐️
import { ChatLog } from "@/components/ChatLog"; 

const m_plus_2 = M_PLUS_2({
// ... (omito código M_PLUS_2)
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
// ... (omito código montserrat)
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});

type LLMCallbackResult = {
  processed: boolean;
  error?: string;
};

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [elevenLabsParam, setElevenLabsParam] = useState<ElevenLabsParam>(DEFAULT_ELEVEN_LABS_PARAM);
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_KOEIRO_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [restreamTokens, setRestreamTokens] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // ⭐️ NUEVO ESTADO PARA CONTROLAR LA VISIBILIDAD DEL LOG ⭐️
  const [isChatLogOpen, setIsChatLogOpen] = useState(false);

  // --- UI y Modelos ---
// ... (omito código de UI)
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [uiColor, setUiColor] = useState<string>("#8e24aa");
  const [errorDialog, setErrorDialog] = useState<ErrorDialogProps | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(true); 
  
  // --- Estados de Carga ---
// ... (omito código de carga)
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);


  const [isReasoningEnabled, setIsReasoningEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
// ... (omito código de localStorage)
      const saved = localStorage.getItem('isReasoningEnabled');
      return saved ? JSON.parse(saved) : false; 
    }
    return false;
  });

  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openRouterKey') || '';
    }
    return '';
  });

  const showCountdownDialog = (title: string, message: string, code?: number, countdown = 10) => {
// ... (omito código de showCountdownDialog)
    setErrorDialog({
      title,
      message,
      code,
      countdown,
      onClose: () => setErrorDialog(null),
    });
  };
  
  useEffect(() => {
// ... (omito código de useEffect de inicialización)
    if (typeof window === "undefined") return;
    
    // Cargar estado de la introducción
    const introStatus = window.localStorage.getItem("chatVRM_hide_intro");
    if (introStatus === "true") {
      setShowIntroduction(false);
    }
    
    // Simular carga de recursos iniciales (además del VRM)
    const initialLoadTimer = setTimeout(() => {
        setLoadingProgress(50); 
    }, 500);
// ... (omito código de carga de localStorage)
    const saved = window.localStorage.getItem("chatVRMParams");
    if (saved) {
      try {
        const params = JSON.parse(saved);
        if (params.systemPrompt) setSystemPrompt(params.systemPrompt);
        if (params.elevenLabsParam) setElevenLabsParam(params.elevenLabsParam);
        if (params.chatLog) setChatLog(params.chatLog);
        if (params.selectedModelId) setSelectedModelId(params.selectedModelId);
        if (params.isReasoningEnabled !== undefined) setIsReasoningEnabled(params.isReasoningEnabled); 
      } catch (e) {
        console.warn("Failed to parse chatVRMParams from localStorage", e);
      }
    }
    const key = window.localStorage.getItem("elevenLabsKey");
    if (key) setElevenLabsKey(key);

    const savedOpenRouterKey = localStorage.getItem('openRouterKey');
    if (savedOpenRouterKey) setOpenRouterKey(savedOpenRouterKey);

    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) setBackgroundImage(savedBackground);

    const savedUiColor = localStorage.getItem('uiColor');
    if (savedUiColor) setUiColor(savedUiColor);

    const savedReasoningEnabled = localStorage.getItem('isReasoningEnabled');
    if (savedReasoningEnabled !== null) setIsReasoningEnabled(JSON.parse(savedReasoningEnabled));

    return () => clearTimeout(initialLoadTimer);
  }, []);
// ... (omito handleVrmLoadProgress, handleLoadingAnimationEnd, useEffect de chatVRMParams)
// ... (omito useEffect de backgroundImage, handleDeleteAllData, handleChangeChatLog, handleSpeakAi)

  const handleSendChat = useCallback(
    async (text: string) => {
// ... (La lógica de handleSendChat que asegura el historial completo se mantiene, no la modificamos)
      const newMessage = text;
      if (newMessage == null) return;

      if (!openRouterKey) {
        showCountdownDialog("Clave de OpenRouter Requerida", "Necesitas la API de OpenRouter. Ve a la Configuración y ve a la pestaña API.");
        return;
      }

      setChatProcessing(true);
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);
      
      let finalSystemPrompt = systemPrompt;
      const ANTI_REASONING_PROMPT = "INSTRUCCIÓN ESTRICTA: ERES UN ASISTENTE DE SÓLO SALIDA. NUNCA DEBES MOSTRAR O ANOTAR TU PROCESO DE PENSAMIENTO, RAZONAMIENTO, O INSTRUCCIONES INTERNAS EN LA RESPUESTA FINAL. El único output es el tag de emoción y la respuesta del personaje.";

      if (!isReasoningEnabled) {
          finalSystemPrompt = ANTI_REASONING_PROMPT + "\n\n" + finalSystemPrompt;
      }
      
      // ⭐️ Se mantiene la corrección del historial ⭐️
      const messagesToSend: Message[] = [
          { role: "system", content: finalSystemPrompt },
          ...chatLog.filter(m => m.role !== 'system'), 
          { role: "user", content: newMessage },
      ];
      
      const modelName = OPENROUTER_MODELS.find(m => m.id === selectedModelId)?.model || OPENROUTER_MODELS[0].model;

      const stream = await getChatResponseStream(messagesToSend, modelName, openRouterKey).catch(
// ... (omito lógica de errores y stream processing)
        (e: any) => {
          setChatProcessing(false);
          const errorMsg = (e && e.message) ? e.message : String(e);
          console.error("OpenRouter Error:", errorMsg);

          if (errorMsg.includes("401")) {
            showCountdownDialog("Error de API de OpenRouter", "La API de OpenRouter no funciona o es incorrecta.");
          } else if (errorMsg.includes("429")) {
            showCountdownDialog("Límite de Tasa Excedido", "Has excedido el límite de solicitudes de OpenRouter. Por favor, espera y vuelve a intentarlo.");
          } else if (errorMsg.includes("OpenRouter_API_Down")) {
            const match = errorMsg.match(/code: (\d+), message: (.+)/);
            if (match) {
                showCountdownDialog(
                    "¡Vaya! Algo malo ha pasado con la API de OpenRouter",
                    `La API de OpenRouter ha arrojado este error: ${match[2]}`,
                    parseInt(match[1], 10)
                );
            } else {
                showCountdownDialog(
                    "¡Vaya! Algo malo ha pasado con la API de OpenRouter",
                    "Algo ha fallado al intentar conectar con OpenRouter."
                );
            }
          } else {
            showCountdownDialog("Error Desconocido de OpenRouter", `¡Vaya! Algo malo ha pasado con la API de OpenRouter, la API de OpenRouter ha arrojado este error: ${errorMsg}`);
          }
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n.!?]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);

            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], elevenLabsKey, elevenLabsParam, () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        try {
          reader.releaseLock();
        } catch (_) {
          // ignore
        }
      }

      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, elevenLabsKey, elevenLabsParam, openRouterKey, selectedModelId, isReasoningEnabled]
  );

  const handleOpenRouterKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = event.target.value;
    setOpenRouterKey(newKey);
    localStorage.setItem('openRouterKey', newKey);
  };
  
  const handleHideIntroduction = (shouldHide: boolean) => {
      setShowIntroduction(false);
      if (shouldHide) {
          localStorage.setItem("chatVRM_hide_intro", "true");
      }
  };

  // ⭐️ NUEVOS MANEJADORES PARA EL CHAT LOG ⭐️
  const handleOpenChatLog = () => setIsChatLogOpen(true);
  const handleCloseChatLog = () => setIsChatLogOpen(false);


  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      <Head>
        <style>{`:root { --main-ui-color: ${uiColor}; }`}</style>
      </Head>

      <Meta />

      {/* Pantalla de Carga */}
      {isLoading && <LoadingScreen progress={loadingProgress} onAnimationEnd={handleLoadingAnimationEnd} />}

      {/* Introducción (Solo se muestra si isLoading es false Y showIntroduction es true) */}
      {!isLoading && showIntroduction && (
        <Introduction
// ... (omito props)
          openAiKey={openAiKey}
          elevenLabsKey={elevenLabsKey}
          openRouterKey={openRouterKey} 
          onChangeAiKey={setOpenAiKey}
          onChangeElevenLabsKey={setElevenLabsKey}
          onChangeOpenRouterKey={setOpenRouterKey} 
          onClose={handleHideIntroduction} 
        />
      )}
      
      <main
        className="flex flex-col items-center justify-start min-h-screen bg-gray-100"
        style={{ height: '100dvh' }}
      >
        <VrmViewer onVrmLoadProgress={handleVrmLoadProgress} />
        <MessageInputContainer
          isChatProcessing={chatProcessing || isAISpeaking || isPlayingAudio}
          onChatProcessStart={handleSendChat}
        />

        <Menu
// ... (omito props)
          openAiKey={openAiKey}
          elevenLabsKey={elevenLabsKey}
          openRouterKey={openRouterKey}
          systemPrompt={systemPrompt}
          chatLog={chatLog}
          elevenLabsParam={elevenLabsParam}
          koeiroParam={koeiroParam}
          assistantMessage={assistantMessage}
          onChangeAiKey={setOpenAiKey}
          onChangeElevenLabsKey={setElevenLabsKey}
          onChangeSystemPrompt={setSystemPrompt}
          onChangeChatLog={handleChangeChatLog}
          onChangeElevenLabsParam={setElevenLabsParam}
          onChangeKoeiromapParam={setKoeiroParam} 
          handleClickResetChatLog={() => setChatLog([])}
          handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
          backgroundImage={backgroundImage}
          onChangeBackgroundImage={setBackgroundImage}
          onTokensUpdate={handleTokensUpdate}
          onChatMessage={handleSendChat}
          onChangeOpenRouterKey={handleOpenRouterKeyChange}
          selectedModelId={selectedModelId}
          onChangeSelectedModelId={setSelectedModelId}
          onDeleteAllData={handleDeleteAllData}
          uiColor={uiColor}
          onChangeUiColor={setUiColor}
          isReasoningEnabled={isReasoningEnabled} 
          onChangeReasoningEnabled={setIsReasoningEnabled}
          // ⭐️ PASAR EL MANEJADOR DE APERTURA AL MENU ⭐️
          onOpenChatLog={handleOpenChatLog} 
        />

        {/* ⭐️ RENDERIZAR EL CHAT LOG COMO OVERLAY CONTROLADO ⭐️ */}
        <ChatLog
          messages={chatLog}
          isOpen={isChatLogOpen}
          onClose={handleCloseChatLog}
        />

        {errorDialog && (
// ... (omito ErrorDialog)
          <ErrorDialog
            title={errorDialog.title}
            message={errorDialog.message}
            code={errorDialog.code}
            countdown={errorDialog.countdown}
            onClose={errorDialog.onClose}
          />
        )}
      </main>
    </div>
  );
}
