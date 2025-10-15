// src/features/voicevox/voicevox.ts

export interface VoicevoxSpeaker {
  id: number;
  name: string;
  styles: Array<{
    id: number;
    name: string;
  }>;
}

const VOICEVOX_API_URL = 'https://deprecatedapis.tts.quest/v2/voicevox';

export async function getVoicevoxSpeakers(): Promise<VoicevoxSpeaker[]> {
  try {
    const response = await fetch(`${VOICEVOX_API_URL}/speakers`);
    if (!response.ok) {
      throw new Error('Failed to fetch VOICEVOX speakers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching VOICEVOX speakers:', error);
    return [];
  }
}

export async function synthesizeVoicevox(
  text: string,
  speakerId: number = 0
): Promise<string> {
  try {
    // Step 1: Create audio query
    const queryResponse = await fetch(
      `${VOICEVOX_API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
      { method: 'POST' }
    );

    if (!queryResponse.ok) {
      throw new Error('Failed to create audio query');
    }

    const audioQuery = await queryResponse.json();

    // Step 2: Synthesize audio
    const synthesisResponse = await fetch(
      `${VOICEVOX_API_URL}/synthesis?speaker=${speakerId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQuery),
      }
    );

    if (!synthesisResponse.ok) {
      throw new Error('Failed to synthesize audio');
    }

    const audioBlob = await synthesisResponse.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing VOICEVOX voice:', error);
    throw error;
  }
}
