// src/components/ChatLog.tsx
import { useEffect, useRef } from "react";
import { Message } from "@/features/messages/messages";

// CORRECCIÓN CLAVE: Añadir propiedades para control de visibilidad
type Props = {
  messages: Message[];
  isOpen: boolean;       // Nuevo: Controla si se muestra o no
  onClose: () => void;   // Nuevo: Función para cerrar el log
};

export const ChatLog = ({ messages, isOpen, onClose }: Props) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Efecto para hacer scroll al mensaje más reciente
  useEffect(() => {
    // Si el log está cerrado, no se hace nada.
    if (isOpen) {
      chatScrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [messages, isOpen]);
  
  // Si no está abierto, no renderiza nada.
  if (!isOpen) {
    return null;
  }

  // Se añaden estilos para:
  // 1. Ser un overlay de pantalla completa (fixed o absolute inset-0).
  // 2. Fondo semi-transparente (rgba(0, 0, 0, 0.5) o bg-black/50)
  return (
    // ⭐️ Contenedor principal: Overlay transparente ⭐️
    <div 
      className="absolute inset-0 z-40 p-4 md:p-8 flex flex-col items-center justify-start"
      // Fondo semi-transparente y efecto de desenfoque, ideal para streaming.
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose} // Cerrar al hacer clic fuera del contenido del log (en el fondo)
    >
      <div 
        // Contenedor interno: Se le pone un fondo blanco semi-transparente
        className="w-full max-w-lg flex flex-col h-[80%] mt-16 rounded-xl shadow-2xl bg-white/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el log
      >
        {/* Encabezado con título y botón de cierre */}
        <div className="flex justify-between items-center p-4 border-b border-gray-300/50 bg-white/90">
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

        {/* Historial de mensajes */}
        {/* Modificamos el div contenedor del historial para que sea scrollable y esté dentro del contenedor transparente */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter(msg => msg.role !== 'system') // ⭐️ Opcional: Ocultar mensajes de "system" en el log visible
            .map((msg, i) => (
              <div 
                key={i} 
                ref={messages.length - 1 === i ? chatScrollRef : null}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* ⭐️ Usamos el componente Chat existente pero le quitamos el div contenedor ya que Chat lo renderiza */}
                <Chat role={msg.role} message={msg.content} />
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
};

// Componente Chat modificado para que sea solo la burbuja
const Chat = ({ role, message }: { role: string; message: string }) => {
  const roleColor =
    role === "assistant" ? "bg-rose-100 text-gray-800" : "bg-amber-100 text-gray-800"; // Colores de las capturas
  const roleText = role === "assistant" ? "text-gray-800" : "text-gray-800"; // Mismo color para texto
  const offsetX = role === "user" ? "justify-end" : "justify-start"; // Usaremos esto para justificar en el padre
  
  // ⭐️ Eliminamos los divs de posicionamiento externo y simplificamos el diseño de las burbujas ⭐️
  return (
    <div className={`max-w-[80%] p-3 rounded-xl shadow-md ${roleColor}`}>
      <span className="font-semibold text-xs uppercase" style={{ color: role === 'user' ? '#D69E2E' : '#C53030' }}>
        {role === "assistant" ? "CHARACTER" : "YOU"}
      </span>
      <p className="mt-1 whitespace-pre-wrap typography-16 font-M_PLUS_2 font-bold">{message}</p>
    </div>
  );
};
