// src/pages/api/tts/voicevox.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const VOICEVOX_API_URL = 'https://deprecatedapis.tts.quest/v2/voicevox';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET' && req.query.action === 'speakers') {
    // Get speakers list
    try {
      console.log('[VOICEVOX API] Fetching speakers...');
      const response = await fetch(`${VOICEVOX_API_URL}/speakers`);
      
      if (!response.ok) {
        console.error(`[VOICEVOX API] Failed to fetch speakers: ${response.status}`);
        throw new Error(`Failed to fetch speakers: ${response.status}`);
      }

      const data = await response.json();
      console.log('[VOICEVOX API] Speakers fetched successfully');
      return res.status(200).json(data);
    } catch (error) {
      console.error('[VOICEVOX API] Error fetching speakers:', error);
      return res.status(500).json({ error: 'Failed to fetch speakers' });
    }
  }

  if (req.method === 'POST') {
    const { text, speakerId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    if (speakerId === undefined || speakerId === null) {
      return res.status(400).json({ error: 'Missing speakerId parameter' });
    }

    try {
      console.log(`[VOICEVOX API] Creating audio query for speaker ${speakerId}`);
      console.log(`[VOICEVOX API] Text: "${text.substring(0, 50)}..."`);

      // Step 1: Create audio query
      const queryUrl = `${VOICEVOX_API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
      console.log('[VOICEVOX API] Query URL:', queryUrl);

      const queryResponse = await fetch(queryUrl, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        console.error(`[VOICEVOX API] Query failed: ${queryResponse.status}`, errorText);
        throw new Error(`Failed to create audio query: ${queryResponse.status}`);
      }

      const audioQuery = await queryResponse.json();
      console.log('[VOICEVOX API] Audio query created successfully');

      // Step 2: Synthesize audio
      const synthesisUrl = `${VOICEVOX_API_URL}/synthesis?speaker=${speakerId}`;
      console.log('[VOICEVOX API] Synthesis URL:', synthesisUrl);

      const synthesisResponse = await fetch(synthesisUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQuery),
      });

      if (!synthesisResponse.ok) {
        const errorText = await synthesisResponse.text();
        console.error(`[VOICEVOX API] Synthesis failed: ${synthesisResponse.status}`, errorText);
        throw new Error(`Failed to synthesize audio: ${synthesisResponse.status}`);
      }

      const audioBuffer = await synthesisResponse.arrayBuffer();
      console.log(`[VOICEVOX API] Audio synthesized successfully (${audioBuffer.byteLength} bytes)`);
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', audioBuffer.byteLength.toString());
      return res.status(200).send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error('[VOICEVOX API] Error:', error);
      return res.status(500).json({ 
        error: 'Failed to synthesize audio',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};
