/**
 * ProgressChecklist - Checklist visual de progreso
 * 
 * Guía al usuario novato paso a paso mostrando qué le falta hacer
 * en el pipeline de entrenamiento LoRA.
 */

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

interface Step {
  id: string;
  title: string;
  description: string;
  tip: string;
  tabToNavigate: string;
  completed: boolean;
}

export default function ProgressChecklist() {
  const { sessions, activeSessionId } = useLoraTrainerStore();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Determinar pasos completados según el estado de la sesión
  const steps: Step[] = [
    {
      id: 'session',
      title: '1. Crear una sesión',
      description: 'Define el nombre de tu proyecto, trigger word y concepto base.',
      tip: 'El trigger word es una palabra única que representará tu concepto. Ejemplo: "sks" o "miestilo". No uses palabras comunes.',
      tabToNavigate: 'sessions',
      completed: !!activeSession,
    },
    {
      id: 'images',
      title: '2. Preparar tus imágenes',
      description: 'Reúne entre 10-50 imágenes de buena calidad de lo que quieres entrenar.',
      tip: 'Las imágenes deben ser variadas: diferentes ángulos, iluminación y fondos. Mínimo 512x512 píxeles. Evita imágenes borrosas o con marcas de agua.',
      tabToNavigate: 'pipeline',
      completed: !!activeSession && activeSession.captions_generados.length > 0,
    },
    {
      id: 'captions',
      title: '3. Revisar los captions',
      description: 'Verifica que cada imagen tenga una descripción correcta.',
      tip: 'El caption describe qué hay en la imagen. Debe incluir tu trigger word al inicio. Ejemplo: "sks photo of a woman in a park, sunny day".',
      tabToNavigate: 'captions',
      completed: !!activeSession && activeSession.captions_generados.some((c) => c.validated),
    },
    {
      id: 'quality',
      title: '4. Control de calidad',
      description: 'Ejecuta el verificador de calidad para detectar problemas.',
      tip: 'Esto revisa que no haya imágenes duplicadas, que los captions sean consistentes y que todo esté listo para entrenar.',
      tabToNavigate: 'quality',
      completed: !!activeSession && activeSession.estado !== 'planificacion',
    },
    {
      id: 'planner',
      title: '5. Planificar entrenamiento',
      description: 'Calcula los parámetros óptimos para tu hardware.',
      tip: 'El planner calcula cuántos pasos, epochs y qué resolución usar según tu GPU y cantidad de imágenes.',
      tabToNavigate: 'planner',
      completed: !!activeSession && (activeSession.pasos_recomendados ?? 0) > 0,
    },
    {
      id: 'export',
      title: '6. Exportar configuración',
      description: 'Genera el archivo de configuración para Kohya_ss.',
      tip: 'Este archivo contiene todos los parámetros calculados. Solo tienes que cargarlo en Kohya_ss y empezar a entrenar.',
      tabToNavigate: 'export',
      completed: !!activeSession && activeSession.estado === 'completado',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Tu Progreso
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {completedCount === 0 && '¡Empieza creando una sesión!'}
              {completedCount > 0 && completedCount < steps.length && `¡Vas muy bien! Te faltan ${steps.length - completedCount} pasos.`}
              {completedCount === steps.length && '🎉 ¡Todo listo para entrenar!'}
            </p>
          </div>
          <div className="text-3xl font-bold text-cyan-400">{progressPercent}%</div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.id;
          return (
            <div
              key={step.id}
              className={`border rounded-xl overflow-hidden transition-all ${
                step.completed
                  ? 'bg-green-900/10 border-green-700/30'
                  : 'bg-slate-900/50 border-slate-700/50'
              }`}
            >
              {/* Step header */}
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/30 transition-colors"
              >
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-500 flex-shrink-0" />
                )}
                <span
                  className={`flex-1 font-medium ${
                    step.completed ? 'text-green-300' : 'text-slate-200'
                  }`}
                >
                  {step.title}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 ml-9 space-y-3">
                  <p className="text-sm text-slate-300">{step.description}</p>
                  
                  {/* Tip */}
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 flex gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200/80">{step.tip}</p>
                  </div>

                  {/* Action hint */}
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <ArrowRight className="w-3 h-3" />
                    <span>Ve a la pestaña "{step.tabToNavigate}" para completar este paso</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje motivacional */}
      {!activeSession && (
        <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4 text-center">
          <p className="text-cyan-300 text-sm">
            👋 ¡Bienvenido! Empieza por crear una sesión en la pestaña "Sesiones".
            <br />
            <span className="text-slate-400 text-xs">
              No te preocupes si algo no te queda claro, puedes consultar el Glosario en cualquier momento.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
