// src/features/coquiTTS/coquiTTS.ts

// Coqui TTS - usando un backend público
const COQUI_API_URL = 'https://api.tts.quest/v1/coqui';

export interface CoquiVoice {
  id: string;
  name: string;
  language: string;
}

export const COQUI_VOICES: CoquiVoice[] = [
  { id: 'tts_models/en/ljspeech/tacotron2-DDC', name: 'English Female (Tacotron2)', language: 'en' },
  { id: 'tts_models/en/ljspeech/glow-tts', name: 'English Female (Glow-TTS)', language: 'en' },
  { id: 'tts_models/en/vctk/vits', name: 'English Multi-speaker (VITS)', language: 'en' },
  { id: 'tts_models/es/css10/vits', name: 'Spanish Female (VITS)', language: 'es' },
  { id: 'tts_models/fr/css10/vits', name: 'French Female (VITS)', language: 'fr' },
  { id: 'tts_models/de/thorsten/vits', name: 'German Male (VITS)', language: 'de' },
];

export async function synthesizeCoqui(
  text: string,
  modelId: string = 'tts_models/en/ljspeech/tacotron2-DDC'
): Promise<string> {
  try {
    const response = await fetch(COQUI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_name: modelId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize Coqui TTS');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing Coqui TTS:', error);
    throw error;
  }
}
