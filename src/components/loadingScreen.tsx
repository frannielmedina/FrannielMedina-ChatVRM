// src/components/loadingScreen.tsx
import React from 'react';

type Props = {
  progress: number; // 0 to 100
  onAnimationEnd: () => void;
};

export const LoadingScreen = ({ progress, onAnimationEnd }: Props) => {
  const isLoaded = progress >= 100;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${
        isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-white/90 backdrop-blur-sm'
      }`}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'opacity' && isLoaded) {
          onAnimationEnd();
        }
      }}
    >
      <div className="flex flex-col items-center">
        {/* Logo con animación de latido */}
        <img
          src="/chatvrmlogo.png"
          alt="ChatVRM Logo"
          className={`w-32 h-32 md:w-40 md:h-40 object-contain mb-8 transition-transform duration-500 ${
            isLoaded ? 'scale-125' : 'animate-pulse'
          }`}
        />
        
        <h1 className="text-3xl font-extrabold mb-8" style={{ color: 'var(--main-ui-color)' }}>
          Cargando ChatVRM...
        </h1>
        
        {/* Barra de Progreso */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: 'var(--main-ui-color)' 
            }}
          ></div>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          {Math.min(100, progress).toFixed(0)}% Completado
        </p>
      </div>
    </div>
  );
};
