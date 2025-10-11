// src/components/ChatLog.tsx
import { useEffect, useRef } from "react";
import { Message } from "@/features/messages/messages";

type Props = {
  messages: Message[];
  isOpen: boolean;       
  onClose: () => void;   
};

export const ChatLog = ({ messages, isOpen, onClose }: Props) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Efecto para hacer scroll al mensaje más reciente
  useEffect(() => {
    if (isOpen) {
      chatScrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [messages, isOpen]);
  
  if (!isOpen) {
    return null;
  }

  return (
    // ⭐️ Contenedor principal: Overlay de pantalla completa con z-index alto ⭐️
    <div 
      className="fixed inset-0 z-40 p-4 md:p-8 flex flex-col items-center justify-start"
      // Estilo para el fondo semi-transparente y blur (como overlay de stream)
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div 
        // Contenedor interno del log: Fondo claro, altura limitada y scroll
        className="w-full max-w-lg flex flex-col h-[80%] mt-16 rounded-xl shadow-2xl bg-white/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Encabezado con título y botón de cierre */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white/90 sticky top-0">
          <h2 className="text-xl font-bold" style={{ color: 'var(--main-ui-color)' }}>
            Registro de Conversación
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition text-gray-700"
            aria-label="Cerrar registro de conversación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Historial de mensajes Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter(msg => msg.role !== 'system')
            .map((msg, i) => (
              <div 
                key={i} 
                // Añadimos la clase de alineación al div padre para controlar la posición
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                ref={messages.length - 1 === i ? chatScrollRef : null}
              >
                <Chat role={msg.role} message={msg.content} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

// ⭐️ COMPONENTE CHAT MODIFICADO PARA EL ESTILO DE LA CAPTURA ⭐️
const Chat = ({ role, message }: { role: string; message: string }) => {
  // Ajustamos los colores y estilos para emular la burbuja de la captura.
  
  const isAssistant = role === "assistant";
  
  // Colores principales de la burbuja (fondo y borde superior)
  const headerBgColor = isAssistant ? "bg-pink-600" : "bg-orange-400"; // Tonos intensos para el encabezado
  const headerTextColor = "text-white"; 
  
  // Colores del cuerpo del mensaje
  const bodyBgColor = "bg-white";
  const bodyTextColor = isAssistant ? "text-pink-600" : "text-orange-400"; // Color del texto es el mismo que el header/burbuja

  // Alineación dentro de su contenedor.
  const alignment = isAssistant ? "pr-0" : "pl-0";

  return (
    // Se mantiene la estructura de dos bloques para el estilo que quieres.
    <div className={`mx-auto max-w-[80%] my-0 ${alignment}`}>
      
      {/* Bloque superior (YOU / CHARACTER) */}
      <div
        className={`px-3 py-1 rounded-t-lg font-Montserrat font-bold tracking-wider text-sm shadow-md ${headerBgColor} ${headerTextColor}`}
      >
        {isAssistant ? "CHARACTER" : "YOU"}
      </div>
      
      {/* Bloque inferior (Mensaje) */}
      <div className={`px-3 py-2 ${bodyBgColor} rounded-b-lg shadow-md`}>
        <div className={`typography-16 font-M_PLUS_2 font-bold whitespace-pre-wrap ${bodyTextColor}`}>
          {message}
        </div>
      </div>
    </div>
  );
};
