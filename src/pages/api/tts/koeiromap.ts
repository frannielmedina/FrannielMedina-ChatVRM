// src/pages/api/tts/koeiromap.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const KOEIROMAP_API_URL = 'https://api.tts.quest/v3/koemotion/synthesis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { text, speakerX, speakerY } = req.body;

  if (!text || speakerX === undefined || speakerY === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    console.log(`[KOEIROMAP API] Synthesizing with X: ${speakerX}, Y: ${speakerY}`);
    console.log(`[KOEIROMAP API] Text: "${text.substring(0, 50)}..."`);

    const response = await fetch(KOEIROMAP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker_x: speakerX,
        speaker_y: speakerY,
        style: 'talk',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KOEIROMAP API] Failed: ${response.status}`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[KOEIROMAP API] Response received');

    // Si viene base64, convertirlo a buffer
    if (data.audio || data.audioContent) {
      const base64Audio = data.audio || data.audioContent;
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      
      console.log(`[KOEIROMAP API] Base64 audio converted (${audioBuffer.length} bytes)`);
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length.toString());
      return res.status(200).send(audioBuffer);
    }

    // Si viene URL, hacer fetch y retornar
    if (data.audio_url) {
      console.log('[KOEIROMAP API] Fetching from audio URL');
      const audioResponse = await fetch(data.audio_url);
      const audioBuffer = await audioResponse.arrayBuffer();
      
      console.log(`[KOEIROMAP API] Audio fetched (${audioBuffer.byteLength} bytes)`);
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    throw new Error('Invalid response format - no audio data found');
  } catch (error: any) {
    console.error('[KOEIROMAP API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to synthesize audio',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};
