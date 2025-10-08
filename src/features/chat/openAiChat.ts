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
      // Definir la función para liberar recursos de manera limpia
      const cleanup = (reader: ReadableStreamDefaultReader | null) => {
        if (reader) {
          try {
            reader.releaseLock();
          } catch (_) {
            // Ignorar errores al liberar el lock
          }
        }
        controller.close();
      };

      let reader: ReadableStreamDefaultReader | null = null;
      
      try {
        if (!openRouterKey) {
          throw new Error("API_KEY_BLANK");
        }

        const OPENROUTER_API_KEY = openRouterKey;
        // Estas variables DEBEN ser pasadas o definidas globalmente/en .env para OpenRouter.
        // Asumo que 'https://chat-vrm-window.vercel.app/' es tu URL real o un placeholder.
        const YOUR_SITE_URL = 'https://chat-vrm-window.vercel.app/';
        const YOUR_SITE_NAME = 'ChatVRM';
        
        const generation = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            // Requerido por OpenRouter
            "HTTP-Referer": `${YOUR_SITE_URL}`, 
            "X-Title": `${YOUR_SITE_NAME}`, 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelName,
            messages: normalizedMessages, // 🔹 Siempre con role + content
            temperature: 0.7,
            max_tokens: 1024,
            stream: true,
          })
        });

        if (!generation.ok) {
          const errorText = await generation.text();
          let errorMessage = `OpenRouter_API_Down, code: ${generation.status}, message: ${errorText}`;
          if (generation.status === 401 || generation.status === 403) {
            errorMessage = "OpenRouter 401/403: Unauthorized or Invalid Key";
          } else if (generation.status === 429) {
            errorMessage = "OpenRouter 429: Rate Limit Exceeded";
          }
          throw new Error(errorMessage);
        }

        if (generation.body) {
          reader = generation.body.getReader();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            let chunk = new TextDecoder().decode(value);
            let lines = chunk.split('\n');

            // 💡 Filtrar comentarios de OpenRouter y la marca de finalización
            lines = lines.filter((line) => 
              line.trim() !== "" &&
              !line.trim().startsWith(": OPENROUTER PROCESSING") &&
              !line.trim().endsWith("data: [DONE]")
            );

            const dataLines = lines.filter(line => line.startsWith("data:"));

            const messages = dataLines.map(line => {
              const jsonStr = line.substring(5);
              return JSON.parse(jsonStr);
            });

            try {
              messages.forEach((message) => {
                // 🔹 Compatibilidad con todos los modelos:
                // Busca el contenido en delta (para el streaming) o en message (para el final chunk)
                const content = message.choices?.[0]?.delta?.content 
                              ?? message.choices?.[0]?.message?.content;

                if (content) {
                  // console.log("Stream chunk:", content); // Debug
                  controller.enqueue(content);
                }
              });
            } catch (error) {
              console.error('Error processing messages:', messages, error);
              // Podrías encolar un mensaje de error al usuario aquí si lo deseas
              // controller.enqueue("[Error en el stream: contactar al desarrollador]");
              throw new Error("Error parsing streamed response from OpenRouter");
            }
          }
        }
      } catch (error) {
        // Capturar errores de la llamada fetch o de la lógica
        controller.error(error);
      } finally {
        cleanup(reader);
      }
    },
  });

  return stream;
}
