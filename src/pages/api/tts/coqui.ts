// src/pages/api/tts/coqui.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const COQUI_API_URL = 'https://api.tts.quest/v1/coqui';

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

  const { text, modelId } = req.body;

  if (!text || !modelId) {
    return res.status(400).json({ error: 'Missing text or modelId' });
  }

  try {
    console.log(`[COQUI API] Synthesizing with model: ${modelId}`);
    console.log(`[COQUI API] Text: "${text.substring(0, 50)}..."`);

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
      const errorText = await response.text();
      console.error(`[COQUI API] Failed: ${response.status}`, errorText);
      throw new Error(`Failed to synthesize: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[COQUI API] Audio synthesized successfully (${audioBuffer.byteLength} bytes)`);
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error: any) {
    console.error('[COQUI API] Error:', error);
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
