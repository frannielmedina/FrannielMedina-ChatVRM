// src/components/iconButton.tsx

import React from 'react';
// Importación simplificada de tipos. Si esto falla, el paquete no está instalado correctamente.
import { KnownIconType } from '@pixiv/qoish-icons'; 

// El tipo CustomIconName permite que el desarrollador use cualquier string,
// incluso si no está en la lista oficial de KnownIconType.
type CustomIconName = KnownIconType | (string & {}); 

// Componente dummy o Spinner que actúa como indicador de carga
const ProcessingIndicator = ({ color }: { color: string }) => (
  <div
    className="w-4 h-4 rounded-full animate-spin border-2 mr-2"
    style={{ borderTopColor: color, borderColor: 'transparent' }}
  ></div>
);

type Props = {
  // Ahora iconName puede ser un KnownIconType o cualquier otra cadena de texto (string).
  iconName: CustomIconName; 
  isProcessing: boolean;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  className?: string; // Para Tailwind custom
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  onClick,
  disabled = false,
  color = 'var(--main-ui-color)',
  className = '',
}: Props) => {
  const finalColor = color;
  const opacity = disabled ? 'opacity-50' : 'opacity-100';

  return (
    <button
      className={`flex items-center justify-center p-3 rounded-xl shadow-md transition-all duration-200 ${opacity} ${className}`}
      style={{ backgroundColor: finalColor, color: '#ffffff' }}
      onClick={onClick}
      disabled={disabled}
    >
      {isProcessing ? (
        <ProcessingIndicator color="#ffffff" />
      ) : (
        // Forzamos el tipo 'as string' para garantizar que el componente DOM acepte la cadena.
        // Esto es necesario porque 'pixiv-icon' es un elemento personalizado no conocido por React/TS.
        <pixiv-icon 
          name={iconName as string} 
          scale="1"
        ></pixiv-icon>
      )}
      {label && <div className="mx-4 font-M_PLUS_2 font-bold">{label}</div>}
    </button>
  );
};
