// src/lib/ttsProviders.ts

export type TTSProvider = 
  | 'elevenlabs'
  | 'koeiromap'
  | 'google'
  | 'voicevox'
  | 'azure'
  | 'browser'
  | 'silero' // <--- Añadido
  | 'coqui';  // <--- Añadido

// Clase TTSManager (Implementación mínima para pasar la compilación)
class TTSManager {
  private currentProvider: TTSProvider = 'browser';
  private providerConfig: any = {};

  setProvider(provider: TTSProvider, config: any = {}) {
    this.currentProvider = provider;
    this.providerConfig[provider] = config;
    console.log(`TTS Provider set to ${provider}`);
  }

  async synthesize(message: string): Promise<string> {
    // Lógica Placeholder
    if (this.currentProvider === 'browser') {
        return ''; // TTS del navegador no devuelve URL
    }
    return `/dummy-audio-${this.currentProvider}.mp3`; 
  }
}

// Exportar la instancia (Singleton)
export const ttsManager = new TTSManager();

// Metadatos de proveedores
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
  {
    id: 'silero' as TTSProvider,
    name: 'Silero',
    description: 'Framework TTS avanzado (generalmente usado vía backend propio)',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
  },
  {
    id: 'coqui' as TTSProvider,
    name: 'Coqui TTS',
    description: 'Motor de código abierto (generalmente usado vía backend propio)',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
  },
];
