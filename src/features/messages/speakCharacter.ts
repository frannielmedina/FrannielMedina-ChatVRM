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
        console.error('[SPEAK] Error fetching audio:', error);
        return null;
      });
      
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(([audioBuffer]) => {
      onStart?.();
      if (!audioBuffer) {
        console.log('[SPEAK] No audio buffer, speaking without audio');
        return viewer.model?.speak(null, screenplay);
      }
      console.log('[SPEAK] Speaking with audio buffer');
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
  
  console.log('='.repeat(60));
  console.log(`[TTS] 🎤 Starting audio synthesis`);
  console.log(`[TTS] 📌 Provider: ${ttsProvider}`);
  console.log(`[TTS] 💬 Message: "${talk.message.substring(0, 50)}..."`);
  console.log('='.repeat(60));
  
  try {
    let audioUrl: string | null = null;

    switch(ttsProvider) {
      case 'elevenlabs': {
        console.log('[TTS] 🟣 Processing ElevenLabs...');
        const elevenLabsKey = localStorage.getItem('elevenLabsKey') || '';
        const voiceId = localStorage.getItem('elevenLabsVoiceId') || 'MF3mGyEYCl7XYWbV9V6O';
        
        if (!elevenLabsKey || elevenLabsKey.trim() === '') {
          console.warn('[TTS] ⚠️ ElevenLabs key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        console.log(`[TTS] ✓ Voice ID: ${voiceId}`);
        
        const result = await synthesizeElevenLabs(
          talk.message,
          talk.speakerX,
          talk.speakerY,
          talk.style,
          elevenLabsKey,
          { voiceId }
        );
        
        audioUrl = result.audio;
        console.log('[TTS] ✅ ElevenLabs audio URL generated');
        break;
      }

      case 'koeiromap': {
        console.log('[TTS] 🟢 Processing Koeiromap...');
        const koeiromapX = parseFloat(localStorage.getItem('koeiromapX') || '1.32');
        const koeiromapY = parseFloat(localStorage.getItem('koeiromapY') || '1.88');
        const koeiromapKey = localStorage.getItem('koeiromapKey') || '';
        
        console.log(`[TTS] ✓ Params: X=${koeiromapX}, Y=${koeiromapY}`);
        
        audioUrl = await synthesizeKoeiromap(
          talk.message,
          { speakerX: koeiromapX, speakerY: koeiromapY },
          koeiromapKey
        );
        
        console.log('[TTS] ✅ Koeiromap audio URL generated');
        break;
      }

      case 'voicevox': {
        console.log('[TTS] 🟡 Processing VOICEVOX...');
        const speakerId = parseInt(localStorage.getItem('voicevoxSpeakerId') || '0');
        
        console.log(`[TTS] ✓ Speaker ID: ${speakerId}`);
        
        audioUrl = await synthesizeVoicevox(talk.message, speakerId);
        
        console.log('[TTS] ✅ VOICEVOX audio URL generated');
        break;
      }

      case 'google': {
        console.log('[TTS] 🔵 Processing Google TTS...');
        const googleTTSKey = localStorage.getItem('googleTTSKey') || '';
        
        if (!googleTTSKey || googleTTSKey.trim() === '') {
          console.warn('[TTS] ⚠️ Google TTS key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        audioUrl = await synthesizeGoogleTTS(talk.message, googleTTSKey, {
          language: 'en-US',
          voice: 'en-US-Neural2-F',
          pitch: 0,
          speed: 1.0
        });
        
        console.log('[TTS] ✅ Google TTS audio URL generated');
        break;
      }

      case 'azure': {
        console.log('[TTS] 🔷 Processing Azure TTS...');
        const azureTTSKey = localStorage.getItem('azureTTSKey') || '';
        
        if (!azureTTSKey || azureTTSKey.trim() === '') {
          console.warn('[TTS] ⚠️ Azure TTS key not set, falling back to browser TTS');
          return await fallbackToBrowserTTS(talk.message);
        }
        
        audioUrl = await synthesizeAzureTTS(talk.message, azureTTSKey, {
          region: 'eastus',
          language: 'en-US',
          voice: 'en-US-JennyNeural'
        });
        
        console.log('[TTS] ✅ Azure TTS audio URL generated');
        break;
      }

      case 'silero': {
        console.log('[TTS] 🟠 Processing Silero...');
        const voiceId = localStorage.getItem('sileroVoiceId') || 'en_0';
        
        console.log(`[TTS] ✓ Voice ID: ${voiceId}`);
        
        audioUrl = await synthesizeSilero(talk.message, voiceId);
        
        console.log('[TTS] ✅ Silero audio URL generated');
        break;
      }

      case 'coqui': {
        console.log('[TTS] 🟤 Processing Coqui TTS...');
        const modelId = localStorage.getItem('coquiModelId') || 'tts_models/en/ljspeech/tacotron2-DDC';
        
        console.log(`[TTS] ✓ Model ID: ${modelId}`);
        
        audioUrl = await synthesizeCoqui(talk.message, modelId);
        
        console.log('[TTS] ✅ Coqui TTS audio URL generated');
        break;
      }

      case 'browser':
      default: {
        console.log('[TTS] 🌐 Using Browser TTS...');
        return await fallbackToBrowserTTS(talk.message);
      }
    }

    // Si no se generó URL, algo salió mal
    if (!audioUrl) {
      console.error('[TTS] ❌ No audio URL generated, falling back to browser TTS');
      return await fallbackToBrowserTTS(talk.message);
    }
    
    console.log('[TTS] 📥 Fetching audio from URL...');
    console.log('[TTS] URL:', audioUrl.substring(0, 100) + '...');
    
    // Convertir la URL a ArrayBuffer
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    console.log(`[TTS] ✅ Audio buffer created successfully!`);
    console.log(`[TTS] 📊 Buffer size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
    console.log('='.repeat(60));
    
    return buffer;
    
  } catch (error) {
    console.error('='.repeat(60));
    console.error(`[TTS] ❌ ERROR with ${ttsProvider} TTS:`);
    console.error(error);
    console.error('='.repeat(60));
    
    // Fallback a browser TTS
    console.log('[TTS] 🔄 Falling back to browser TTS...');
    return await fallbackToBrowserTTS(talk.message);
  }
};

// Helper function para browser TTS
async function fallbackToBrowserTTS(message: string): Promise<null> {
  console.log('[TTS] 🌐 Executing Browser TTS...');
  
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.error('[TTS] ❌ Browser TTS not supported in this browser');
      resolve(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      console.log('[TTS] ▶️ Browser TTS started');
    };

    utterance.onend = () => {
      console.log('[TTS] ✅ Browser TTS finished');
      resolve(null);
    };

    utterance.onerror = (error) => {
      console.error('[TTS] ❌ Browser TTS error:', error);
      resolve(null);
    };

    window.speechSynthesis.speak(utterance);
    console.log('[TTS] 🎤 Browser TTS utterance queued');
  });
}
