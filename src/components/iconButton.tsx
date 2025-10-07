// src/components/iconButton.tsx

import React, { ButtonHTMLAttributes } from "react";
// Importamos el tipo KnownIconType de tu librería original
import { KnownIconType } from "@charcoal-ui/icons"; 

// 1. Definimos un tipo para el nombre del ícono que acepta:
//    a) Las claves conocidas (oficiales)
//    b) Cualquier string & {} (permite cualquier otra cadena de texto, como "24/MicFill")
type CustomIconName = keyof KnownIconType | (string & {}); 

// Componente dummy o Spinner que actúa como indicador de carga (Necesario para el estado isProcessing)
const ProcessingIndicator = ({ color }: { color: string }) => (
  <div
    className="w-4 h-4 rounded-full animate-spin border-2 mr-2"
    // El color de borde superior usa el color principal, el resto es transparente
    style={{ borderTopColor: color, borderColor: 'transparent' }}
  ></div>
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  iconName: CustomIconName; // Usamos el tipo corregido
  isProcessing: boolean;
  label?: string;
  // Añadimos 'color' y 'onClick' para compatibilidad con MessageInputContainer
  color?: string; // Para aplicar el color dinámico de la UI
  onClick: () => void; // Hacemos onClick obligatorio como en la implementación anterior
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  color = 'var(--main-ui-color)', // Usamos la variable CSS global
  disabled = false,
  onClick,
  className = '', // Para asegurar que className exista
  ...rest
}: Props) => {
  const finalColor = color;
  const opacity = disabled ? 'opacity-50' : 'opacity-100';

  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={disabled}
      // Aplicamos el color dinámico y las clases necesarias
      className={`flex items-center justify-center p-3 rounded-xl shadow-md transition-all duration-200 ${opacity} ${className}`}
      style={{ backgroundColor: finalColor, color: '#ffffff' }}
    >
      {isProcessing ? (
        <ProcessingIndicator color="#ffffff" />
      ) : (
        // Forzamos el tipo 'as string' para que el web component lo acepte sin error de TS
        <pixiv-icon name={iconName as string} scale="1"></pixiv-icon>
      )}
      {label && <div className="mx-4 font-M_PLUS_2 font-bold">{label}</div>}
    </button>
  );
};
