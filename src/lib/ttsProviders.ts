// src/lib/ttsProviders.ts

export type TTSProvider = 
  | 'elevenlabs'
  | 'koeiromap'
  | 'google'
  | 'voicevox'
  | 'azure'
  | 'browser';

// --- NUEVA CLASE TTSManager ---
class TTSManager {
  private currentProvider: TTSProvider = 'browser';
  private providerConfig: any = {}; // Para guardar configuraciones como keys/voces

  setProvider(provider: TTSProvider, config: any = {}) {
    this.currentProvider = provider;
    this.providerConfig[provider] = config;
    console.log(`TTS Provider set to ${provider}`);
  }

  async synthesize(message: string): Promise<string> {
    // ESTO ES UN PLACEHOLDER.
    // Aquí deberías implementar la lógica para llamar al proveedor TTS actual.
    
    if (this.currentProvider === 'browser') {
        // En un caso real, la implementación de browser TTS
        // probablemente llamaría a window.speechSynthesis
        console.log(`Browser TTS synthesizing: ${message}`);
        return ''; // El TTS del navegador no devuelve URL
    }
    
    // Para otros proveedores que devuelven URL de audio
    console.log(`Synthesizing via ${this.currentProvider}: ${message}`);
    
    // Devolver una URL dummy o lógica de API aquí
    return `/dummy-audio-${this.currentProvider}.mp3`; 
  }
}

// Exportar la instancia única para que pueda ser utilizada como un singleton.
export const ttsManager = new TTSManager();

// --- El array de metadatos se mantiene ---
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
