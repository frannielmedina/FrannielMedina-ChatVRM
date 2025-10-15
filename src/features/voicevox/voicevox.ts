// src/features/voicevox/voicevox.ts (ARCHIVO COMPLETO)

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
    console.log('[VOICEVOX] Fetching speakers...');
    
    const response = await fetch(`${VOICEVOX_API_URL}/speakers`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const speakers = await response.json();
    console.log('[VOICEVOX] Found', speakers.length, 'speakers');
    
    return speakers;
  } catch (error) {
    console.error('[VOICEVOX] Error fetching speakers:', error);
    // Devolver speakers por defecto si falla
    return getDefaultSpeakers();
  }
}

function getDefaultSpeakers(): VoicevoxSpeaker[] {
  return [
    {
      id: 0,
      name: "四国めたん",
      styles: [
        { id: 0, name: "ノーマル" },
        { id: 6, name: "あまあま" },
        { id: 7, name: "ツンツン" },
        { id: 8, name: "セクシー" }
      ]
    },
    {
      id: 1,
      name: "ずんだもん",
      styles: [
        { id: 3, name: "ノーマル" },
        { id: 1, name: "あまあま" },
        { id: 7, name: "ツンツン" },
        { id: 5, name: "セクシー" }
      ]
    },
    {
      id: 2,
      name: "春日部つむぎ",
      styles: [
        { id: 8, name: "ノーマル" }
      ]
    },
    {
      id: 3,
      name: "雨晴はう",
      styles: [
        { id: 10, name: "ノーマル" }
      ]
    },
    {
      id: 4,
      name: "波音リツ",
      styles: [
        { id: 9, name: "ノーマル" }
      ]
    }
  ];
}

export async function synthesizeVoicevox(
  text: string,
  speakerId: number = 0
): Promise<string> {
  try {
    console.log(`[VOICEVOX] Synthesizing with speaker ID: ${speakerId}`);
    console.log(`[VOICEVOX] Text: ${text.substring(0, 50)}...`);
    
    // Step 1: Create audio query
    const queryResponse = await fetch(
      `${VOICEVOX_API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!queryResponse.ok) {
      throw new Error(`Failed to create audio query: ${queryResponse.status}`);
    }

    const audioQuery = await queryResponse.json();
    
    console.log('[VOICEVOX] Audio query created successfully');

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
      throw new Error(`Failed to synthesize audio: ${synthesisResponse.status}`);
    }

    const audioBlob = await synthesisResponse.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log('[VOICEVOX] Audio generated successfully');
    
    return url;
  } catch (error) {
    console.error('[VOICEVOX] Error synthesizing voice:', error);
    throw error;
  }
}
