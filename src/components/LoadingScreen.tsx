import { useEffect, useState } from "react";
import { buildUrl } from "@/utils/buildUrl";

type Props = {
  onLoadComplete: () => void;
};

export const LoadingScreen = ({ onLoadComplete }: Props) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Iniciando ChatVRM...");
  const [isComplete, setIsComplete] = useState(false);

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
        setIsComplete(true);
        setTimeout(() => {
          onLoadComplete();
        }, 800);
      }
    };

    loadStep();
  }, [onLoadComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-secondary transition-all duration-700 ${
        isComplete ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
      style={{
        animation: isComplete ? 'zoomOut 0.7s ease-in' : 'none'
      }}
    >
      <style jsx>{`
        @keyframes zoomOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .logo-container {
          animation: pulse 2s ease-in-out infinite;
        }
        .text-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0.8) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .progress-bar-glow {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div 
        className="flex flex-col items-center space-y-8 p-8"
        style={{
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        {/* Logo */}
        <div className="logo-container">
          <img
            src={buildUrl("/chatvrm.png")}
            alt="ChatVRM Logo"
            className="w-48 h-48 object-contain drop-shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2 text-shimmer">
            ChatVRM
          </h1>
          <p className="text-white/90 text-sm">by Franniel Medina</p>
        </div>

        {/* Barra de progreso */}
        <div className="w-80 bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full bg-white rounded-full transition-all duration-500 ease-out ${
              progress === 100 ? 'progress-bar-glow' : ''
            }`}
            style={{ 
              width: `${progress}%`,
              boxShadow: progress === 100 ? '0 0 30px rgba(255, 255, 255, 0.8)' : 'none'
            }}
          />
        </div>

        {/* Texto de carga */}
        <div 
          className={`text-white font-semibold text-lg transition-all duration-300 ${
            progress === 100 ? 'scale-110' : 'scale-100'
          }`}
          key={loadingText}
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {loadingText}
        </div>

        {/* Porcentaje */}
        <div className="text-white/80 text-3xl font-bold">
          {progress}%
        </div>

        {/* Sparkles cuando está completo */}
        {progress === 100 && (
          <div className="text-4xl animate-bounce">
            ✨
          </div>
        )}
      </div>
    </div>
  );
};
