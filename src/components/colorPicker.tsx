// src/components/colorPicker.tsx

import React, { useCallback } from 'react';

type Props = {
    currentColor: string;
    onChangeColor: (color: string) => void;
};

/**
 * Componente Selector de Color Dummy (Stub)
 * Proporciona un input de color básico para resolver el error de importación.
 */
export const ColorPicker = ({ currentColor, onChangeColor }: Props) => {
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Llama a la función principal con el nuevo valor del color
        onChangeColor(e.target.value);
    }, [onChangeColor]);

    return (
        <div className="flex items-center space-x-3 mb-4">
            {/* Muestra una vista previa del color actual */}
            <div 
                className="w-10 h-10 rounded-full border-2 border-gray-300 shadow" 
                style={{ backgroundColor: currentColor }}
            ></div>
            
            {/* Input nativo de tipo color para la selección */}
            <input
                type="color"
                value={currentColor}
                onChange={handleChange}
                className="w-16 h-10 p-1 border-0 rounded-md cursor-pointer appearance-none bg-transparent"
                title="Seleccionar Color de UI"
            />
            
            {/* Muestra el valor hexadecimal del color */}
            <span className="text-sm font-mono text-gray-700">{currentColor.toUpperCase()}</span>
        </div>
    );
};
