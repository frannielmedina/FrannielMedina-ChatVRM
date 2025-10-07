// src/components/iconButton.tsx

import React from 'react';
import { KnownIconType } from '@pixiv/qoish-icons/dist/types'; // Asegúrate que esta importación sea correcta
import { KnownIconType as BaseKnownIconType } from '@pixiv/qoish-icons'; // Asegúrate que esta importación sea correcta

// Componente dummy o Spinner que actúa como indicador de carga
const ProcessingIndicator = ({ color }: { color: string }) => (
  <div
    className="w-4 h-4 rounded-full animate-spin border-2 mr-2"
    style={{ borderTopColor: color, borderColor: 'transparent' }}
  ></div>
);

type KnownIconTypeFix = KnownIconType | (string & {}); // Fix para permitir cualquier string en el tipo KnownIconType
type KnownIconTypeUnion = keyof BaseKnownIconType | KnownIconTypeFix; // Unión de tipos para claridad

type Props = {
  iconName: KnownIconTypeUnion; // Acepta tipos conocidos O cualquier string
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
        // 👇 El tipo ya es compatible con 'string' debido a la corrección en 'Props'
        <pixiv-icon 
          name={iconName as KnownIconTypeUnion} // Ahora TS está feliz
          scale="1"
        ></pixiv-icon>
      )}
      {label && <div className="mx-4 font-M_PLUS_2 font-bold">{label}</div>}
    </button>
  );
};
