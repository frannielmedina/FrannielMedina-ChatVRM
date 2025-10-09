import { useState, useCallback, useMemo } from "react";
import { Link } from "./link";

type Props = {
  openAiKey: string;
  elevenLabsKey: string;
  openRouterKey: string;
  onChangeAiKey: (openAiKey: string) => void;
  onChangeElevenLabsKey: (elevenLabsKey: string) => void;
  onChangeOpenRouterKey: (openRouterKey: string) => void;
  onClose: (shouldHide: boolean) => void; // Función para cerrar y potencialmente ocultar
};

// Definición de los pasos del tutorial
const TUTORIAL_STEPS = [
  "welcome",
  "technology",
  "apis",
  "precautions",
  "finished",
] as const;
type TutorialStep = typeof TUTORIAL_STEPS[number];

export const Introduction = ({ 
  openAiKey, 
  elevenLabsKey, 
  openRouterKey, 
  onChangeAiKey, 
  onChangeElevenLabsKey,
  onChangeOpenRouterKey, 
  onClose, // Usar la nueva prop
}: Props) => {
  const [currentStep, setCurrentStep] = useState<TutorialStep>("welcome");
  const [hideNextTime, setHideNextTime] = useState(false); // Nuevo estado para la casilla

  // --- Handlers de Cambio de API ---
  const handleElevenLabsKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeElevenLabsKey(event.target.value);
    },
    [onChangeElevenLabsKey]
  );
  
  const handleOpenRouterKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeOpenRouterKey(event.target.value);
    },
    [onChangeOpenRouterKey]
  );
  
  const handleHideNextTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHideNextTime(event.target.checked);
  };

  // --- Lógica de Navegación y Validación ---

  const isApiStepValid = useMemo(() => {
    return elevenLabsKey.trim().length > 0 && openRouterKey.trim().length > 0;
  }, [elevenLabsKey, openRouterKey]);
  
  const currentStepIndex = TUTORIAL_STEPS.indexOf(currentStep);
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (currentStep === "apis" && !isApiStepValid) return;

    if (isLastStep) {
      onClose(hideNextTime); // Usar la función onClose y pasar el estado de la casilla
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(TUTORIAL_STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(TUTORIAL_STEPS[prevIndex]);
    }
  };

  // Renderizado del contenido del paso actual
  const renderStepContent = (step: TutorialStep) => {
    switch (step) {
      case "welcome":
        return (
          <div className="text-center">
            <img 
              src="/chatvrmlogo.png" 
              alt="ChatVRM Logo" 
              className="mx-auto w-24 h-24 md:w-32 md:h-32 object-contain"
            />
            <div className="my-16 font-extrabold typography-32" style={{ color: 'var(--main-ui-color)' }}>
              ¡Bienvenidos a ChatVRM!
            </div>
            <div className="typography-16 text-gray-700">
              Puedes disfrutar de conversaciones con personajes 3D utilizando solo un navegador web, con entrada de micrófono, texto y síntesis de voz. También puedes cambiar el personaje (VRM), establecer su personalidad y ajustar la voz.
            </div>
          </div>
        );

      case "technology":
        return (
          <div>
            <div className="my-8 font-bold typography-20" style={{ color: 'var(--main-ui-color)' }}>
              Tecnología
            </div>
            <div className="typography-16 text-gray-700">
              <Link
                url={"https://github.com/pixiv/three-vrm"}
                label={"@pixiv/three-vrm"}
              />&nbsp;
              se utiliza para mostrar y manipular modelos 3D,
              &nbsp;<Link
                url={"https://openrouter.ai/"}
                label={"OpenRouter"}
              />&nbsp;
              se utiliza para el acceso a la LLM, y 
              &nbsp;<Link url={"https://beta.elevenlabs.io/"} label={"ElevenLabs"} />&nbsp;
              se utiliza para la conversión de texto a voz.
            </div>
            <div className="my-16 typography-16 text-gray-700">
              El código fuente de esta demo está disponible en GitHub. ¡Siéntete libre de experimentar con cambios y modificaciones!
              <br />
              Repositorio:
              &nbsp;<Link
                url={"https://github.com/zoan37/ChatVRM"}
                label={"https://github.com/zoan37/ChatVRM"}
              />
            </div>
          </div>
        );

      case "apis":
        return (
          <div>
            <div className="my-8 font-bold typography-20" style={{ color: 'var(--main-ui-color)' }}>
              Claves de API
            </div>
            
            {/* OpenRouter API */}
            <div className="my-24">
              <div className="my-8 font-bold typography-16 text-gray-800">
                {openRouterKey.trim().length === 0 ? "Introduzca la API de OpenRouter" : "Clave de OpenRouter API"}
              </div>
              <input
                type="text"
                placeholder="OpenRouter API key"
                value={openRouterKey}
                onChange={handleOpenRouterKeyChange}
                className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis text-gray-800"
              ></input>
              <div className="typography-14 text-gray-600">
                Necesaria para la conversación con el modelo de lenguaje (LLM). Obtén la tuya en&nbsp;
                <Link url="https://openrouter.ai/" label="OpenRouter website" />.
              </div>
            </div>

            {/* ElevenLabs API */}
            <div className="my-24">
              <div className="my-8 font-bold typography-16 text-gray-800">
                {elevenLabsKey.trim().length === 0 ? "Introduzca la API de ElevenLabs" : "Clave de ElevenLabs API"}
              </div>
              <input
                type="text"
                placeholder="ElevenLabs API key"
                value={elevenLabsKey}
                onChange={handleElevenLabsKeyChange}
                className="my-4 px-16 py-8 w-full h-40 bg-surface3 hover:bg-surface3-hover rounded-4 text-ellipsis text-gray-800"
              ></input>
              <div className="typography-14 text-gray-600">
                Necesaria para la síntesis de voz del personaje. Obtén la tuya en&nbsp;
                <Link url="https://beta.elevenlabs.io/" label="ElevenLabs website" />.
              </div>
            </div>
            
            <div className="my-16 typography-14 text-gray-700 p-2 border-l-4 border-secondary bg-secondary/10">
              Las claves API se almacenan localmente en tu navegador para realizar las llamadas directamente; no se guardan en el servidor.
            </div>
          </div>
        );

      case "precautions":
        return (
          <div>
            <div className="my-8 font-bold typography-20" style={{ color: 'var(--main-ui-color)' }}>
              Precauciones de Uso
            </div>
            <div className="typography-16 text-gray-700 p-4 border-2 border-red-400 rounded-lg bg-red-50">
              No induzcas intencionadamente comentarios discriminatorios, violentos o que menosprecien a una persona específica. Al reemplazar personajes con un modelo VRM, respeta los términos de uso de dicho modelo.
            </div>
          </div>
        );

      case "finished":
        return (
          <div className="text-center">
            <img 
              src="/chatvrmlogo.png" 
              alt="ChatVRM Logo" 
              className="mx-auto w-24 h-24 md:w-32 md:h-32 object-contain"
            />
            <div className="my-16 font-extrabold typography-32" style={{ color: 'var(--main-ui-color)' }}>
              Configuración Finalizada
            </div>
            <div className="typography-16 text-gray-700">
              ¡Todo listo! Haz clic en "Comenzar" para iniciar la conversación con tu personaje virtual.
            </div>
            
            {/* Casilla de verificación */}
            <div className="mt-8 flex items-center justify-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={hideNextTime}
                    onChange={handleHideNextTimeChange}
                    className="form-checkbox h-5 w-5"
                    style={{ 
                        '--tw-ring-color': 'var(--main-ui-color)',
                        backgroundColor: hideNextTime ? 'var(--main-ui-color)' : 'white',
                        borderColor: 'var(--main-ui-color)'
                    } as React.CSSProperties}
                />
                <span className="text-gray-800 font-semibold">
                  No mostrar de nuevo al cargar la página.
                </span>
              </label>
            </div>
            
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed z-50 w-full h-full px-4 py-8 md:px-24 md:py-16 bg-black/50 backdrop-blur-sm font-M_PLUS_2 transition-opacity duration-500 ease-in-out">
      <div className="relative mx-auto my-auto max-w-3xl max-h-full p-4 md:p-10 overflow-auto bg-white rounded-xl shadow-2xl">
        <div className="min-h-[300px] flex flex-col justify-between">
          {/* Contenido del Paso */}
          <div className="flex-grow p-4">
            {renderStepContent(currentStep)}
          </div>

          {/* Navegación */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
            {/* Botón Atrás */}
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="font-bold text-gray-600 hover:text-gray-800 disabled:text-gray-300 px-8 py-4 rounded-oval transition duration-200"
            >
              ← Anterior
            </button>

            {/* Indicador de Paso */}
            <div className="text-sm text-gray-500">
              Paso {currentStepIndex + 1} de {TUTORIAL_STEPS.length}
            </div>

            {/* Botón Siguiente / Comenzar */}
            <button
              onClick={handleNext}
              disabled={currentStep === "apis" && !isApiStepValid}
              className={`font-bold text-white px-24 py-8 rounded-oval transition duration-300 ${
                currentStep === "apis" && !isApiStepValid 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-secondary hover:bg-secondary-hover active:bg-secondary-press"
              }`}
              style={{ backgroundColor: currentStep === "apis" && !isApiStepValid ? undefined : 'var(--main-ui-color)' }}
            >
              {isLastStep ? "Comenzar" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
