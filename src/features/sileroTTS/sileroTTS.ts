// src/features/sileroTTS/sileroTTS.ts

// Silero TTS - usando un backend público/gratuito
const SILERO_API_URL = 'https://api.tts.quest/v1/silero';

export interface SileroVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export const SILERO_VOICES: SileroVoice[] = [
  { id: 'aidar', name: 'Aidar', language: 'ru', gender: 'male' },
  { id: 'baya', name: 'Baya', language: 'ru', gender: 'female' },
  { id: 'kseniya', name: 'Kseniya', language: 'ru', gender: 'female' },
  { id: 'xenia', name: 'Xenia', language: 'ru', gender: 'female' },
  { id: 'eugene', name: 'Eugene', language: 'ru', gender: 'male' },
  { id: 'en_0', name: 'English Female 1', language: 'en', gender: 'female' },
  { id: 'en_1', name: 'English Female 2', language: 'en', gender: 'female' },
  { id: 'en_2', name: 'English Male 1', language: 'en', gender: 'male' },
];

export async function synthesizeSilero(
  text: string,
  voiceId: string = 'en_0'
): Promise<string> {
  try {
    const response = await fetch(SILERO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker: voiceId,
        sample_rate: 48000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize Silero TTS');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing Silero TTS:', error);
    throw error;
  }
}
