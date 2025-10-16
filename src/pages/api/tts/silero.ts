// src/pages/api/tts/silero.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const SILERO_API_URL = 'https://api.tts.quest/v1/silero';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Missing text or voiceId' });
  }

  try {
    const response = await fetch(SILERO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        speaker: voiceId,
        sample_rate: 48000,
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
    console.error('Error synthesizing Silero:', error);
    return res.status(500).json({ error: 'Failed to synthesize audio' });
  }
}
