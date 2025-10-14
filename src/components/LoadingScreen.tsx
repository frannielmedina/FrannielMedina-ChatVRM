import { useEffect, useState } from "react";
import { buildUrl } from "@/utils/buildUrl";

type Props = {
  onLoadComplete: () => void;
};

export const LoadingScreen = ({ onLoadComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Iniciando ChatVRM...");

  useEffect(() => {
    const steps = [
      { progress: 20, text: "Cargando recursos...", delay: 300 },
      { progress: 40, text: "Inicializando modelo 3D...", delay: 500 },
      { progress: 60, text: "Configurando IA...", delay: 400 },
      { progress: 80, text: "Preparando síntesis de voz...", delay: 400 },
      { progress: 100, text: "¡Listo!", delay: 300 }
    ];

    let currentStep = 0;

    const loadStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
        
        setTimeout(loadStep, step.delay);
      } else {
        setTimeout(() => {
          onLoadComplete();
        }, 500);
      }
    };

    loadStep();
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="flex flex-col items-center space-y-8 p-8">
        {/* Logo */}
        <div className="animate-pulse">
          <img
            src={buildUrl("/chatvrm.png")}
            alt="ChatVRM Logo"
            className="w-48 h-48 object-contain"
            onError={(e) => {
              // Si el logo no existe, mostrar un placeholder
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ChatVRM</h1>
          <p className="text-white/80 text-sm">by Franniel Medina</p>
        </div>

        {/* Barra de progreso */}
        <div className="w-80 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Texto de carga */}
        <div className="text-white font-semibold animate-pulse">
          {loadingText}
        </div>

        {/* Porcentaje */}
        <div className="text-white/60 text-2xl font-bold">
          {progress}%
        </div>
      </div>
    </div>
  );
};
