// src/features/sileroTTS/sileroTTS.ts

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
    console.log(`[Silero] Synthesizing with voice: ${voiceId} via proxy`);
    
    const response = await fetch('/api/tts/silero', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to synthesize: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log('[Silero] Audio generated successfully');
    
    return url;
  } catch (error) {
    console.error('[Silero] Error synthesizing:', error);
    throw error;
  }
}
