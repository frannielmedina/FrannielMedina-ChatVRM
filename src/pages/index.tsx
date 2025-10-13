import { useCallback, useContext, useEffect, useState } from "react";
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
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
import { ElevenLabsParam, DEFAULT_ELEVEN_LABS_PARAM } from "@/features/constants/elevenLabsParam";
import { buildUrl } from "@/utils/buildUrl";
import { websocketService } from '../services/websocketService';
import { MessageMiddleOut } from "@/features/messages/messageMiddleOut";
import { NotificationToast } from "@/components/NotificationToast";
import { useNotificationContainer } from "@/hooks/useNotification";

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
  const { notifications, removeNotification } = useNotificationContainer();

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
  const [openRouterKey, setOpenRouterKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('openRouterKey') || '';
    }
    return '';
  });

  // Apply UI color on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uiColor = localStorage.getItem('uiColor') || '#856292';
      document.documentElement.style.setProperty('--color-primary', uiColor);
    }
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt);
      setElevenLabsParam(params.elevenLabsParam);
      setChatLog(params.chatLog);
    }
    if (window.localStorage.getItem("elevenLabsKey")) {
      const key = window.localStorage.getItem("elevenLabsKey") as string;
      setElevenLabsKey(key);
    }
    const savedOpenRouterKey = localStorage.getItem('openRouterKey');
    if (savedOpenRouterKey) {
      setOpenRouterKey(savedOpenRouterKey);
    }
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() => {
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, elevenLabsParam, chatLog })
      );
      window.localStorage.setItem("elevenLabsKey", elevenLabsKey);
    });
  }, [systemPrompt, elevenLabsParam, chatLog]);

  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
    } else {
      document.body.style.backgroundImage = `url(${buildUrl("/bg-c.png")})`;
    }
  }, [backgroundImage]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });
      setChatLog(newChatLog);
    },
    [chatLog]
  );

  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      elevenLabsKey: string,
      elevenLabsParam: ElevenLabsParam,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      setIsAISpeaking(true);
      try {
        await speakCharacter(
          screenplay, 
          elevenLabsKey, 
          elevenLabsParam, 
          viewer, 
          () => {
            setIsPlayingAudio(true);
            console.log('audio playback started');
            onStart?.();
          }, 
          () => {
            setIsPlayingAudio(false);
            console.log('audio playback completed');
            onEnd?.();
          }
        );
      } catch (error) {
        console.error('Error during AI speech:', error);
      } finally {
        setIsAISpeaking(false);
      }
    },
    [viewer]
  );

  const handleSendChat = useCallback(
    async (text: string) => {
      const newMessage = text;
      if (newMessage == null) return;

      setChatProcessing(true);
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      const messageProcessor = new MessageMiddleOut();
      const processedMessages = messageProcessor.process([
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ]);

      let localOpenRouterKey = openRouterKey;
      if (!localOpenRouterKey) {
        localOpenRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY!;
      }

      // Get selected model
      const selectedModel = localStorage.getItem('selectedLLMModel') || 'google/gemini-2.0-flash-exp:free';

      const stream = await getChatResponseStream(
        processedMessages, 
        openAiKey, 
        localOpenRouterKey,
        selectedModel
      ).catch((e) => {
        console.error(e);
        return null;
      });
      
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
            console.log('tag:', tag);
          }

          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n.!?]|.{10,}[、,])/
          );
          
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            console.log('sentence:', sentence);

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
        reader.releaseLock();
      }

      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, openAiKey, elevenLabsKey, elevenLabsParam, openRouterKey]
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
      <Meta />
      <Introduction
        openAiKey={openAiKey}
        onChangeAiKey={setOpenAiKey}
        elevenLabsKey={elevenLabsKey}
        onChangeElevenLabsKey={setElevenLabsKey}
      />
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
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
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        backgroundImage={backgroundImage}
        onChangeBackgroundImage={setBackgroundImage}
        onTokensUpdate={handleTokensUpdate}
        onChatMessage={handleSendChat}
        onChangeOpenRouterKey={handleOpenRouterKeyChange}
      />
      <GitHubLink />
      
      {/* Notification Container */}
      <div className="fixed top-0 right-0 z-[100] p-4 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
