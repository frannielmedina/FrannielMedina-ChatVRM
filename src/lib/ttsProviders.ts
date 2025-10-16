// src/lib/ttsProviders.ts

export type TTSProvider = 
  | 'elevenlabs'
  | 'koeiromap'
  | 'google'
  | 'voicevox'
  | 'azure'
  | 'browser'
  | 'silero'
  | 'coqui';

export interface TTSProviderConfig {
  apiKey?: string;
  speakerX?: number;
  speakerY?: number;
  language?: string;
  voice?: string;
  pitch?: number;
  speed?: number;
  region?: string;
  voiceId?: string;
  speakerId?: number;
}

export const TTS_PROVIDERS = [
  {
    id: 'elevenlabs' as TTSProvider,
    name: 'ElevenLabs',
    description: 'Alta calidad, voces naturales (Requiere API key y créditos)',
    requiresApiKey: true,
    isFree: false,
    quality: 5,
    hasVoiceSelection: true,
  },
  {
    id: 'koeiromap' as TTSProvider,
    name: 'Koeiromap',
    description: 'Voces estilo anime personalizables, completamente gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 4,
    hasVoiceSelection: false,
  },
  {
    id: 'voicevox' as TTSProvider,
    name: 'VOICEVOX',
    description: 'Voces japonesas estilo anime, completamente gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 4,
    hasVoiceSelection: true,
  },
  {
    id: 'google' as TTSProvider,
    name: 'Google Cloud TTS',
    description: 'Voces naturales multiidioma (Requiere API key)',
    requiresApiKey: true,
    isFree: false,
    quality: 4,
    hasVoiceSelection: true,
  },
  {
    id: 'azure' as TTSProvider,
    name: 'Azure TTS',
    description: 'Microsoft Azure, alta calidad (Requiere API key)',
    requiresApiKey: true,
    isFree: false,
    quality: 5,
    hasVoiceSelection: true,
  },
  {
    id: 'browser' as TTSProvider,
    name: 'Browser TTS',
    description: 'Síntesis nativa del navegador, siempre disponible',
    requiresApiKey: false,
    isFree: true,
    quality: 2,
    hasVoiceSelection: false,
  },
  {
    id: 'silero' as TTSProvider,
    name: 'Silero',
    description: 'Voces de alta calidad en múltiples idiomas',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
    hasVoiceSelection: true,
  },
  {
    id: 'coqui' as TTSProvider,
    name: 'Coqui TTS',
    description: 'Motor de código abierto multiidioma',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
    hasVoiceSelection: true,
  },
];
