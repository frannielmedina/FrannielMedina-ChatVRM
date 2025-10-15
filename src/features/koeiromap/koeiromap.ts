// src/features/koeiromap/koeiromap.ts (ARCHIVO COMPLETO)

export interface KoeiromapParams {
  speakerX: number;
  speakerY: number;
}

const KOEIROMAP_FREE_URL = 'https://api.tts.quest/v3/koemotion/synthesis';

export async function synthesizeKoeiromap(
  text: string,
  params: KoeiromapParams,
  apiKey?: string
): Promise<string> {
  console.log(`[Koeiromap] Synthesizing with X: ${params.speakerX}, Y: ${params.speakerY}`);
  console.log(`[Koeiromap] Text: ${text.substring(0, 50)}...`);
  
  try {
    // Siempre usar el endpoint gratuito ya que es más confiable
    const response = await fetch(KOEIROMAP_FREE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker_x: params.speakerX,
        speaker_y: params.speakerY,
        style: 'talk',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('[Koeiromap] Response received');
    
    // El API puede devolver una URL o base64
    if (data.audio_url) {
      console.log('[Koeiromap] Audio URL received');
      return data.audio_url;
    } else if (data.audio) {
      console.log('[Koeiromap] Base64 audio received, converting to blob');
      const audioBlob = base64ToBlob(data.audio, 'audio/wav');
      return URL.createObjectURL(audioBlob);
    } else if (data.audioContent) {
      console.log('[Koeiromap] audioContent received, converting to blob');
      const audioBlob = base64ToBlob(data.audioContent, 'audio/wav');
      return URL.createObjectURL(audioBlob);
    }
    
    throw new Error('Invalid response from Koeiromap API - no audio data found');
  } catch (error) {
    console.error('[Koeiromap] Error synthesizing voice:', error);
    throw error;
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  } catch (error) {
    console.error('[Koeiromap] Error converting base64 to blob:', error);
    throw error;
  }
}

export const KOEIROMAP_PRESETS = {
  cute: { speakerX: 1.32, speakerY: 1.88 },
  cool: { speakerX: -1.27, speakerY: 1.92 },
  energetic: { speakerX: 0.73, speakerY: -1.09 },
  calm: { speakerX: -0.89, speakerY: -2.6 },
};
