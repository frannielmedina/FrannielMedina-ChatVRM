// src/components/messageInputContainer.tsx

import React, { useState, useCallback } from 'react';
import { useSpeak } from '@/features/messages/useSpeak'; // Asume que tienes este hook
import { IconButton } from './iconButton'; // Asume que tienes este componente

type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
  isUiVisible: boolean; // <-- NUEVO PROP: Para la animación de inactividad
};

export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
  isUiVisible,
}: Props) => {
  const [chatText, setChatText] = useState('');
  const [isMicProcessing, setIsMicProcessing] = useState(false);
  
  // Asume que useSpeak maneja la grabación de voz y devuelve funciones para iniciar/detener.
  // Si no tienes este hook, el código de voz no funcionará.
  const { startRecording, stopRecording } = useSpeak();
  
  // Obtener el color de la UI para los IconButtons (usando variable CSS)
  const uiColor = "var(--main-ui-color)";

  const handleChatTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChatText(event.target.value);
    },
    []
  );

  const handleSend = useCallback(() => {
    if (chatText.trim() === '') return;
    onChatProcessStart(chatText);
    setChatText('');
  }, [chatText, onChatProcessStart]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  
  const handleMicClick = useCallback(async () => {
    if (isMicProcessing) {
      // Detener grabación
      setIsMicProcessing(false);
      const text = await stopRecording();
      if (text && text.trim() !== '') {
        onChatProcessStart(text);
      }
    } else {
      // Iniciar grabación
      setIsMicProcessing(true);
      await startRecording();
    }
  }, [isMicProcessing, onChatProcessStart, startRecording, stopRecording]);


  return (
    <div 
      className={`absolute bottom-0 z-10 w-full p-4 md:p-8 transition-opacity duration-500 ${
        isUiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} // <-- Animación de Inactividad
    >
      <div className="mx-auto flex w-full max-w-lg items-end justify-center gap-4">
        
        {/* Botón de Micrófono (Solo visible si no hay chat en curso) */}
        {!isChatProcessing && (
          <IconButton
            iconName={isMicProcessing ? "24/MicFill" : "24/MicOutline"}
            isProcessing={isMicProcessing}
            onClick={handleMicClick}
            disabled={isChatProcessing}
            color={uiColor}
            className="flex-shrink-0"
          />
        )}
        
        {/* Área de Texto y Botón de Enviar */}
        <div className="flex w-full items-end gap-2 bg-white p-2 rounded-xl shadow-lg">
          <textarea
            className="w-full bg-transparent resize-none h-10 p-2 text-gray-800 focus:outline-none"
            placeholder="Escribe un mensaje..."
            rows={1}
            value={chatText}
            onChange={handleChatTextChange}
            onKeyDown={handleKeyDown}
            disabled={isChatProcessing || isMicProcessing}
          />
          <IconButton
            iconName="24/Send"
            isProcessing={isChatProcessing}
            onClick={handleSend}
            disabled={chatText.trim() === '' || isChatProcessing || isMicProcessing}
            color={uiColor}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
