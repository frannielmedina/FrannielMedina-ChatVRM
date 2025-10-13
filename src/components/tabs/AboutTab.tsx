import React from "react";
import { Link } from "../link";
import { buildUrl } from "@/utils/buildUrl";

export const AboutTab = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center my-8">
        <img 
          src={buildUrl("/chatvrm.png")} 
          alt="ChatVRM Logo" 
          className="max-w-[200px] rounded-16"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div className="text-center my-24">
        <h1 className="typography-32 font-bold text-primary mb-4">
          ChatVRM
        </h1>
        <div className="typography-20 text-gray-700 mb-2">
          by Franniel Medina
        </div>
        <div className="typography-16 text-gray-600">
          Versión 1.0.0
        </div>
      </div>

      <div className="my-24 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-8">
        <div className="typography-20 font-bold text-center text-purple-900 mb-4">
          ¡Chatea con personajes 3D basado en IA!
        </div>
        <div className="text-center text-gray-700">
          ChatVRM te permite interactuar con personajes 3D usando inteligencia artificial,
          síntesis de voz y modelos VRM personalizables.
        </div>
      </div>

      <div className="my-24">
        <div className="typography-20 font-bold mb-4">🔗 Enlaces del Proyecto</div>
        <div className="space-y-3">
          <div className="p-4 bg-white border border-gray-300 rounded-8 hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-800 mb-1">Fork Original de zoan37:</div>
            <Link 
              url="https://github.com/zoan37/ChatVRM" 
              label="https://github.com/zoan37/ChatVRM"
            />
          </div>
          
          <div className="p-4 bg-white border border-gray-300 rounded-8 hover:shadow-md transition-shadow">
            <div className="font-semibold text-gray-800 mb-1">Este Fork (Franniel Medina):</div>
            <Link 
              url="https://github.com/frannielmedina/frannielmedina-chatvrm/" 
              label="https://github.com/frannielmedina/frannielmedina-chatvrm/"
            />
          </div>
        </div>
      </div>

      <div className="my-24">
        <div className="flex justify-center">
          <a
            href="https://github.com/frannielmedina/frannielmedina-chatvrm/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <div className="p-8 rounded-16 bg-[#1F2328] hover:bg-[#33383E] active:bg-[#565A60] flex items-center transition-all hover:scale-105">
              <img
                alt="Fork me on GitHub"
                height={32}
                width={32}
                src={buildUrl("/github-mark-white.svg")}
                className="mr-3"
              />
              <div className="text-white font-M_PLUS_2 font-bold text-lg">
                Fork Me on GitHub
              </div>
            </div>
          </a>
        </div>
      </div>

      <div className="my-24">
        <div className="typography-20 font-bold mb-4">⚙️ Tecnologías Utilizadas</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-8">
            <div className="font-semibold text-blue-900">🤖 OpenRouter</div>
            <div className="text-sm text-blue-700">Para modelos LLM</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-8">
            <div className="font-semibold text-green-900">🎤 ElevenLabs</div>
            <div className="text-sm text-green-700">Para síntesis de voz (TTS)</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-8">
            <div className="font-semibold text-purple-900">👤 VRM</div>
            <div className="text-sm text-purple-700">Modelos 3D de personajes</div>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-8">
            <div className="font-semibold text-orange-900">⚛️ React + Next.js</div>
            <div className="text-sm text-orange-700">Framework web</div>
          </div>
        </div>
      </div>

      <div className="my-24">
        <div className="typography-20 font-bold mb-4">✨ Características Principales</div>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Chat con IA usando múltiples modelos de lenguaje</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Síntesis de voz natural con ElevenLabs</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Personajes 3D personalizables (VRM)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Integración con Twitch y YouTube</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Modo Streamer con protección de datos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Personalización completa de colores y fondos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Soporte para chroma key (fondo verde)</span>
          </li>
        </ul>
      </div>

      <div className="my-24 p-6 bg-gray-50 border border-gray-300 rounded-8">
        <div className="typography-16 font-bold text-center text-gray-900 mb-3">
          © 2025 Franniel Medina
        </div>
        <div className="text-center text-sm text-gray-700 mb-4">
          Todos los derechos reservados
        </div>
        <div className="text-center">
          <Link 
            url="https://beacons.ai/frannielmedinatv" 
            label="🔗 beacons.ai/frannielmedinatv"
          />
        </div>
      </div>

      <div className="my-24 p-4 bg-yellow-50 border border-yellow-300 rounded-4">
        <div className="typography-16 font-bold text-yellow-900 mb-2">
          📜 Licencia y Atribuciones
        </div>
        <div className="text-sm text-yellow-800">
          Este proyecto es un fork de ChatVRM original de Pixiv y zoan37. 
          Se mantienen todos los créditos originales y se añaden nuevas características.
        </div>
      </div>
    </div>
  );
};
