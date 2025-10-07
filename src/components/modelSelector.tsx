// src/components/modelSelector.tsx

import React from 'react';

// Define un tipo simple para el modelo, basado en tu estructura conocida
type Model = {
    id: string;
    name: string;
    model: string;
    provider: string;
};

type Props = {
    models: Model[]; // Espera una lista de modelos
    selectedModelId: string;
    onChange: (id: string) => void;
};

/**
 * Componente Selector de Modelo Dummy (Stub)
 * Necesario para resolver el error de importación en settings.tsx
 * Reemplázalo con tu lógica real de selector de modelos si la tienes.
 */
export const ModelSelector = ({ models, selectedModelId, onChange }: Props) => {
    
    // Obtener el color de la UI (usando variable CSS)
    const uiColor = "var(--main-ui-color)";

    return (
        <div className="mb-4">
            <label htmlFor="model-select" className="text-sm font-bold text-gray-800 block mb-1">
                Seleccionar Modelo LLM
            </label>
            <select
                id="model-select"
                value={selectedModelId}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 w-full focus:ring-[var(--main-ui-color)] focus:border-[var(--main-ui-color)]"
                style={{ borderColor: uiColor, outlineColor: uiColor }}
            >
                {/* Renderizar las opciones de modelos */}
                {models.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                    </option>
                ))}
            </select>
        </div>
    );
};
