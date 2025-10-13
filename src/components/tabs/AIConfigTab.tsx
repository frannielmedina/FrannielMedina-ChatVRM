import React, { useState, useEffect } from "react";
import { TextButton } from "../textButton";
import { getVoices } from "@/features/elevenlabs/elevenlabs";
import { ElevenLabsParam } from "@/features/constants/elevenLabsParam";
import { LLM_MODELS } from "@/lib/modelsList";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  systemPrompt: string;
  elevenLabsKey: string;
  elevenLabsParam: ElevenLabsParam;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeElevenLabsVoice: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onClickResetSystemPrompt: () => void;
};

export const AIConfigTab = (props: Props) => {
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedLLMModel') || 'google/gemini-2.0-flash-exp:free';
    }
    return 'google/gemini-2.0-flash-exp:free';
  });

  const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (props.elevenLabsKey) {
      getVoices(props.elevenLabsKey).then((data) => {
        const voices = data.voices;
        setElevenLabsVoices(voices);
      }).catch((error) => {
        console.error('Error fetching voices:', error);
        showNotification('Error al cargar las voces de ElevenLabs', 'error');
      });
    }
  }, [props.elevenLabsKey]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    localStorage.setItem('selectedLLMModel', newModel);
    showNotification(`Modelo cambiado a: ${LLM_MODELS.find(m => m.id === newModel)?.name}`, 'success');
  };

  return (
    <div className="space-y-8">
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
        <div className="my-16 typography-20 font-bold">Selección de Voz</div>
        <div className="my-8">
          Selecciona entre las voces disponibles en ElevenLabs (incluyendo voces personalizadas):
        </div>
        <select
          className="h-40 px-8 w-full bg-surface3 hover:bg-surface3-hover rounded-4"
          id="select-dropdown"
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
    </div>
  );
};
