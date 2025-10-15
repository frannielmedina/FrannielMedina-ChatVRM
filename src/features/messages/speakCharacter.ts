// src/features/messages/speakCharacter.ts

import { wait } from "@/utils/wait";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay, Talk } from "./messages";
import { ttsManager } from "@/lib/ttsProviders";

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
  const ttsProvider = (localStorage.getItem('ttsProvider') || 'browser') as any;
  
  console.log(`[TTS] Using provider: ${ttsProvider}`);
  
  try {
    // Configurar el proveedor TTS
    switch(ttsProvider) {
      case 'elevenlabs': {
        const elevenLabsKey = localStorage.getItem('elevenLabsKey') || '';
        const voiceId = localStorage.getItem('elevenLabsVoiceId') || 'MF3mGyEYCl7XYWbV9V6O';
        
        if (!elevenLabsKey || elevenLabsKey.trim() === '') {
          console.log('[TTS] ElevenLabs key not set, skipping audio');
          return null;
        }
        
        console.log(`[TTS] ElevenLabs voice ID: ${voiceId}`);
        
        ttsManager.setProvider('elevenlabs', { 
          apiKey: elevenLabsKey,
          voiceId: voiceId
        });
        
        break;
      }

      case 'koeiromap': {
        const koeiromapX = parseFloat(localStorage.getItem('koeiromapX') || '0');
        const koeiromapY = parseFloat(localStorage.getItem('koeiromapY') || '0');
        const koeiromapKey = localStorage.getItem('koeiromapKey') || '';
        
        console.log(`[TTS] Koeiromap params: X=${koeiromapX}, Y=${koeiromapY}`);
        
        ttsManager.setProvider('koeiromap', { 
          apiKey: koeiromapKey,
          speakerX: koeiromapX, 
          speakerY: koeiromapY 
        });
        
        break;
      }

      case 'voicevox': {
        const speakerId = parseInt(localStorage.getItem('voicevoxSpeakerId') || '0');
        
        console.log(`[TTS] VOICEVOX speaker ID: ${speakerId}`);
        
        ttsManager.setProvider('voicevox', {
          speakerId: speakerId
        });
        
        break;
      }

      case 'google': {
        const googleTTSKey = localStorage.getItem('googleTTSKey') || '';
        
        if (!googleTTSKey || googleTTSKey.trim() === '') {
          console.log('[TTS] Google TTS key not set, skipping audio');
          return null;
        }
        
        ttsManager.setProvider('google', { 
          apiKey: googleTTSKey,
          language: 'en-US',
          pitch: 0,
          speed: 1.0
        });
        
        break;
      }

      case 'azure': {
        const azureTTSKey = localStorage.getItem('azureTTSKey') || '';
        
        if (!azureTTSKey || azureTTSKey.trim() === '') {
          console.log('[TTS] Azure TTS key not set, skipping audio');
          return null;
        }
        
        ttsManager.setProvider('azure', { 
          apiKey: azureTTSKey 
        });
        
        break;
      }

      case 'silero': {
        const voiceId = localStorage.getItem('sileroVoiceId') || 'en_0';
        
        console.log(`[TTS] Silero voice ID: ${voiceId}`);
        
        ttsManager.setProvider('silero', {
          voiceId: voiceId
        });
        
        break;
      }

      case 'coqui': {
        const modelId = localStorage.getItem('coquiModelId') || 'tts_models/en/ljspeech/tacotron2-DDC';
        
        console.log(`[TTS] Coqui model ID: ${modelId}`);
        
        ttsManager.setProvider('coqui', {
          voiceId: modelId
        });
        
        break;
      }

      case 'browser': {
        ttsManager.setProvider('browser', {
          language: 'en-US',
          pitch: 1.0,
          speed: 1.0
        });
        
        await ttsManager.synthesize(talk.message);
        return null;
      }

      default: {
        console.log('[TTS] Unknown provider, using browser TTS');
        ttsManager.setProvider('browser');
        await ttsManager.synthesize(talk.message);
        return null;
      }
    }

    // Sintetizar el audio
    const audioUrl = await ttsManager.synthesize(talk.message);
    
    // Si es browser TTS, ya se reprodujo directamente
    if (ttsProvider === 'browser' || !audioUrl) {
      return null;
    }
    
    // Convertir la URL a ArrayBuffer
    const response = await fetch(audioUrl);
    const buffer = await response.arrayBuffer();
    
    console.log(`[TTS] Audio generated successfully, buffer size: ${buffer.byteLength}`);
    
    return buffer;
    
  } catch (error) {
    console.error(`[TTS] Error with ${ttsProvider} TTS:`, error);
    
    // Fallback a browser TTS
    console.log('[TTS] Falling back to browser TTS');
    try {
      ttsManager.setProvider('browser');
      await ttsManager.synthesize(talk.message);
    } catch (fallbackError) {
      console.error('[TTS] Browser TTS fallback also failed:', fallbackError);
    }
    
    return null;
  }
};
