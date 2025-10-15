// src/lib/ttsProviders.ts

import { synthesizeVoice as synthesizeElevenLabs } from '@/features/elevenlabs/elevenlabs';
import { synthesizeKoeiromap } from '@/features/koeiromap/koeiromap';
import { synthesizeVoicevox } from '@/features/voicevox/voicevox';
import { synthesizeGoogleTTS } from '@/features/googleTTS/googleTTS';
import { synthesizeAzureTTS } from '@/features/azureTTS/azureTTS';
import { synthesizeSilero } from '@/features/sileroTTS/sileroTTS';
import { synthesizeCoqui } from '@/features/coquiTTS/coquiTTS';

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

class TTSManager {
  private currentProvider: TTSProvider = 'browser';
  private providerConfig: Record<string, TTSProviderConfig> = {};

  setProvider(provider: TTSProvider, config: TTSProviderConfig = {}) {
    this.currentProvider = provider;
    this.providerConfig[provider] = config;
    console.log(`TTS Provider set to ${provider}`, config);
  }

  async synthesize(message: string): Promise<string> {
    const config = this.providerConfig[this.currentProvider] || {};

    try {
      switch (this.currentProvider) {
        case 'elevenlabs': {
          const apiKey = config.apiKey || localStorage.getItem('elevenLabsKey') || '';
          const voiceId = config.voiceId || localStorage.getItem('elevenLabsVoiceId') || 'MF3mGyEYCl7XYWbV9V6O';
          
          if (!apiKey || apiKey.trim() === '') {
            throw new Error('ElevenLabs API key not configured');
          }

          const result = await synthesizeElevenLabs(
            message,
            config.speakerX || 0,
            config.speakerY || 0,
            'talk',
            apiKey,
            { voiceId }
          );
          
          return result.audio;
        }

        case 'koeiromap': {
          const koeiromapKey = config.apiKey || localStorage.getItem('koeiromapKey') || '';
          const speakerX = config.speakerX ?? parseFloat(localStorage.getItem('koeiromapX') || '0');
          const speakerY = config.speakerY ?? parseFloat(localStorage.getItem('koeiromapY') || '0');
          
          return await synthesizeKoeiromap(
            message,
            { speakerX, speakerY },
            koeiromapKey
          );
        }

        case 'voicevox': {
          const speakerId = config.speakerId ?? parseInt(localStorage.getItem('voicevoxSpeakerId') || '0');
          return await synthesizeVoicevox(message, speakerId);
        }

        case 'google': {
          const apiKey = config.apiKey || localStorage.getItem('googleTTSKey') || '';
          
          if (!apiKey || apiKey.trim() === '') {
            throw new Error('Google TTS API key not configured');
          }

          return await synthesizeGoogleTTS(message, apiKey, {
            language: config.language || 'en-US',
            voice: config.voice || 'en-US-Neural2-F',
            pitch: config.pitch || 0,
            speed: config.speed || 1.0,
          });
        }

        case 'azure': {
          const apiKey = config.apiKey || localStorage.getItem('azureTTSKey') || '';
          
          if (!apiKey || apiKey.trim() === '') {
            throw new Error('Azure TTS API key not configured');
          }

          return await synthesizeAzureTTS(message, apiKey, {
            region: config.region || 'eastus',
            language: config.language || 'en-US',
            voice: config.voice || 'en-US-JennyNeural',
          });
        }

        case 'silero': {
          const voiceId = config.voiceId || localStorage.getItem('sileroVoiceId') || 'en_0';
          return await synthesizeSilero(message, voiceId);
        }

        case 'coqui': {
          const modelId = config.voiceId || localStorage.getItem('coquiModelId') || 'tts_models/en/ljspeech/tacotron2-DDC';
          return await synthesizeCoqui(message, modelId);
        }

        case 'browser': {
          // Browser TTS es síncrono y no devuelve URL
          return await this.synthesizeBrowser(message, config);
        }

        default:
          throw new Error(`Unknown TTS provider: ${this.currentProvider}`);
      }
    } catch (error) {
      console.error(`Error with ${this.currentProvider} TTS:`, error);
      throw error;
    }
  }

  private async synthesizeBrowser(message: string, config: TTSProviderConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Browser TTS not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = config.language || 'en-US';
      utterance.pitch = config.pitch || 1.0;
      utterance.rate = config.speed || 1.0;

      utterance.onend = () => resolve('');
      utterance.onerror = (error) => reject(error);

      window.speechSynthesis.speak(utterance);
    });
  }

  getCurrentProvider(): TTSProvider {
    return this.currentProvider;
  }
}

export const ttsManager = new TTSManager();

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
