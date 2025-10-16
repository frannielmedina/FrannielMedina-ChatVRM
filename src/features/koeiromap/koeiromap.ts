// src/features/koeiromap/koeiromap.ts

export interface KoeiromapParams {
  speakerX: number;
  speakerY: number;
}

export async function synthesizeKoeiromap(
  text: string,
  params: KoeiromapParams,
  apiKey?: string
): Promise<string> {
  console.log(`[Koeiromap] Synthesizing with X: ${params.speakerX}, Y: ${params.speakerY} via proxy`);
  console.log(`[Koeiromap] Text: ${text.substring(0, 50)}...`);
  
  try {
    const response = await fetch('/api/tts/koeiromap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speakerX: params.speakerX,
        speakerY: params.speakerY,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log('[Koeiromap] Audio generated successfully');
    
    return url;
  } catch (error) {
    console.error('[Koeiromap] Error synthesizing voice:', error);
    throw error;
  }
}

export const KOEIROMAP_PRESETS = {
  cute: { speakerX: 1.32, speakerY: 1.88 },
  cool: { speakerX: -1.27, speakerY: 1.92 },
  energetic: { speakerX: 0.73, speakerY: -1.09 },
  calm: { speakerX: -0.89, speakerY: -2.6 },
};
