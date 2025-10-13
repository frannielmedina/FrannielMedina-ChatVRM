import React, { useState } from "react";
import { TextButton } from "../textButton";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  backgroundImage: string;
  onChangeBackgroundImage: (image: string) => void;
  onClickOpenVrmFile: () => void;
  uiColor: string;
  onChangeUiColor: (color: string) => void;
};


export const CustomizationTab = (props: Props) => {
  const [greenScreenEnabled, setGreenScreenEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('greenScreenEnabled') === 'true';
    }
    return false;
  });

  const { showNotification } = useNotification();

  const presetColors = [
    { name: 'Morado (Predeterminado)', value: '#856292' },
    { name: 'Azul', value: '#4A90E2' },
    { name: 'Verde', value: '#50C878' },
    { name: 'Rojo', value: '#E74C3C' },
    { name: 'Naranja', value: '#FF8C42' },
    { name: 'Rosa', value: '#FF69B4' },
    { name: 'Turquesa', value: '#40E0D0' },
    { name: 'Índigo', value: '#4B0082' }
  ];

  const handleColorChange = (color: string) => {
    props.onChangeUiColor(color);
    localStorage.setItem('uiColor', color);
    
    // Apply color to buttons immediately
    document.documentElement.style.setProperty('--color-primary', color);
    showNotification('Color de la interfaz actualizado', 'success');
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleColorChange(e.target.value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        props.onChangeBackgroundImage(base64String);
        localStorage.setItem('backgroundImage', base64String);
        showNotification('Imagen de fondo cargada exitosamente', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    props.onChangeBackgroundImage('');
    localStorage.removeItem('backgroundImage');
    showNotification('Imagen de fondo removida', 'success');
  };

  const handleGreenScreenToggle = () => {
    const newValue = !greenScreenEnabled;
    setGreenScreenEnabled(newValue);
    localStorage.setItem('greenScreenEnabled', newValue.toString());
    
    if (newValue) {
      document.body.style.backgroundColor = '#00FF00';
      document.body.style.backgroundImage = 'none';
    } else {
      document.body.style.backgroundColor = '';
      if (props.backgroundImage) {
        document.body.style.backgroundImage = `url(${props.backgroundImage})`;
      }
    }
    
    showNotification(
      newValue ? 'Fondo verde activado' : 'Fondo verde desactivado',
      'success'
    );
  };

  return (
    <div className="space-y-8">
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Color de la Interfaz</div>
        <div className="text-sm text-gray-600 mb-4">
          Selecciona un color preestablecido o elige un color personalizado:
        </div>
        
        <div className="grid grid-cols-4 gap-3 mb-6">
          {presetColors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`p-3 rounded-8 border-2 transition-all hover:scale-105 ${
                props.uiColor === color.value
                  ? 'border-gray-800 shadow-lg'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
            >
              <div className="text-white font-semibold text-xs text-center">
                {color.name}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="typography-16 font-semibold">Color Personalizado:</label>
          <input
            type="color"
            value={props.uiColor}
            onChange={handleCustomColorChange}
            className="w-16 h-16 rounded-4 cursor-pointer border-2 border-gray-300"
          />
          <span className="text-sm text-gray-600">{props.uiColor}</span>
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Imagen de Fondo</div>
        <div className="my-16 text-sm text-gray-600">
          Elige una imagen personalizada para el fondo:
        </div>
        
        <div className="flex flex-col gap-4">
          <label className="cursor-pointer">
            <TextButton> {/* LÍNEA CORREGIDA: Eliminado 'as="span"' */}
              Seleccionar Imagen
            </TextButton>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {props.backgroundImage && (
            <div className="flex flex-col gap-4">
              <div className="my-8">
                <img
                  src={props.backgroundImage}
                  alt="Vista previa del fondo"
                  className="max-w-[300px] rounded-8 border-2 border-gray-300"
                />
              </div>
              <div>
                <TextButton onClick={handleRemoveBackground}>
                  Remover Fondo
                </TextButton>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Modelo del Personaje VRM</div>
        <div className="my-8">
          <TextButton onClick={props.onClickOpenVrmFile}>
            Abrir Archivo VRM
          </TextButton>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Cambia el modelo 3D de tu personaje cargando un archivo VRM compatible.
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Fondo Verde (Chroma Key)</div>
        <div className="flex items-center gap-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={greenScreenEnabled}
              onChange={handleGreenScreenToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {greenScreenEnabled ? 'Activado' : 'Desactivado'}
            </span>
          </label>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Activa el fondo verde para usar chroma key en software de streaming como OBS.
        </div>
      </div>

      <div className="my-24 p-4 bg-purple-50 border border-purple-300 rounded-4">
        <div className="typography-16 font-bold text-purple-900 mb-2">
          🎨 Vista Previa de Cambios
        </div>
        <div className="text-sm text-purple-800">
          Los cambios de color y fondo se aplicarán inmediatamente en la interfaz.
          Cierra este menú para ver el resultado completo.
        </div>
      </div>
    </div>
  );
}; // Cierre de la función CustomizationTab.
