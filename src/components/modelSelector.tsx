// src/components/modelSelector.tsx (Versión más limpia de la corrección)
export type Model = {
    id: string;
    name: string;
    model: string;
    // Eliminamos 'provider' ya que el tipo OpenRouterModel no lo tiene
}; 
// ...
type Props = {
    models: Model[]; // Ahora sí será compatible con OpenRouterModel[]
    // ...
};
