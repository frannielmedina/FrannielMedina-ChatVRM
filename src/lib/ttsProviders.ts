// src/lib/ttsProviders.ts

export type TTSProvider = 
  | 'elevenlabs'
  | 'koeiromap'
  | 'google'
  | 'silero'
  | 'voicevox'
  | 'coqui'
  | 'azure'
  | 'browser';

export type TTSConfig = {
  provider: TTSProvider;
  apiKey?: string;
  voiceId?: string;
  speakerX?: number;
  speakerY?: number;
  language?: string;
  pitch?: number;
  speed?: number;
};

export const TTS_PROVIDERS = [
  {
    id: 'elevenlabs' as TTSProvider,
    name: 'ElevenLabs',
    description: 'Alta calidad, voces naturales (Requiere API key)',
    requiresApiKey: true,
    isFree: false,
    quality: 5,
  },
  {
    id: 'koeiromap' as TTSProvider,
    name: 'Koeiromap',
    description: 'Voces estilo anime, gratis (Requiere API key)',
    requiresApiKey: true,
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
    id: 'silero' as TTSProvider,
    name: 'Silero TTS',
    description: 'Código abierto, completamente gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
  },
  {
    id: 'voicevox' as TTSProvider,
    name: 'VOICEVOX',
    description: 'Voces japonesas estilo anime, gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 4,
  },
  {
    id: 'coqui' as TTSProvider,
    name: 'Coqui TTS',
    description: 'Open source, multiidioma, gratis',
    requiresApiKey: false,
    isFree: true,
    quality: 3,
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

/**
 * Clase para manejar múltiples proveedores de TTS
 */
export class TTSManager {
  private currentProvider: TTSProvider = 'browser';
  private config: TTSConfig;

  constructor(config?: TTSConfig) {
    this.config = config || {
      provider: 'browser',
      language: 'en-US',
      pitch: 1.0,
      speed: 1.0,
    };
  }

  /**
   * Cambia el proveedor de TTS
   */
  setProvider(provider: TTSProvider, config?: Partial<TTSConfig>) {
    this.currentProvider = provider;
    this.config = { ...this.config, ...config, provider };
  }

  /**
   * Sintetiza voz usando el proveedor configurado
   */
  async synthesize(text: string): Promise<string> {
    switch (this.currentProvider) {
      case 'elevenlabs':
        return this.synthesizeElevenLabs(text);
      case 'koeiromap':
        return this.synthesizeKoeiromap(text);
      case 'google':
        return this.synthesizeGoogle(text);
      case 'silero':
        return this.synthesizeSilero(text);
      case 'voicevox':
        return this.synthesizeVoicevox(text);
      case 'coqui':
        return this.synthesizeCoqui(text);
      case 'azure':
        return this.synthesizeAzure(text);
      case 'browser':
        return this.synthesizeBrowser(text);
      default:
        return this.synthesizeBrowser(text);
    }
  }

  /**
   * ElevenLabs TTS (ya implementado)
   */
  private async synthesizeElevenLabs(text: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs requires API key');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId || 'MF3mGyEYCl7XYWbV9V6O'}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey,
        },
        body: JSON.stringify({ text }),
      }
    );

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Koeiromap TTS (ahora Koemotion)
   */
  private async synthesizeKoeiromap(text: string): Promise<string> {
    // Usar API de Koemotion (nuevo nombre de Koeiromap)
    const apiKey = this.config.apiKey || '';
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('Koemotion API key not set, using free endpoint');
      // Intentar con endpoint gratuito (puede no funcionar siempre)
      try {
        const response = await fetch('https://api.rinna.co.jp/models/cttse/koeiro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({
            text: text,
            speaker_x: this.config.speakerX || 0,
            speaker_y: this.config.speakerY || 0,
          }),
        });

        if (!response.ok) {
          throw new Error('Koemotion free endpoint failed');
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Koemotion error, falling back to browser TTS');
        throw error;
      }
    }

    // Con API key (versión de pago/trial)
    const response = await fetch('https://api.koemotion.rinna.co.jp/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: text,
        speaker_x: this.config.speakerX || 0,
        speaker_y: this.config.speakerY || 0,
        output_format: 'wav',
      }),
    });

    if (!response.ok) {
      throw new Error(`Koemotion API error: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Google Cloud TTS
   */
  private async synthesizeGoogle(text: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Google TTS requires API key');
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: this.config.language || 'en-US',
            name: 'en-US-Neural2-F',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: this.config.pitch || 0,
            speakingRate: this.config.speed || 1.0,
          },
        }),
      }
    );

    const data = await response.json();
    const audioContent = data.audioContent;
    const blob = this.base64ToBlob(audioContent, 'audio/mp3');
    return URL.createObjectURL(blob);
  }

  /**
   * Silero TTS (usando API pública)
   */
  private async synthesizeSilero(text: string): Promise<string> {
    // Usar la API de Hugging Face para Silero
    const response = await fetch(
      'https://api-inference.huggingface.co/models/snakers4/silero-models',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          options: {
            speaker: 'en_0',
            sample_rate: 48000,
          },
        }),
      }
    );

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * VOICEVOX TTS (actualizado con endpoint correcto)
   */
  private async synthesizeVoicevox(text: string): Promise<string> {
    try {
      // Usar la API de VOICEVOX Web
      // Primero crear audio query
      const speaker = 1; // Zundamon (puedes cambiar 0-46)
      
      const queryResponse = await fetch(
        `https://api.su-shiki.com/v2/voicevox/audio/?text=${encodeURIComponent(text)}&speaker=${speaker}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!queryResponse.ok) {
        throw new Error('VOICEVOX query failed');
      }

      const blob = await queryResponse.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('VOICEVOX error:', error);
      throw error;
    }
  }

  /**
   * Coqui TTS
   */
  private async synthesizeCoqui(text: string): Promise<string> {
    const response = await fetch('https://tts.coqui.ai/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        speaker_id: 'p225',
        style_wav: '',
        language_id: '',
      }),
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Azure TTS
   */
  private async synthesizeAzure(text: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Azure TTS requires API key');
    }

    const region = 'eastus'; // Cambiar según tu región
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' name='en-US-AriaNeural'>${text}</voice></speak>`,
      }
    );

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Browser TTS (Web Speech API)
   */
  private async synthesizeBrowser(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language || 'en-US';
      utterance.pitch = this.config.pitch || 1.0;
      utterance.rate = this.config.speed || 1.0;

      // Para Browser TTS, no hay URL de audio, se reproduce directamente
      utterance.onend = () => {
        resolve('browser-tts-played');
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Convierte base64 a Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// Instancia global
export const ttsManager = new TTSManager();
