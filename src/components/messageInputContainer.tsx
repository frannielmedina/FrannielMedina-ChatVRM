// src/components/messageInputContainer.tsx

import React, { useState, useEffect, useCallback } from "react";
// Importamos IconButton que hemos corregido en el hilo anterior.
import { IconButton } from './iconButton'; 

// Definición de tipos para SpeechRecognition (para evitar errores de TypeScript)
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

// Extiende las props originales para incluir la visibilidad de la UI
type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
  isUiVisible: boolean; // Agregada desde tus requisitos anteriores
};

/**
 * Proporciona entrada de texto y entrada de voz.
 *
 * Envía automáticamente al finalizar el reconocimiento de voz e inhabilita
 * la entrada mientras se procesa la respuesta.
 */
export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
  isUiVisible,
}: Props) => {
  const [userMessage, setUserMessage] = useState("");
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition>();
  const [isMicRecording, setIsMicRecording] = useState(false);

  // Obtener el color de la UI para los IconButtons (usando variable CSS)
  const uiColor = "var(--main-ui-color)";
  
  // --- LÓGICA DE RECONOCIMIENTO DE VOZ (TU CÓDIGO ORIGINAL) ---

  // 音声認識の結果を処理する
  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setUserMessage(text);

      // 発言の終了時 (Al finalizar la emisión)
      if (event.results[0].isFinal) {
        // No es necesario actualizar setUserMessage de nuevo, pero lo conservo por tu código original
        setUserMessage(text); 
        // 返答文の生成を開始 (Iniciar generación de respuesta)
        onChatProcessStart(text);
      }
    },
    [onChatProcessStart]
  );

  // 無音が続いた場合も終了する (Finaliza si hay silencio)
  const handleRecognitionEnd = useCallback(() => {
    setIsMicRecording(false);
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (isMicRecording) {
      speechRecognition?.abort(); // Detener si ya está grabando
      setIsMicRecording(false);
      return;
    }
    
    // Solo comenzar si NO se está procesando el chat.
    if (!isChatProcessing) { 
        speechRecognition?.start();
        setIsMicRecording(true);
    }
  }, [isMicRecording, speechRecognition, isChatProcessing]);

  // --- LÓGICA DE ENTRADA DE TEXTO ---

  const handleClickSendButton = useCallback(() => {
    if (userMessage.trim() === '') return;
    onChatProcessStart(userMessage);
    setUserMessage(''); // Limpiar el input después de enviar
  }, [onChatProcessStart, userMessage]);
  
  const handleKeyDownUserMessage = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleClickSendButton();
      }
    },
    [handleClickSendButton]
  );
  
  const onChangeUserMessage = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setUserMessage(e.target.value),
    []
  );

  // --- EFECTO: Inicializar SpeechRecognition ---

  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    // FirefoxなどSpeechRecognition非対応環境対策 (Manejo de entornos sin soporte)
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }
    
    // Ya que estamos en un contenedor de Next.js/React, hay que asegurarse de no crear múltiples instancias
    if (speechRecognition) {
        speechRecognition.removeEventListener("result", handleRecognitionResult);
        speechRecognition.removeEventListener("end", handleRecognitionEnd);
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES"; // Cambié el idioma a español (puedes cambiarlo de vuelta a "ja-JP" si es necesario)
    recognition.interimResults = true; // 認識の途中結果を返す
    recognition.continuous = false; // 発言の終了時に認識を終了する

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    setSpeechRecognition(recognition);
    
    // Cleanup function
    return () => {
        recognition.removeEventListener("result", handleRecognitionResult);
        recognition.removeEventListener("end", handleRecognitionEnd);
    }
    
  }, [handleRecognitionResult, handleRecognitionEnd]);

  // Limpiar el mensaje de usuario cuando termina el procesamiento del chat
  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);
  
  // Detener la grabación si se inicia el procesamiento de chat por texto.
  useEffect(() => {
    if (isChatProcessing && isMicRecording) {
        speechRecognition?.abort();
        setIsMicRecording(false);
    }
  }, [isChatProcessing, isMicRecording, speechRecognition]);


  // --- RENDERIZADO DEL INPUT (Reemplazo de <MessageInput />) ---
  
  const isDisabled = isChatProcessing || isMicRecording;

  return (
    <div 
      className={`absolute bottom-0 z-10 w-full p-4 md:p-8 transition-opacity duration-500 ${
        isUiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} // Animación de Inactividad
    >
      <div className="mx-auto flex w-full max-w-lg items-end justify-center gap-4">
        
        {/* Botón de Micrófono */}
        <IconButton
            iconName={isMicRecording ? "24/MicFill" : "24/MicOutline"}
            isProcessing={false} // El micrófono tiene su propio estado visual
            onClick={handleClickMicButton}
            disabled={isChatProcessing} // No se puede iniciar el micrófono mientras el chat procesa
            color={uiColor}
            className="flex-shrink-0"
        />
        
        {/* Área de Texto y Botón de Enviar */}
        <div className="flex w-full items-end gap-2 bg-white p-2 rounded-xl shadow-lg">
          <textarea
            className="w-full bg-transparent resize-none h-10 p-2 text-gray-800 focus:outline-none"
            placeholder={isMicRecording ? "Escuchando..." : "Escribe un mensaje..."}
            rows={1}
            value={userMessage}
            onChange={onChangeUserMessage}
            onKeyDown={handleKeyDownUserMessage}
            disabled={isDisabled}
          />
          <IconButton
            iconName="24/Send"
            isProcessing={isChatProcessing}
            onClick={handleClickSendButton}
            // Deshabilitar si está procesando el chat o si el mensaje está vacío
            disabled={userMessage.trim() === '' || isDisabled} 
            color={uiColor}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};
