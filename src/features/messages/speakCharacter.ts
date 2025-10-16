// src/features/messages/speakCharacter.ts

import { wait } from "@/utils/wait";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay, Talk } from "./messages";
import { synthesizeVoice as synthesizeElevenLabs } from "../elevenlabs/elevenlabs";
import { synthesizeKoeiromap } from "../koeiromap/koeiromap";
import { synthesizeVoicevox } from "../voicevox/voicevox";
import { synthesizeGoogleTTS } from "../googleTTS/googleTTS";
import { synthesizeAzureTTS } from "../azureTTS/azureTTS";
import { synthesizeSilero } from "../sileroTTS/sileroTTS";
import { synthesizeCoqui } from "../coquiTTS/coquiTTS";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk).catch((error) => {
        console.error('Error fetching audio:', error);
        return null;
      });
      
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(([audioBuffer]) => {
      onStart?.();
      if (!audioBuffer) {
        return viewer.model?.speak(null, screenplay);
      }
      return viewer.model?.speak(audioBuffer, screenplay);
    });
    
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (talk: Talk): Promise<ArrayBuffer | null> => {
  const ttsProvider = (localStorage.getItem('ttsProvider') || 'browser') as string;
  
  console.log(`[TTS] Using provider: ${ttsProvider}`);
  
  try {
    let audioUrl: string | null = null;

    switch(ttsProvider) {
      case 'elevenlabs': {
        const elevenLabsKey = localStorage.getItem('elevenLabsKey') || '';
        const voiceId = localStorage.getItem('elevenLabsVoiceId') || 'MF3mGyEYCl7XYWbV9V6O';
        
        if (!elevenLabsKey || elevenLabsKey.trim() === '') {
          console.log('[TTS] ElevenLabs key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        console.log(`[TTS] ElevenLabs voice ID: ${voiceId}`);
        
        const result = await synthesizeElevenLabs(
          talk.message,
          talk.speakerX,
          talk.speakerY,
          talk.style,
          elevenLabsKey,
          { voiceId }
        );
        
        audioUrl = result.audio;
        break;
      }

      case 'koeiromap': {
        const koeiromapX = parseFloat(localStorage.getItem('koeiromapX') || '1.32');
        const koeiromapY = parseFloat(localStorage.getItem('koeiromapY') || '1.88');
        const koeiromapKey = localStorage.getItem('koeiromapKey') || '';
        
        console.log(`[TTS] Koeiromap params: X=${koeiromapX}, Y=${koeiromapY}`);
        
        audioUrl = await synthesizeKoeiromap(
          talk.message,
          { speakerX: koeiromapX, speakerY: koeiromapY },
          koeiromapKey
        );
        break;
      }

      case 'voicevox': {
        const speakerId = parseInt(localStorage.getItem('voicevoxSpeakerId') || '0');
        
        console.log(`[TTS] VOICEVOX speaker ID: ${speakerId}`);
        
        audioUrl = await synthesizeVoicevox(talk.message, speakerId);
        break;
      }

      case 'google': {
        const googleTTSKey = localStorage.getItem('googleTTSKey') || '';
        
        if (!googleTTSKey || googleTTSKey.trim() === '') {
          console.log('[TTS] Google TTS key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        audioUrl = await synthesizeGoogleTTS(talk.message, googleTTSKey, {
          language: 'en-US',
          voice: 'en-US-Neural2-F',
          pitch: 0,
          speed: 1.0
        });
        break;
      }

      case 'azure': {
        const azureTTSKey = localStorage.getItem('azureTTSKey') || '';
        
        if (!azureTTSKey || azureTTSKey.trim() === '') {
          console.log('[TTS] Azure TTS key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        audioUrl = await synthesizeAzureTTS(talk.message, azureTTSKey, {
          region: 'eastus',
          language: 'en-US',
          voice: 'en-US-JennyNeural'
        });
        break;
      }

      case 'silero': {
        const voiceId = localStorage.getItem('sileroVoiceId') || 'en_0';
        
        console.log(`[TTS] Silero voice ID: ${voiceId}`);
        
        audioUrl = await synthesizeSilero(talk.message, voiceId);
        break;
      }

      case 'coqui': {
        const modelId = localStorage.getItem('coquiModelId') || 'tts_models/en/ljspeech/tacotron2-DDC';
        
        console.log(`[TTS] Coqui model ID: ${modelId}`);
        
        audioUrl = await synthesizeCoqui(talk.message, modelId);
        break;
      }

      case 'browser':
      default: {
        console.log('[TTS] Using browser TTS');
        return await fallbackToBrowserTTS(talk.message);
      }
    }

    // Si es browser TTS, ya retornamos null arriba
    if (!audioUrl) {
      return null;
    }
    
    // Convertir la URL a ArrayBuffer
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    console.log(`[TTS] Audio generated successfully, buffer size: ${buffer.byteLength}`);
    
    return buffer;
    
  } catch (error) {
    console.error(`[TTS] Error with ${ttsProvider} TTS:`, error);
    
    // Fallback a browser TTS
    console.log('[TTS] Falling back to browser TTS');
    return await fallbackToBrowserTTS(talk.message);
  }
};

// Helper function para browser TTS
async function fallbackToBrowserTTS(message: string): Promise<null> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.error('[TTS] Browser TTS not supported');
      resolve(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    utterance.onend = () => {
      console.log('[TTS] Browser TTS finished');
      resolve(null);
    };

    utterance.onerror = (error) => {
      console.error('[TTS] Browser TTS error:', error);
      resolve(null);
    };

    window.speechSynthesis.speak(utterance);
  });
}
