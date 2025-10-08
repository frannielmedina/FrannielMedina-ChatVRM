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
// CORRECCIÓN DE RUTA DE IMPORTACIÓN: Asumimos que es minúscula si no se ha encontrado antes
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
import { ElevenLabsParam, DEFAULT_ELEVEN_LABS_PARAM } from "@/features/constants/elevenLabsParam";
import { buildUrl } from "@/utils/buildUrl";
import { websocketService } from '../services/websocketService';
import { MessageMiddleOut } from "@/features/messages/messageMiddleOut";
import { ErrorDialog, ErrorDialogProps } from "@/components/errorDialog";
import { OPENROUTER_MODELS, DEFAULT_MODEL_ID } from "@/features/constants/openRouterModels";

const m_plus_2 = M_PLUS_2({
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
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

  // --- Mejoras de UI y Modelos ---
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [uiColor, setUiColor] = useState<string>("#8e24aa"); // Color predeterminado (morado)
  const [errorDialog, setErrorDialog] = useState<ErrorDialogProps | null>(null);
  const [isUiVisible, setIsUiVisible] = useState(true); // Estado de visibilidad de la IU
  const inactivityTimerRef = useRef<number | null>(null); // Referencia al temporizador

  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openRouterKey') || '';
    }
    return '';
  });

  // Función para mostrar el diálogo de error con countdown
  const showCountdownDialog = (title: string, message: string, code?: number, countdown = 10) => {
    setErrorDialog({
      title,
      message,
      code,
      countdown,
      onClose: () => setErrorDialog(null),
    });
  };

  // --- Lógica de Inactividad del Cursor ---
  useEffect(() => {
    const INACTIVITY_TIMEOUT_MS = 60000; // 60 segundos (1 minuto)

    const resetTimer = () => {
      setIsUiVisible(true);
      if (inactivityTimerRef.current !== null) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        setIsUiVisible(false);
      }, INACTIVITY_TIMEOUT_MS);
    };

    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keydown', resetTimer);
    document.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      document.removeEventListener('mousemove', resetTimer);
      document.removeEventListener('keydown', resetTimer);
      document.removeEventListener('click', resetTimer);
      if (inactivityTimerRef.current !== null) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);
  // ------------------------------------------------------------------

  // Carga inicial de datos desde localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("chatVRMParams");
    if (saved) {
      try {
        const params = JSON.parse(saved);
        if (params.systemPrompt) setSystemPrompt(params.systemPrompt);
        if (params.elevenLabsParam) setElevenLabsParam(params.elevenLabsParam);
        if (params.chatLog) setChatLog(params.chatLog);
        if (params.selectedModelId) setSelectedModelId(params.selectedModelId);
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
  }, []);

  // Guardado de datos en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    process.nextTick(() => {
      try {
        window.localStorage.setItem(
          "chatVRMParams",
          JSON.stringify({ systemPrompt, elevenLabsParam, chatLog, selectedModelId })
        );
        window.localStorage.setItem("elevenLabsKey", elevenLabsKey);
        window.localStorage.setItem("uiColor", uiColor);
      } catch (e) {
        console.warn("Failed to write chatVRMParams to localStorage", e);
      }
    });
  }, [systemPrompt, elevenLabsParam, chatLog, elevenLabsKey, selectedModelId, uiColor]);

  // Manejo de fondo
  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
    } else {
      document.body.style.backgroundImage = `url(${buildUrl("/bg-c.png")})`;
    }
  }, [backgroundImage]);

  // Función de la Zona Roja
  const handleDeleteAllData = useCallback(() => {
    const isConfirmed = window.confirm("¿Estás seguro de que quieres eliminar TODOS los datos de ChatVRM (claves API, historial, configuraciones)? Esta acción es irreversible.");
    if (isConfirmed) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直接でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      elevenLabsKeyParam: string,
      elevenLabsParamParam: ElevenLabsParam,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      setIsAISpeaking(true);
      try {
        await speakCharacter(
          screenplay,
          elevenLabsKeyParam,
          elevenLabsParamParam,
          viewer,
          () => {
            setIsPlayingAudio(true);
            onStart?.();
          },
          () => {
            setIsPlayingAudio(false);
            onEnd?.();
          }
        );
      } catch (error) {
        setIsAISpeaking(false);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error('Error during AI speech (ElevenLabs):', errorMessage);

        if (errorMessage.includes("401")) {
          showCountdownDialog("Error de API de ElevenLabs", "La API de ElevenLabs no funciona o es incorrecta.");
        } else {
          showCountdownDialog(
            "¡Vaya! Algo malo ha pasado con la API de ElevenLabs",
            "Chequea los créditos en tu cuenta de ElevenLabs o probablemente la API de ElevenLabs está caída."
          );
        }
      } finally {
        setIsAISpeaking(false);
      }
    },
    [viewer]
  );

  /**
   * アシスタントとの会話を行う
   * Se modificó la estructura de mensajes para mayor compatibilidad (Deepseek/R1T2)
   */
  const handleSendChat = useCallback(
    async (text: string) => {
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
      
      // --- CORRECCIÓN LLM COMPATIBILIDAD ---
      // Fusionamos el prompt del sistema y el mensaje de usuario en un solo mensaje de 'user'
      // para mejorar la compatibilidad con modelos sensibles (Deepseek, R1T2, etc.)
      const systemPromptContent = systemPrompt;
      const compatibilityMessage: Message[] = [
        {
          role: "user",
          content: `${systemPromptContent}\n\nMi mensaje es: ${newMessage}`,
        },
      ];

      // Usar compatibilityMessage en lugar de MessageMiddleOut si el log no es crítico para el LLM.
      // Si MessageMiddleOut es necesario para manejar el historial, ajusta su lógica.
      // Aquí, usamos la versión simplificada para la primera interacción:
      const processedMessages = compatibilityMessage;
      // --- FIN CORRECCIÓN LLM COMPATIBILIDAD ---

      const modelName = OPENROUTER_MODELS.find(m => m.id === selectedModelId)?.model || OPENROUTER_MODELS[0].model;

      const stream = await getChatResponseStream(processedMessages, modelName, openRouterKey).catch(
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
    [systemPrompt, chatLog, handleSpeakAi, elevenLabsKey, elevenLabsParam, openRouterKey, selectedModelId]
  );

  const handleTokensUpdate = useCallback((tokens: any) => {
    setRestreamTokens(tokens);
  }, []);

  useEffect(() => {
    websocketService.setLLMCallback(async (message: string): Promise<LLMCallbackResult> => {
      try {
        if (isAISpeaking || isPlayingAudio || chatProcessing) {
          console.log('Skipping message processing - system busy');
          return {
            processed: false,
            error: 'System is busy processing previous message'
          };
        }

        await handleSendChat(message);
        return {
          processed: true
        };
      } catch (error) {
        console.error('Error processing message:', error);
        return {
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    });
  }, [handleSendChat, chatProcessing, isPlayingAudio, isAISpeaking]);

  const handleOpenRouterKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = event.target.value;
    setOpenRouterKey(newKey);
    localStorage.setItem('openRouterKey', newKey);
  };

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      <Head>
        <style>{`:root { --main-ui-color: ${uiColor}; }`}</style>
      </Head>

      <Meta />
      <Introduction
        openAiKey={openAiKey}
        onChangeAiKey={setOpenAiKey}
        elevenLabsKey={elevenLabsKey}
        onChangeElevenLabsKey={setElevenLabsKey}
      />
      
      {/* CORRECCIÓN VISUALIZACIÓN MÓVIL: El contenedor principal se ajusta a la altura dinámica del viewport */}
      <main
        className="flex flex-col items-center justify-start min-h-screen bg-gray-100"
        style={{ height: '100dvh' }}
      >
        <VrmViewer />
        <MessageInputContainer
          isChatProcessing={chatProcessing || isAISpeaking || isPlayingAudio}
          onChatProcessStart={handleSendChat}
          isUiVisible={isUiVisible}
        />

        <Menu
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
          onChangeKoeiroParam={setKoeiroParam}
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
          isUiVisible={isUiVisible}
        />

        {isUiVisible && <GitHubLink />}

        {errorDialog && (
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
