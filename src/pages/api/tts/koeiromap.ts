// src/pages/api/tts/koeiromap.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const KOEIROMAP_API_URL = 'https://api.tts.quest/v3/koemotion/synthesis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, speakerX, speakerY } = req.body;

  if (!text || speakerX === undefined || speakerY === undefined) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Si viene base64, convertirlo a buffer
    if (data.audio || data.audioContent) {
      const base64Audio = data.audio || data.audioContent;
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.length.toString());
      return res.status(200).send(audioBuffer);
    }

    // Si viene URL, hacer fetch y retornar
    if (data.audio_url) {
      const audioResponse = await fetch(data.audio_url);
      const audioBuffer = await audioResponse.arrayBuffer();
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error synthesizing Koeiromap:', error);
    return res.status(500).json({ error: 'Failed to synthesize audio' });
  }
}
