import { Message } from "../messages/messages";

export async function getChatResponseStream(
  messages: Message[],
  modelName: string,
  openRouterKey: string
) {
  console.log('getChatResponseStream - Model:', modelName);

  // 🔹 Normalizar mensajes (role + content)
  const normalizedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  console.log("Messages enviados a OpenRouter:", JSON.stringify(normalizedMessages, null, 2));

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        if (!openRouterKey) {
          throw new Error("API_KEY_BLANK");
        }

        const OPENROUTER_API_KEY = openRouterKey;
        const YOUR_SITE_URL = 'https://chat-vrm-window.vercel.app/';
        const YOUR_SITE_NAME = 'ChatVRM';
        
        const generation = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": `${YOUR_SITE_URL}`,
            "X-Title": `${YOUR_SITE_NAME}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelName,
            messages: normalizedMessages, // 🔹 Siempre con role + content
            temperature: 0.7,
            max_tokens: 1024, // 🔹 antes 200 → ahora más seguro
            stream: true,
          })
        });

        if (!generation.ok) {
          const errorText = await generation.text();
          let errorMessage = `OpenRouter_API_Down, code: ${generation.status}, message: ${errorText}`;
          if (generation.status === 401 || generation.status === 403) {
            errorMessage = "OpenRouter 401/403: Unauthorized or Invalid Key";
          }
          throw new Error(errorMessage);
        }

        if (generation.body) {
          const reader = generation.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              let chunk = new TextDecoder().decode(value);
              let lines = chunk.split('\n');

              // Filtrar comentarios y [DONE]
              const SSE_COMMENT = ": OPENROUTER PROCESSING";
              lines = lines.filter((line) => 
                line.trim() !== "" &&
                !line.trim().startsWith(SSE_COMMENT) &&
                !line.trim().endsWith("data: [DONE]")
              );

              const dataLines = lines.filter(line => line.startsWith("data:"));

              const messages = dataLines.map(line => {
                const jsonStr = line.substring(5);
                return JSON.parse(jsonStr);
              });

              try {
                messages.forEach((message) => {
                  // 🔹 Compatibilidad con todos los modelos
                  const content = message.choices?.[0]?.delta?.content 
                                ?? message.choices?.[0]?.message?.content;

                  if (content) {
                    console.log("Stream chunk:", content); // 🔹 Debug
                    controller.enqueue(content);
                  }
                });
              } catch (error) {
                console.error('Error processing messages:', messages);
                throw new Error("Error parsing streamed response from OpenRouter");
              }
            }
          } catch (error) {
            console.error('Error reading the stream', error);
          } finally {
            reader.releaseLock();
          }
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
