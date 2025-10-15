// src/components/tabs/AIConfigTab.tsx

import React, { useState, useEffect } from "react";
import { TextButton } from "../textButton";
import { getVoices } from "@/features/elevenlabs/elevenlabs";
import { getVoicevoxSpeakers, VoicevoxSpeaker } from "@/features/voicevox/voicevox";
import { SILERO_VOICES } from "@/features/sileroTTS/sileroTTS";
import { COQUI_VOICES } from "@/features/coquiTTS/coquiTTS";
import { KOEIROMAP_PRESETS } from "@/features/koeiromap/koeiromap";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { Message } from "@/features/messages/messages";
import { LLM_MODELS } from "@/lib/modelsList";
import { TTS_PROVIDERS, TTSProvider } from "@/lib/ttsProviders";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  systemPrompt: string;
  elevenLabsKey: string;
  elevenLabsParam: ElevenLabsParam;
  chatLog: Message[];
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickResetSystemPrompt: () => void;
  onClickResetChatLog: () => void;
  onChangeChatLog: (index: number, text: string) => void;
};

export const AIConfigTab = (props: Props) => {
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLLMModel') || 'google/gemini-2.0-flash-exp:free';
    }
    return 'google/gemini-2.0-flash-exp:free';
  });

  const [selectedTTSProvider, setSelectedTTSProvider] = useState<TTSProvider>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ttsProvider') as TTSProvider) || 'browser';
    }
    return 'browser';
  });

  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const [voicevoxSpeakers, setVoicevoxSpeakers] = useState<VoicevoxSpeaker[]>([]);
  
  const [selectedVoicevoxSpeaker, setSelectedVoicevoxSpeaker] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('voicevoxSpeakerId') || '0');
    }
    return 0;
  });

  const [selectedSileroVoice, setSelectedSileroVoice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sileroVoiceId') || 'en_0';
    }
    return 'en_0';
  });

  const [selectedCoquiModel, setSelectedCoquiModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('coquiModelId') || 'tts_models/en/ljspeech/tacotron2-DDC';
    }
    return 'tts_models/en/ljspeech/tacotron2-DDC';
  });

  const [selectedKoeiromapPreset, setSelectedKoeiromapPreset] = useState('cute');

  const { showNotification } = useNotification();

  // Cargar voces de ElevenLabs
  useEffect(() => {
    if (props.elevenLabsKey && selectedTTSProvider === 'elevenlabs') {
      getVoices(props.elevenLabsKey).then((data) => {
        const voices = data.voices;
        setElevenLabsVoices(voices);
      }).catch((error) => {
        console.error('Error fetching ElevenLabs voices:', error);
        showNotification('Error al cargar las voces de ElevenLabs', 'error');
      });
    }
  }, [props.elevenLabsKey, selectedTTSProvider]);

  // Cargar speakers de VOICEVOX
  useEffect(() => {
    if (selectedTTSProvider === 'voicevox') {
      getVoicevoxSpeakers().then((speakers) => {
        setVoicevoxSpeakers(speakers);
      }).catch((error) => {
        console.error('Error fetching VOICEVOX speakers:', error);
        showNotification('Error al cargar los speakers de VOICEVOX', 'error');
      });
    }
  }, [selectedTTSProvider]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    localStorage.setItem('selectedLLMModel', newModel);
    showNotification(`Modelo cambiado a: ${LLM_MODELS.find(m => m.id === newModel)?.name}`, 'success');
  };

  const handleTTSProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as TTSProvider;
    setSelectedTTSProvider(newProvider);
    localStorage.setItem('ttsProvider', newProvider);
    
    const providerInfo = TTS_PROVIDERS.find(p => p.id === newProvider);
    showNotification(`TTS cambiado a: ${providerInfo?.name}`, 'success');
  };

  const handleVoicevoxSpeakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeakerId = parseInt(e.target.value);
    setSelectedVoicevoxSpeaker(newSpeakerId);
    localStorage.setItem('voicevoxSpeakerId', newSpeakerId.toString());
    showNotification('Speaker de VOICEVOX actualizado', 'success');
  };

  const handleSileroVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceId = e.target.value;
    setSelectedSileroVoice(newVoiceId);
    localStorage.setItem('sileroVoiceId', newVoiceId);
    showNotification('Voz de Silero actualizada', 'success');
  };

  const handleCoquiModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    setSelectedCoquiModel(newModelId);
    localStorage.setItem('coquiModelId', newModelId);
    showNotification('Modelo de Coqui actualizado', 'success');
  };

  const handleKoeiromapPresetChange = (presetName: string) => {
    const preset = KOEIROMAP_PRESETS[presetName as keyof typeof KOEIROMAP_PRESETS];
    setSelectedKoeiromapPreset(presetName);
    localStorage.setItem('koeiromapX', preset.speakerX.toString());
    localStorage.setItem('koeiromapY', preset.speakerY.toString());
    showNotification(`Preset de Koeiromap aplicado: ${presetName}`, 'success');
  };

  const selectedProviderInfo = TTS_PROVIDERS.find(p => p.id === selectedTTSProvider);

  return (
    <div className="space-y-8">
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Proveedor de Síntesis de Voz (TTS)</div>
        <select
          className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4 mb-4"
          value={selectedTTSProvider}
          onChange={handleTTSProviderChange}
        >
          {TTS_PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name} {provider.isFree ? '(Gratis)' : '(Premium)'} - {'⭐'.repeat(provider.quality)}
            </option>
          ))}
        </select>
        
        {selectedProviderInfo && (
          <div className={`p-4 rounded-4 mb-4 ${
            selectedProviderInfo.isFree ? 'bg-green-50 border border-green-300' : 'bg-blue-50 border border-blue-300'
          }`}>
            <div className={`text-sm font-bold mb-1 ${
              selectedProviderInfo.isFree ? 'text-green-900' : 'text-blue-900'
            }`}>
              {selectedProviderInfo.isFree ? '✅ Gratis' : '💎 Premium'}
            </div>
            <div className={`text-sm ${
              selectedProviderInfo.isFree ? 'text-green-800' : 'text-blue-800'
            }`}>
              {selectedProviderInfo.description}
            </div>
            {selectedProviderInfo.requiresApiKey && (
              <div className="text-xs text-yellow-700 mt-2">
                ⚠️ Requiere configurar API key en la pestaña API
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600 p-3 bg-purple-50 border border-purple-300 rounded-4">
          💡 <strong>Recomendaciones:</strong><br />
          • <strong>Browser TTS:</strong> Siempre disponible, calidad básica<br />
          • <strong>VOICEVOX:</strong> Excelente para voces estilo anime<br />
          • <strong>Koeiromap:</strong> Voces anime personalizables, gratis<br />
          • <strong>ElevenLabs:</strong> La mejor calidad, pero requiere créditos
        </div>
      </div>

      {/* Selección de voz según el proveedor */}
      {selectedTTSProvider === 'elevenlabs' && (
        <div className="my-24">
          <div className="my-16 typography-20 font-bold">Selección de Voz (ElevenLabs)</div>
          <div className="my-8">
            Selecciona entre las voces disponibles en ElevenLabs:
          </div>
          <select
            className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
            onChange={props.onChangeElevenLabsVoice}
            value={props.elevenLabsParam.voiceId}
            disabled={!props.elevenLabsKey || elevenLabsVoices.length === 0}
          >
            {elevenLabsVoices.length === 0 && (
              <option value="">Configura tu API key de ElevenLabs primero</option>
            )}
            {elevenLabsVoices.map((voice, index) => (
              <option key={index} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
          {!props.elevenLabsKey && (
            <div className="text-sm text-yellow-700 mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-4">
              ⚠️ Por favor configura tu API key de ElevenLabs en la pestaña API para ver las voces disponibles.
            </div>
          )}
        </div>
      )}

      {selectedTTSProvider === 'voicevox' && (
        <div className="my-24">
          <div className="my-16 typography-20 font-bold">Selección de Speaker (VOICEVOX)</div>
          <select
            className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
            value={selectedVoicevoxSpeaker}
            onChange={handleVoicevoxSpeakerChange}
          >
            {voicevoxSpeakers.map((speaker) => (
              <optgroup key={speaker.id} label={speaker.name}>
                {speaker.styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {speaker.name} - {style.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="text-sm text-gray-600 mt-2">
            VOICEVOX ofrece múltiples voces estilo anime japonesas de alta calidad.
          </div>
        </div>
      )}

      {selectedTTSProvider === 'silero' && (
        <div className="my-24">
          <div className="my-16 typography-20 font-bold">Selección de Voz (Silero)</div>
          <select
            className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
            value={selectedSileroVoice}
            onChange={handleSileroVoiceChange}
          >
            {SILERO_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} ({voice.language}) - {voice.gender}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 mt-2">
            Silero ofrece voces de alta calidad en múltiples idiomas.
          </div>
        </div>
      )}

      {selectedTTSProvider === 'coqui' && (
        <div className="my-24">
          <div className="my-16 typography-20 font-bold">Selección de Modelo (Coqui TTS)</div>
          <select
            className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
            value={selectedCoquiModel}
            onChange={handleCoquiModelChange}
          >
            {COQUI_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} ({voice.language})
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 mt-2">
            Coqui TTS es un motor de código abierto con múltiples modelos disponibles.
          </div>
        </div>
      )}

      {selectedTTSProvider === 'koeiromap' && (
        <div className="my-24">
          <div className="my-16 typography-20 font-bold">Presets de Voz (Koeiromap)</div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(KOEIROMAP_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handleKoeiromapPresetChange(key)}
                className={`p-4 rounded-8 border-2 transition-all hover:scale-105 ${
                  selectedKoeiromapPreset === key
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="font-bold capitalize">{key}</div>
                <div className="text-xs text-gray-600">
                  X: {preset.speakerX.toFixed(2)}, Y: {preset.speakerY.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Koeiromap permite ajustar la voz mediante coordenadas X e Y. Estos presets ofrecen configuraciones comunes.
          </div>
        </div>
      )}

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Modelo de Lenguaje</div>
        <select
          className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
          value={selectedModel}
          onChange={handleModelChange}
        >
          {LLM_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} {model.free ? '(Free)' : ''}
            </option>
          ))}
        </select>
        <div className="text-sm text-gray-600 mt-2 p-3 bg-green-50 border border-green-300 rounded-4">
          ℹ️ <strong>Free</strong> indica que no se te consumirán los créditos al usar los modelos de lenguaje gratuitos de OpenRouter.
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">
          Configuración del Personaje (System Prompt)
        </div>
        <div className="my-8">
          <TextButton onClick={props.onClickResetSystemPrompt}>
            Restablecer configuración del personaje
          </TextButton>
        </div>
        <textarea
          value={props.systemPrompt}
          onChange={props.onChangeSystemPrompt}
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full font-mono text-sm"
          placeholder="Define la personalidad y comportamiento de tu personaje..."
        />
        <div className="text-sm text-gray-600 mt-2">
          El System Prompt define cómo se comportará tu personaje IA. Describe su personalidad, 
          forma de hablar y cualquier característica especial que desees que tenga.
        </div>
      </div>

      <div className="my-24 p-4 bg-blue-50 border border-blue-300 rounded-4">
        <div className="typography-16 font-bold text-blue-900 mb-2">
          💡 Consejos para un mejor System Prompt
        </div>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>Sé específico sobre la personalidad del personaje</li>
          <li>Define el tono de voz (formal, casual, amigable, etc.)</li>
          <li>Menciona cualquier conocimiento especializado que deba tener</li>
          <li>Establece límites sobre lo que puede o no puede discutir</li>
        </ul>
      </div>

      {props.chatLog.length > 0 && (
        <div className="my-40">
          <div className="my-8 grid-cols-2">
            <div className="my-16 typography-20 font-bold">Historial de Conversación</div>
            <TextButton onClick={props.onClickResetChatLog}>
              Restablecer historial de conversación
            </TextButton>
          </div>
          <div className="my-8">
            {props.chatLog.map((value, index) => {
              return (
                <div
                  key={index}
                  className="my-8 grid grid-flow-col grid-cols-[min-content_1fr] gap-x-fixed"
                >
                  <div className="w-[64px] py-8">
                    {value.role === "assistant" ? "Character" : "You"}
                  </div>
                  <input
                    key={index}
                    className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                    type="text"
                    value={value.content}
                    onChange={(event) => {
                      props.onChangeChatLog(index, event.target.value);
                    }}
                  ></input>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
