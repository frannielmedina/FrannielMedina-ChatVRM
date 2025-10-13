import React from "react";
import { TextButton } from "./textButton";

type Props = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({ title, message, onConfirm, onCancel }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-16 p-24 max-w-md w-full mx-4 shadow-2xl">
        <div className="typography-24 font-bold text-gray-900 mb-4">
          {title}
        </div>
        <div className="typography-16 text-gray-700 mb-8">
          {message}
        </div>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-24 py-8 text-gray-700 font-bold bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-oval transition-colors"
          >
            Cancelar
          </button>
          <TextButton
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800"
          >
            Sí, Eliminar
          </TextButton>
        </div>
      </div>
    </div>
  );
};
