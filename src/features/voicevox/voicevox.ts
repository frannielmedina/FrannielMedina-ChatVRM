// src/features/voicevox/voicevox.ts

export interface VoicevoxSpeaker {
  id: number;
  name: string;
  styles: Array<{
    id: number;
    name: string;
  }>;
}

export async function getVoicevoxSpeakers(): Promise<VoicevoxSpeaker[]> {
  try {
    console.log('[VOICEVOX] Fetching speakers via proxy...');
    
    const response = await fetch('/api/tts/voicevox?action=speakers');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const speakers = await response.json();
    console.log('[VOICEVOX] Found', speakers.length, 'speakers');
    
    return speakers;
  } catch (error) {
    console.error('[VOICEVOX] Error fetching speakers:', error);
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
    console.log(`[VOICEVOX] Synthesizing with speaker ID: ${speakerId} via proxy`);
    console.log(`[VOICEVOX] Text: ${text.substring(0, 50)}...`);
    
    const response = await fetch('/api/tts/voicevox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speakerId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to synthesize: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log('[VOICEVOX] Audio generated successfully');
    
    return url;
  } catch (error) {
    console.error('[VOICEVOX] Error synthesizing voice:', error);
    throw error;
  }
}
