// src/components/errorDialog.tsx
import React, { useState, useEffect } from 'react';

export type ErrorDialogProps = {
  title: string;
  message: string;
  code?: number;
  countdown: number; // Cuenta regresiva en segundos
  onClose: () => void;
};

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ title, message, code, countdown, onClose }) => {
  const [timer, setTimer] = useState(countdown);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      onClose();
    }
  }, [timer, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-sm w-full border-4 border-red-500">
        <div className="flex items-center mb-4">
          <span className="text-red-600 text-3xl mr-3">⚠️</span>
          <h3 className="text-xl font-bold text-red-700">{title}</h3>
        </div>
        
        <p className="text-gray-700 mb-4">{message}</p>
        
        {code && (
          <p className="text-sm text-gray-500 mb-4">Código de Error: {code}</p>
        )}

        <button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition duration-300"
        >
          Aceptar ({timer})
        </button>
      </div>
    </div>
  );
};
