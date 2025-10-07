// src/components/modelSelector.tsx

import React from 'react';

// Definimos el tipo 'Model' para que coincida con el tipo de datos que
// probablemente está usando tu constante OPENROUTER_MODELS.
// Se ha eliminado la propiedad 'provider' que causaba el error de tipos.
export type Model = {
    id: string;
    name: string;
    model: string;
    // La propiedad 'provider' fue removida para resolver:
    // "Property 'provider' is missing in type 'OpenRouterModel' but required in type 'Model'."
};

type Props = {
    models: Model[]; // Ahora es compatible con OpenRouterModel[]
    selectedModelId: string;
    onChange: (id: string) => void;
};

/**
 * Componente Selector de Modelo (Stub/Básico)
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
                        {model.name} ({model.model}) 
                        {/* Se usa model.model en lugar de model.provider */}
                    </option>
                ))}
            </select>
        </div>
    );
};
