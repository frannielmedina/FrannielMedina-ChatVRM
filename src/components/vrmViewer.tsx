// src/components/vrmViewer.tsx
import { useContext, useCallback, useEffect } from "react";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";

type Props = {
  // Nueva prop para reportar el progreso de carga del VRM
  onVrmLoadProgress?: (progress: number) => void;
};

export default function VrmViewer({ onVrmLoadProgress }: Props) {
  const { viewer } = useContext(ViewerContext);
  
  // Usar una URL local para el VRM para simplificar el entorno de demostración
  const AVATAR_SAMPLE_VRM_URL = buildUrl("/Alicia_vrm-1.00.vrm"); 

  // Función de carga que intenta simular el progreso
  const loadDefaultVrm = useCallback(async (url: string) => {
    onVrmLoadProgress?.(0);
    try {
      // Simulación de progreso de carga (En un entorno real, esto se haría
      // usando el evento 'onProgress' del cargador de THREE.js)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
            onVrmLoadProgress?.(progress);
        } else {
            clearInterval(interval);
        }
      }, 100);

      await viewer.loadVrm(url);
      clearInterval(interval); // Asegurar que el intervalo se detenga
      onVrmLoadProgress?.(100);
    } catch (e) {
      console.error("Error loading VRM:", e);
      onVrmLoadProgress?.(100); // Terminar la carga incluso si hay error
    }
  }, [viewer, onVrmLoadProgress]);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        loadDefaultVrm(AVATAR_SAMPLE_VRM_URL);

        // Drag and Drop para cambiar VRM
        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            // Al cargar un nuevo VRM por drag and drop, también iniciamos el reporte de progreso.
            loadDefaultVrm(url); 
          }
        });
      }
    },
    [viewer, loadDefaultVrm, AVATAR_SAMPLE_VRM_URL]
  );
  
  useEffect(() => {
    // CORRECCIÓN APLICADA AQUÍ: Se utiliza (viewer as any).vrm y (viewer as any).setuped
    // para indicar a TypeScript que confiamos en que estas propiedades existen en el objeto Viewer,
    // a pesar de que no están definidas en su tipo explícito.
    if (!(viewer as any).vrm && (viewer as any).setuped) { 
        loadDefaultVrm(AVATAR_SAMPLE_VRM_URL);
    }
  }, [viewer, loadDefaultVrm, AVATAR_SAMPLE_VRM_URL]);


  return (
    <div className={"absolute top-0 left-0 w-screen h-[100svh] -z-10"}>
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>
    </div>
  );
}
