// src/features/elevenlabs/elevenlabs.ts

import { ElevenLabsParam } from "../constants/elevenLabsParam";
import { TalkStyle } from "../messages/messages";
import axios from 'axios';
import { ElevenLabsClient } from "elevenlabs";

export async function synthesizeVoice(
  message: string,
  speaker_x: number,
  speaker_y: number,
  style: TalkStyle,
  elevenLabsKey: string,
  elevenLabsParam: ElevenLabsParam
) {
  const API_KEY = elevenLabsKey;
  const VOICE_ID = elevenLabsParam.voiceId;

  console.log('[ElevenLabs] Synthesizing with voice_id:', VOICE_ID);
  console.log('[ElevenLabs] Message:', message.substring(0, 50) + '...');

  try {
    const options = {
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: 'audio/mpeg',
        'content-type': 'application/json',
        'xi-api-key': `${API_KEY}`,
      },
      data: {
        text: message,
        model_id: 'eleven_multilingual_v2', // ✅ CORREGIDO: Cambio de v1 a v2
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      responseType: 'arraybuffer' as const,
    };

    const speechDetails = await axios.request(options);
    const data = speechDetails.data;
    
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    console.log('[ElevenLabs] Audio generated successfully');

    return {
      audio: url
    };
  } catch (error) {
    console.error('[ElevenLabs] Error synthesizing voice:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid ElevenLabs API key');
      } else if (error.response?.status === 404) {
        throw new Error('Voice ID not found. Please select a valid voice.');
      } else if (error.response?.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded. Please try again later.');
      }
    }
    
    throw error;
  }
}

export async function getVoices(elevenLabsKey: string) {
  console.log('[ElevenLabs] Fetching available voices...');
  
  try {
    const client = new ElevenLabsClient({ apiKey: elevenLabsKey });
    const voices = await client.voices.getAll();
    
    console.log('[ElevenLabs] Found', voices.voices.length, 'voices');
    
    return voices;
  } catch (error) {
    console.error('[ElevenLabs] Error fetching voices:', error);
    throw error;
  }
}
