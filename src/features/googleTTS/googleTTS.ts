// src/features/googleTTS/googleTTS.ts

export interface GoogleTTSVoice {
  languageCodes: string[];
  name: string;
  ssmlGender: string;
  naturalSampleRateHertz: number;
}

export interface GoogleTTSParams {
  language?: string;
  voice?: string;
  pitch?: number;
  speed?: number;
}

const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1';

export async function getGoogleTTSVoices(apiKey: string): Promise<GoogleTTSVoice[]> {
  try {
    const response = await fetch(
      `${GOOGLE_TTS_API_URL}/voices?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Google TTS voices');
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching Google TTS voices:', error);
    return [];
  }
}

export async function synthesizeGoogleTTS(
  text: string,
  apiKey: string,
  params: GoogleTTSParams = {}
): Promise<string> {
  try {
    const {
      language = 'en-US',
      voice = 'en-US-Neural2-F',
      pitch = 0,
      speed = 1.0,
    } = params;

    const response = await fetch(
      `${GOOGLE_TTS_API_URL}/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language,
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch,
            speakingRate: speed,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to synthesize Google TTS');
    }

    const data = await response.json();
    
    // El audio viene en base64
    const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing Google TTS:', error);
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
