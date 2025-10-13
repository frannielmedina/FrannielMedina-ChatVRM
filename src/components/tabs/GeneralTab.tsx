import React, { useState } from "react";
import { TextButton } from "../textButton";
import { ConfirmDialog } from "../ConfirmDialog";
import { useNotification } from "@/hooks/useNotification";

type Props = {
  systemPrompt?: string;
  onClickResetSystemPrompt?: () => void;
};

export const GeneralTab = (props: Props) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [characterName, setCharacterName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('characterName') || 'Character';
    }
    return 'Character';
  });
  const { showNotification } = useNotification();

  const handleCharacterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setCharacterName(newName);
    localStorage.setItem('characterName', newName);
    showNotification('Nombre del personaje actualizado', 'success');
  };

  const handleExportData = () => {
    try {
      const data = {
        characterName,
        systemPrompt: props.systemPrompt,
        chatLog: localStorage.getItem('chatVRMParams'),
        elevenLabsKey: localStorage.getItem('elevenLabsKey'),
        openRouterKey: localStorage.getItem('openRouterKey'),
        backgroundImage: localStorage.getItem('backgroundImage'),
        uiColor: localStorage.getItem('uiColor'),
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatvrm-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('Datos exportados exitosamente', 'success');
    } catch (error) {
      showNotification('Error al exportar datos', 'error');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.characterName) {
          setCharacterName(data.characterName);
          localStorage.setItem('characterName', data.characterName);
        }
        if (data.chatLog) localStorage.setItem('chatVRMParams', data.chatLog);
        if (data.elevenLabsKey) localStorage.setItem('elevenLabsKey', data.elevenLabsKey);
        if (data.openRouterKey) localStorage.setItem('openRouterKey', data.openRouterKey);
        if (data.backgroundImage) localStorage.setItem('backgroundImage', data.backgroundImage);
        if (data.uiColor) localStorage.setItem('uiColor', data.uiColor);

        showNotification('Datos importados exitosamente. Recarga la página para ver los cambios.', 'success');
      } catch (error) {
        showNotification('Error al importar datos. Verifica el formato del archivo.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAllData = () => {
    setShowConfirmDialog(true);
  };

  const confirmDeleteAllData = () => {
    localStorage.clear();
    showNotification('Todos los datos han sido eliminados', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Nombre del Personaje</div>
        <input
          type="text"
          value={characterName}
          onChange={handleCharacterNameChange}
          placeholder="Nombre del personaje"
          className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4"
        />
        <div className="text-sm text-gray-600 mt-2">
          Este nombre se mostrará en el chat y en la interfaz.
        </div>
      </div>

      <div className="my-24">
        <div className="my-16 typography-20 font-bold">Gestión de Datos</div>
        
        <div className="flex gap-4 my-8">
          <TextButton onClick={handleExportData}>
            Guardar Datos (Exportar)
          </TextButton>
          
          <label className="cursor-pointer">
            <div className="px-24 py-8 text-white font-bold bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled rounded-oval cursor-pointer inline-block">
              Cargar Datos (Importar)
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <div className="text-sm text-gray-600 mt-2">
          Puedes guardar tu configuración actual en un archivo JSON o cargar una configuración previamente guardada.
        </div>
      </div>

      <div className="my-24 p-6 bg-red-50 border-2 border-red-300 rounded-8">
        <div className="my-16 typography-20 font-bold text-red-700">
          Zona Peligrosa
        </div>
        <div className="text-sm text-gray-700 mb-4">
          Esta acción eliminará todos los datos almacenados incluyendo configuraciones, historial de chat, claves API y personalizaciones. Esta acción no se puede deshacer.
        </div>
        <TextButton
          onClick={handleDeleteAllData}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800"
        >
          Eliminar Todos los Datos
        </TextButton>
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          title="¿Eliminar todos los datos?"
          message="Esta acción eliminará permanentemente todos tus datos almacenados y recargará la página. ¿Estás seguro de que deseas continuar?"
          onConfirm={confirmDeleteAllData}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};
