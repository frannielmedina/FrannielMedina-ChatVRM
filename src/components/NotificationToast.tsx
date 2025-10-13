import React, { useEffect, useState } from "react";

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

type Props = {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
};

export const NotificationToast = ({ message, type, onClose, duration = 3000 }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getStyles = () => {
    const uiColor = typeof window !== 'undefined' 
      ? localStorage.getItem('uiColor') || '#856292' 
      : '#856292';
    
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-600 text-white`;
      case 'error':
        return `${baseStyles} bg-red-600 text-white`;
      case 'info':
        return `${baseStyles} text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-600 text-white`;
      default:
        return `${baseStyles} bg-gray-700 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      default:
        return '';
    }
  };

  return (
    <div
      className={`fixed top-24 right-24 z-[100] transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div 
        className={getStyles()}
        style={
          type === 'info' 
            ? { backgroundColor: typeof window !== 'undefined' 
                ? localStorage.getItem('uiColor') || '#856292' 
                : '#856292' 
              } 
            : {}
        }
      >
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
          {getIcon()}
        </div>
        <div className="flex-1 font-medium">
          {message}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};
