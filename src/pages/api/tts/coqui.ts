// src/pages/api/tts/coqui.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const COQUI_API_URL = 'https://api.tts.quest/v1/coqui';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, modelId } = req.body;

  if (!text || !modelId) {
    return res.status(400).json({ error: 'Missing text or modelId' });
  }

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
      throw new Error(`Failed to synthesize: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', audioBuffer.byteLength.toString());
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error synthesizing Coqui:', error);
    return res.status(500).json({ error: 'Failed to synthesize audio' });
  }
}
