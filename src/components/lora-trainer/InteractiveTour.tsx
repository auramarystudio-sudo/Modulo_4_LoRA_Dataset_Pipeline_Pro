/**
 * InteractiveTour - Tour interactivo guiado para principiantes
 * 
 * Guía al usuario paso a paso por cada sección de la aplicación:
 * - Explica qué hace cada pestaña
 * - Muestra ejemplos visuales
 * - Sugiere el orden correcto de uso
 * - Permite saltar o pausar el tour
 */

import { useState, useEffect } from 'react';
import {
  Map,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Sparkles,
  SkipForward,
} from 'lucide-react';

interface TourStep {
  id: string;
  tab: string;
  title: string;
  description: string;
  emoji: string;
  tip?: string;
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    tab: 'welcome',
    title: '¡Bienvenido al LoRA Dataset Pipeline Pro!',
    description: 'Esta herramienta te ayudará a preparar datasets para entrenar modelos LoRA de inteligencia artificial. No te preocupes si no sabes qué es eso, ¡te lo explicaremos paso a paso!',
    emoji: '👋',
    tip: 'Un LoRA es como enseñarle un truco nuevo a la IA. Por ejemplo, puedes enseñarle a dibujar en tu estilo artístico o generar imágenes de tu personaje favorito.',
  },
  {
    id: 'dashboard',
    tab: 'dashboard',
    title: 'Dashboard - Tu Panel de Control',
    description: 'Aquí verás un resumen general de tu proyecto: cuántas imágenes tienes, cuántos captions generaste, y el progreso general.',
    emoji: '📊',
    tip: 'Piensa en el Dashboard como el tablero de tu auto: te muestra la velocidad, el combustible y si hay algún problema.',
  },
  {
    id: 'sessions',
    tab: 'sessions',
    title: 'Sesiones - Tus Proyectos',
    description: 'Cada LoRA que crees será una "sesión". Aquí puedes crear, cargar y gestionar múltiples proyectos.',
    emoji: '📁',
    tip: 'Es como tener carpetas separadas para cada proyecto. Puedes trabajar en varios LoRAs al mismo tiempo.',
  },
  {
    id: 'pipeline',
    tab: 'pipeline',
    title: 'Pipeline - El Corazón del Proceso',
    description: 'Aquí es donde ocurre la magia: subes tus imágenes y la IA genera descripciones (captions) automáticas para cada una.',
    emoji: '⚙️',
    tip: 'Imagina que le muestras 20 fotos de tu gato a un amigo y le pides que describa cada una. ¡Eso es exactamente lo que hace el pipeline!',
  },
  {
    id: 'captions',
    tab: 'captions',
    title: 'Captions - Las Descripciones',
    description: 'Revisa y edita las descripciones que la IA generó. Puedes corregir errores, agregar detalles o validar las que están bien.',
    emoji: '📝',
    tip: 'Los captions son como las instrucciones que le das a la IA. Cuanto más precisos sean, mejor aprenderá.',
  },
  {
    id: 'templates',
    tab: 'templates',
    title: 'Plantillas - Atajos Inteligentes',
    description: 'En lugar de escribir cada caption desde cero, usa plantillas predefinidas para diferentes categorías (personas, objetos, estilos, etc.).',
    emoji: '✨',
    tip: 'Es como usar plantillas de Word en lugar de empezar con una página en blanco. ¡Ahorra mucho tiempo!',
  },
  {
    id: 'metadata',
    tab: 'metadata',
    title: 'Metadata - Información Oculta',
    description: 'Las imágenes pueden tener información oculta (como el prompt original con el que fueron generadas). Aquí la extraemos y la usamos.',
    emoji: '🔍',
    tip: 'Es como encontrar notas al margen en un libro viejo. Información valiosa que alguien dejó ahí.',
  },
  {
    id: 'planner',
    tab: 'planner',
    title: 'Planner - Planifica el Entrenamiento',
    description: 'Calcula cuántos pasos de entrenamiento necesitas, cuánta memoria VRAM usarás, y cuánto tiempo tomará.',
    emoji: '🧮',
    tip: 'Es como planear un viaje: calculas la distancia, el combustible necesario y cuánto tiempo tomará.',
  },
  {
    id: 'trigger',
    tab: 'trigger',
    title: 'Trigger Word - La Palabra Mágica',
    description: 'El trigger word es una palabra única que activará tu LoRA. Por ejemplo, si entrenas un estilo artístico, el trigger podría ser "miestiloart".',
    emoji: '🎯',
    tip: 'Es como el nombre de tu mascota: cuando lo dices, la IA sabe que te refieres a tu concepto específico.',
  },
  {
    id: 'export',
    tab: 'export',
    title: 'Exportar - Configura el Entrenamiento',
    description: 'Genera los archivos de configuración necesarios para entrenar tu LoRA con Kohya_ss (la herramienta de entrenamiento).',
    emoji: '💾',
    tip: 'Es como generar la receta final con todos los ingredientes y pasos para hornear el pastel perfecto.',
  },
  {
    id: 'duplicates',
    tab: 'duplicates',
    title: 'Duplicados - Limpia tu Dataset',
    description: 'Detecta imágenes o captions duplicados que podrían confundir a la IA durante el entrenamiento.',
    emoji: '🔎',
    tip: 'Es como revisar tu tarea antes de entregarla: buscas errores o repeticiones innecesarias.',
  },
  {
    id: 'classimages',
    tab: 'classimages',
    title: 'Class Images - Regularización',
    description: 'Genera prompts para crear imágenes de la categoría general (ej: "persona", "gato") que ayudan a la IA a no olvidar el concepto original.',
    emoji: '🖼️',
    tip: 'Es como mostrarle a la IA ejemplos de "gatos en general" para que no olvide qué es un gato mientras aprende sobre TU gato específico.',
  },
  {
    id: 'history',
    tab: 'history',
    title: 'Historial - Deshacer Cambios',
    description: 'Si cometes un error, puedes deshacerlo aquí. Registra todos los cambios que haces.',
    emoji: '⏪',
    tip: 'Es como el historial de tu navegador: puedes volver atrás si te equivocas.',
  },
  {
    id: 'wordcloud',
    tab: 'wordcloud',
    title: 'Word Cloud - Análisis Visual',
    description: 'Visualiza qué palabras usas más en tus captions. Te ayuda a identificar patrones.',
    emoji: '☁️',
    tip: 'Es como un mapa de calor de tus palabras: las más grandes son las más frecuentes.',
  },
  {
    id: 'quality',
    tab: 'quality',
    title: 'Calidad - Verificación Final',
    description: 'Analiza la calidad general de tu dataset y te dice qué mejorar antes de entrenar.',
    emoji: '✅',
    tip: 'Es como el control de calidad en una fábrica: se asegura de que todo esté perfecto antes de enviar el producto.',
  },
  {
    id: 'complete',
    tab: 'complete',
    title: '¡Listo para Empezar!',
    description: 'Ahora conoces todas las herramientas. Te recomiendo seguir este orden:\n\n1. Crear una sesión\n2. Subir imágenes\n3. Generar captions\n4. Revisar y validar\n5. Planificar entrenamiento\n6. Exportar configuración\n\n¡Buena suerte con tu primer LoRA!',
    emoji: '🎉',
    tip: 'No tengas miedo de experimentar. Si algo sale mal, siempre puedes empezar de nuevo o usar el historial para deshacer cambios.',
  },
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export default function InteractiveTour({ isOpen, onClose, onNavigate }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = TOUR_STEPS[currentStep];
  const totalSteps = TOUR_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Marcar paso como completado
  useEffect(() => {
    if (step) {
      setCompletedSteps(prev => new Set([...prev, step.id]));
    }
  }, [currentStep, step]);

  // Navegación
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      if (step.tab !== 'welcome' && step.tab !== 'complete') {
        onNavigate(step.tab);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStep = TOUR_STEPS[currentStep - 1];
      if (prevStep.tab !== 'welcome' && prevStep.tab !== 'complete') {
        onNavigate(prevStep.tab);
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleFinish = () => {
    onClose();
    onNavigate('sessions'); // Ir a crear sesión
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleSkip}
      />

      {/* Modal del Tour */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl max-w-2xl w-full shadow-2xl pointer-events-auto overflow-hidden">
          {/* Header con progreso */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Tour Interactivo</h2>
              </div>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
                title="Saltar tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Barra de progreso */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Emoji y título */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{step.emoji}</div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">
                {step.title}
              </h3>
            </div>

            {/* Descripción */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                {step.description}
              </p>
            </div>

            {/* Tip */}
            {step.tip && (
              <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-cyan-300 mb-1">💡 Consejo:</p>
                    <p className="text-sm text-cyan-200">{step.tip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer con navegación */}
          <div className="border-t border-slate-800 p-4 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Saltar tour
                </button>

                {currentStep === totalSteps - 1 ? (
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    ¡Empezar!
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
