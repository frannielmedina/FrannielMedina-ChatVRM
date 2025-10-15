// src/lib/ttsProviders.ts

export type TTSProvider = 
  | 'elevenlabs'
  | 'koeiromap'
  | 'google'
  | 'voicevox'
  | 'azure'
  | 'browser';

export const TTS_PROVIDERS = [
  {
    id: 'elevenlabs' as TTSProvider,
    name: 'ElevenLabs',
    description: 'Alta calidad, voces naturales (Requiere API key y créditos)',
    requiresApiKey: true,
    isFree: false,
    quality: 5,
  },
  {
    id: 'koeiromap' as TTSProvider,
    name: 'Koeiromap',
    description: 'Voces estilo anime personalizables, completamente gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 4,
  },
  {
    id: 'voicevox' as TTSProvider,
    name: 'VOICEVOX',
    description: 'Voces japonesas estilo anime, completamente gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 4,
  },
  {
    id: 'google' as TTSProvider,
    name: 'Google Cloud TTS',
    description: 'Voces naturales multiidioma (Requiere API key)',
    requiresApiKey: true,
    isFree: false,
    quality: 4,
  },
  {
    id: 'azure' as TTSProvider,
    name: 'Azure TTS',
    description: 'Microsoft Azure, alta calidad (Requiere API key)',
    requiresApiKey: true,
    isFree: false,
    quality: 5,
  },
  {
    id: 'browser' as TTSProvider,
    name: 'Browser TTS',
    description: 'Síntesis nativa del navegador, siempre disponible',
    requiresApiKey: false,
    isFree: true,
    quality: 2,
  },
];
