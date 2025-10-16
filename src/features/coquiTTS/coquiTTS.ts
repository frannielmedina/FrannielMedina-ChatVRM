// src/features/coquiTTS/coquiTTS.ts

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
    console.log(`[Coqui] Synthesizing with model: ${modelId} via proxy`);
    
    const response = await fetch('/api/tts/coqui', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        modelId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to synthesize: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log('[Coqui] Audio generated successfully');
    
    return url;
  } catch (error) {
    console.error('[Coqui] Error synthesizing:', error);
    throw error;
  }
}
