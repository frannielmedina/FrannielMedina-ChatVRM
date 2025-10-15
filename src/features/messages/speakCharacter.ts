import { wait } from "@/utils/wait";
import { synthesizeVoice } from "../elevenlabs/elevenlabs";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";
import { ttsManager, TTSProvider } from "@/lib/ttsProviders";

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
        // pass along screenplay to change avatar expression
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
  // Obtener proveedor TTS seleccionado
  const ttsProvider = (localStorage.getItem('ttsProvider') as TTSProvider) || 'browser';
  
  // Configurar el proveedor según el seleccionado
  try {
    switch(ttsProvider) {
      case 'elevenlabs': {
        const elevenLabsKey = localStorage.getItem('elevenLabsKey') || '';
        if (!elevenLabsKey || elevenLabsKey.trim() === '') {
          console.log('ElevenLabs key not set, skipping audio');
          return null;
        }
        const voiceId = localStorage.getItem('elevenLabsVoiceId') || 'MF3mGyEYCl7XYWbV9V6O';
        
        // Usar el método original de ElevenLabs
        const ttsVoice = await synthesizeVoice(
          talk.message,
          talk.speakerX,
          talk.speakerY,
          talk.style,
          elevenLabsKey,
          { voiceId }
        );
        
        const url = ttsVoice.audio;
        if (!url) {
          throw new Error('No audio URL returned from ElevenLabs');
        }
        
        const resAudio = await fetch(url);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'koeiromap': {
        const koeiromapX = parseFloat(localStorage.getItem('koeiromapX') || '0');
        const koeiromapY = parseFloat(localStorage.getItem('koeiromapY') || '0');
        
        ttsManager.setProvider('koeiromap', { 
          speakerX: koeiromapX, 
          speakerY: koeiromapY 
        });
        
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'google': {
        const googleTTSKey = localStorage.getItem('googleTTSKey') || '';
        if (!googleTTSKey || googleTTSKey.trim() === '') {
          console.log('Google TTS key not set, skipping audio');
          return null;
        }
        
        ttsManager.setProvider('google', { 
          apiKey: googleTTSKey,
          language: 'en-US',
          pitch: 0,
          speed: 1.0
        });
        
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'azure': {
        const azureTTSKey = localStorage.getItem('azureTTSKey') || '';
        if (!azureTTSKey || azureTTSKey.trim() === '') {
          console.log('Azure TTS key not set, skipping audio');
          return null;
        }
        
        ttsManager.setProvider('azure', { 
          apiKey: azureTTSKey 
        });
        
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'silero': {
        ttsManager.setProvider('silero');
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'voicevox': {
        ttsManager.setProvider('voicevox');
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'coqui': {
        ttsManager.setProvider('coqui');
        const audioUrl = await ttsManager.synthesize(talk.message);
        const resAudio = await fetch(audioUrl);
        const buffer = await resAudio.arrayBuffer();
        return buffer;
      }

      case 'browser': {
        // Browser TTS no devuelve ArrayBuffer, se reproduce directamente
        ttsManager.setProvider('browser', {
          language: 'en-US',
          pitch: 1.0,
          speed: 1.0
        });
        
        // Iniciar reproducción (no hay buffer)
        await ttsManager.synthesize(talk.message);
        return null; // Browser TTS no necesita buffer
      }

      default: {
        console.log('Unknown TTS provider, using browser TTS');
        ttsManager.setProvider('browser');
        await ttsManager.synthesize(talk.message);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error with ${ttsProvider} TTS:`, error);
    // Fallback a browser TTS
    console.log('Falling back to browser TTS');
    try {
      ttsManager.setProvider('browser');
      await ttsManager.synthesize(talk.message);
    } catch (fallbackError) {
      console.error('Browser TTS fallback also failed:', fallbackError);
    }
    return null;
  }
};
