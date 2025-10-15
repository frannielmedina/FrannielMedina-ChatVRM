// src/features/koeiromap/koeiromap.ts

export interface KoeiromapParams {
  speakerX: number;
  speakerY: number;
}

const KOEIROMAP_API_URL = 'https://api.rinna.co.jp/models/cttse/koeiro';
const KOEIROMAP_FREE_URL = 'https://api.tts.quest/v3/koemotion/synthesis';

export async function synthesizeKoeiromap(
  text: string,
  params: KoeiromapParams,
  apiKey?: string
): Promise<string> {
  try {
    // Si no hay API key, usar el endpoint gratuito
    if (!apiKey || apiKey.trim() === '') {
      return await synthesizeKoeiromapFree(text, params);
    }

    // Usar el endpoint oficial con API key
    const response = await fetch(KOEIROMAP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify({
        text,
        speakerX: params.speakerX,
        speakerY: params.speakerY,
        style: 'talk',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize Koeiromap voice');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing Koeiromap voice:', error);
    // Fallback al endpoint gratuito
    return await synthesizeKoeiromapFree(text, params);
  }
}

async function synthesizeKoeiromapFree(
  text: string,
  params: KoeiromapParams
): Promise<string> {
  try {
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
      throw new Error('Failed to synthesize with free Koeiromap API');
    }

    const data = await response.json();
    
    // El API devuelve una URL o base64
    if (data.audio_url) {
      return data.audio_url;
    } else if (data.audio) {
      const audioBlob = base64ToBlob(data.audio, 'audio/wav');
      return URL.createObjectURL(audioBlob);
    }
    
    throw new Error('Invalid response from Koeiromap API');
  } catch (error) {
    console.error('Error with free Koeiromap API:', error);
    throw error;
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
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
}

export const KOEIROMAP_PRESETS = {
  cute: { speakerX: 1.32, speakerY: 1.88 },
  cool: { speakerX: -1.27, speakerY: 1.92 },
  energetic: { speakerX: 0.73, speakerY: -1.09 },
  calm: { speakerX: -0.89, speakerY: -2.6 },
};
