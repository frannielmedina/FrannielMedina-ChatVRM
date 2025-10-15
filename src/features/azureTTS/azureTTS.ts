// src/features/azureTTS/azureTTS.ts

export interface AzureTTSVoice {
  Name: string;
  DisplayName: string;
  LocalName: string;
  ShortName: string;
  Gender: string;
  Locale: string;
}

export interface AzureTTSParams {
  region?: string;
  language?: string;
  voice?: string;
  pitch?: string;
  rate?: string;
}

export async function getAzureTTSVoices(
  apiKey: string,
  region: string = 'eastus'
): Promise<AzureTTSVoice[]> {
  try {
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Azure TTS voices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Azure TTS voices:', error);
    return [];
  }
}

export async function synthesizeAzureTTS(
  text: string,
  apiKey: string,
  params: AzureTTSParams = {}
): Promise<string> {
  try {
    const {
      region = 'eastus',
      language = 'en-US',
      voice = 'en-US-JennyNeural',
      pitch = '+0Hz',
      rate = '+0%',
    } = params;

    // Construir SSML
    const ssml = `
      <speak version='1.0' xml:lang='${language}'>
        <voice name='${voice}'>
          <prosody pitch='${pitch}' rate='${rate}'>
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to synthesize Azure TTS');
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error synthesizing Azure TTS:', error);
    throw error;
  }
}
