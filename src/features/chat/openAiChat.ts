import { Message } from "../messages/messages";

export async function getChatResponse(messages: Message[], apiKey: string) {
  throw new Error("Not implemented");
}

export async function getChatResponseStream(
  messages: Message[],
  apiKey: string,
  openRouterKey: string,
  modelId?: string
) {
  console.log('getChatResponseStream');
  console.log('messages', messages);
  console.log('model', modelId);

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        const OPENROUTER_API_KEY = openRouterKey;
        const YOUR_SITE_URL = 'https://chat-vrm-window.vercel.app/';
        const YOUR_SITE_NAME = 'ChatVRM';

        // Use provided model or default
        const selectedModel = modelId || 'google/gemini-2.0-flash-exp:free';

        let isStreamed = false;
        const generation = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": `${YOUR_SITE_URL}`,
            "X-Title": `${YOUR_SITE_NAME}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": selectedModel,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 200,
            "stream": true,
          })
        });

        if (generation.body) {
          const reader = generation.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              let chunk = new TextDecoder().decode(value);
              let lines = chunk.split('\n');

              const SSE_COMMENT = ": OPENROUTER PROCESSING";

              lines = lines.filter((line) => !line.trim().startsWith(SSE_COMMENT));
              lines = lines.filter((line) => !line.trim().endsWith("data: [DONE]"));

              const dataLines = lines.filter(line => line.startsWith("data:"));

              const messages = dataLines.map(line => {
                const jsonStr = line.substring(5);
                return JSON.parse(jsonStr);
              });

              try {
                messages.forEach((message) => {
                  const content = message.choices[0].delta.content;
                  controller.enqueue(content);
                });
              } catch (error) {
                console.log('error processing messages:', messages);
                throw error;
              }

              isStreamed = true;
            }
          } catch (error) {
            console.error('Error reading the stream', error);
          } finally {
            reader.releaseLock();
          }
        }

        if (!isStreamed) {
          console.error('Streaming not supported! Need to handle this case.');
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}
