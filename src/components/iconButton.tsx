// src/components/iconButton.tsx

import React, { ButtonHTMLAttributes } from "react";
import { KnownIconType } from "@charcoal-ui/icons"; 

// CORRECCIÓN: Usamos un tipo de unión para permitir los tipos conocidos O cualquier string.
// El tipo 'string & {}' es la forma de hacer que cualquier string sea compatible con el tipo de unión.
type CustomIconName = keyof KnownIconType | (string & {}); 

// Componente dummy o Spinner que actúa como indicador de carga
const ProcessingIndicator = ({ color }: { color: string }) => (
  <div
    className="w-4 h-4 rounded-full animate-spin border-2 mr-2"
    style={{ borderTopColor: color, borderColor: 'transparent' }}
  ></div>
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  // Utilizamos el tipo de unión que permite cualquier string.
  iconName: CustomIconName; 
  isProcessing: boolean;
  label?: string;
  color?: string;
  onClick: () => void;
};

export const IconButton = ({
  iconName,
  isProcessing,
  label,
  color = 'var(--main-ui-color)',
  disabled = false,
  onClick,
  className = '',
  ...rest
}: Props) => {
  const finalColor = color;
  const opacity = disabled ? 'opacity-50' : 'opacity-100';

  // Definimos la variable name con el tipo correcto (CustomIconName)
  const iconNameToRender: CustomIconName = isProcessing ? "24/Dot" as CustomIconName : iconName;

  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center p-3 rounded-xl shadow-md transition-all duration-200 ${opacity} ${className}`}
      style={{ backgroundColor: finalColor, color: '#ffffff' }}
    >
      {isProcessing ? (
        <ProcessingIndicator color="#ffffff" />
      ) : null}
      
      {/* CORRECCIÓN CRÍTICA:
        Forzamos el tipo aquí a 'keyof KnownIconType' si no está en modo "Processing".
        Aunque sabemos que puede ser un string arbitrario, el compilador debe verlo 
        como uno de los tipos permitidos para el componente <pixiv-icon>. 
        
        Si el componente pixiv-icon tiene un archivo de declaraciones que acepta directamente 
        'string', solo usaríamos 'as string', pero dado el error, debemos forzarlo a 
        la restricción estricta de la librería.
      */}
      <pixiv-icon 
        name={iconNameToRender as keyof KnownIconType} 
        scale="1"
      ></pixiv-icon>

      {label && <div className="mx-4 font-M_PLUS_2 font-bold">{label}</div>}
    </button>
  );
};
