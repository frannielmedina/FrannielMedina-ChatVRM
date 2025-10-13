import React, { useState } from "react";
import { IconButton } from "./iconButton";
import { GeneralTab } from "./tabs/GeneralTab";
import { APITab } from "./tabs/APITab";
import { AIConfigTab } from "./tabs/AIConfigTab";
import { CustomizationTab } from "./tabs/CustomizationTab";
import { StreamingTab } from "./tabs/StreamingTab";
import { AboutTab } from "./tabs/AboutTab";
import { Message } from "@/features/messages/messages";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { KoeiroParam } from "@/features/constants/koeiroParam";

type TabType = 'general' | 'api' | 'ai-config' | 'customization' | 'streaming' | 'about';

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  systemPrompt: string;
  chatLog: Message[];
  elevenLabsParam: ElevenLabsParam;
  koeiroParam: KoeiroParam;
  onClickClose: () => void;
  onChangeAiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeOpenRouterKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (image: string) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
};

export const SettingsTabs = (props: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [streamerMode, setStreamerMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('streamerMode') === 'true';
    }
    return false;
  });

  const [uiColor, setUiColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('uiColor') || '#856292';
    }
    return '#856292';
  });

  const tabs: { id: TabType; label: string; disabled?: boolean }[] = [
    { id: 'general', label: 'General', disabled: streamerMode },
    { id: 'api', label: 'API', disabled: streamerMode },
    { id: 'ai-config', label: 'Configuración de IA' },
    { id: 'customization', label: 'Personalización' },
    { id: 'streaming', label: 'Transmisión' },
    { id: 'about', label: 'Acerca de' }
  ];

  const handleTabClick = (tabId: TabType, disabled?: boolean) => {
    if (!disabled) {
      setActiveTab(tabId);
    }
  };

  const handleStreamerModeChange = (enabled: boolean) => {
    setStreamerMode(enabled);
    localStorage.setItem('streamerMode', enabled.toString());
  };

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={props.onClickClose}
        />
      </div>
      
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-4xl mx-auto px-24 py-64">
          <div className="my-24 typography-32 font-bold">Configuración</div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-gray-200 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, tab.disabled)}
                disabled={tab.disabled}
                className={`px-4 py-2 rounded-t-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : tab.disabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  activeTab === tab.id && !tab.disabled
                    ? { backgroundColor: uiColor }
                    : {}
                }
              >
                {tab.label}
                {tab.disabled && ' 🔒'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'general' && <GeneralTab {...props} />}
            {activeTab === 'api' && <APITab {...props} />}
            {activeTab === 'ai-config' && (
              <AIConfigTab
                systemPrompt={props.systemPrompt}
                elevenLabsKey={props.elevenLabsKey}
                elevenLabsParam={props.elevenLabsParam}
                chatLog={props.chatLog}
                onChangeSystemPrompt={props.onChangeSystemPrompt}
                onChangeElevenLabsVoice={props.onChangeElevenLabsVoice}
                onClickResetSystemPrompt={props.onClickResetSystemPrompt}
                onClickResetChatLog={props.onClickResetChatLog}
                onChangeChatLog={props.onChangeChatLog}
              />
            )}
            {activeTab === 'customization' && (
              <CustomizationTab
                {...props}
                uiColor={uiColor}
                onChangeUiColor={setUiColor}
              />
            )}
            {activeTab === 'streaming' && (
              <StreamingTab
                {...props}
                streamerMode={streamerMode}
                onStreamerModeChange={handleStreamerModeChange}
              />
            )}
            {activeTab === 'about' && <AboutTab />}
          </div>
        </div>
      </div>
    </div>
  );
};
