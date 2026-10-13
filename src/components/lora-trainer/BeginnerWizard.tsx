/**
 * BeginnerWizard - Asistente paso a paso para crear tu primer LoRA
 * 
 * Guía al usuario novato a través de todo el proceso:
 * 1. Crear sesión
 * 2. Definir trigger word
 * 3. Subir imágenes
 * 4. Generar captions
 * 5. Validar dataset
 * 6. Planificar entrenamiento
 * 7. Exportar configuración
 * 
 * Cada paso incluye explicaciones simples y validación.
 */

import { useState } from 'react';
import {
  Wand2,
  Check,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  Target,
  Calculator,
  Download,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface BeginnerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function BeginnerWizard({ isOpen, onClose, onComplete }: BeginnerWizardProps) {
  const {
    sessions,
    activeSessionId,
    createSession,
    setActiveSession,
  } = useLoraTrainerStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionName, setSessionName] = useState('');
  const [triggerWord, setTriggerWord] = useState('');
  const [concept, setConcept] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Pasos del wizard
  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido!',
      description: 'Te guiaré para crear tu primer LoRA paso a paso',
      icon: <Sparkles className="w-5 h-5" />,
      completed: currentStep > 0,
      active: currentStep === 0,
    },
    {
      id: 'session',
      title: 'Crear Sesión',
      description: 'Dale un nombre a tu proyecto',
      icon: <Target className="w-5 h-5" />,
      completed: !!activeSession,
      active: currentStep === 1,
    },
    {
      id: 'trigger',
      title: 'Trigger Word',
      description: 'Define la palabra mágica',
      icon: <Wand2 className="w-5 h-5" />,
      completed: !!activeSession?.trigger_word,
      active: currentStep === 2,
    },
    {
      id: 'images',
      title: 'Subir Imágenes',
      description: 'Agrega 15-50 imágenes',
      icon: <ImageIcon className="w-5 h-5" />,
      completed: (activeSession?.captions_generados.length || 0) >= 15,
      active: currentStep === 3,
    },
    {
      id: 'captions',
      title: 'Generar Captions',
      description: 'Crea descripciones automáticas',
      icon: <FileText className="w-5 h-5" />,
      completed: (activeSession?.captions_generados.length || 0) > 0,
      active: currentStep === 4,
    },
    {
      id: 'validate',
      title: 'Validar Dataset',
      description: 'Verifica la calidad',
      icon: <Check className="w-5 h-5" />,
      completed: false, // Se marca al completar
      active: currentStep === 5,
    },
    {
      id: 'plan',
      title: 'Planificar',
      description: 'Configura el entrenamiento',
      icon: <Calculator className="w-5 h-5" />,
      completed: !!activeSession?.pasos_recomendados,
      active: currentStep === 6,
    },
    {
      id: 'export',
      title: 'Exportar',
      description: 'Genera archivos para Kohya',
      icon: <Download className="w-5 h-5" />,
      completed: false,
      active: currentStep === 7,
    },
  ];

  const handleNext = () => {
    if (currentStep === 1 && sessionName && triggerWord && concept) {
      // Crear sesión
      const sessionId = createSession(sessionName, triggerWord, concept);
      setActiveSession(sessionId);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completar wizard
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return sessionName.trim() && triggerWord.trim() && concept.trim(); // Session
      case 2: return triggerWord.trim().length >= 3; // Trigger
      case 3: return true; // Images (se valida después)
      case 4: return true; // Captions
      case 5: return true; // Validate
      case 6: return true; // Plan
      case 7: return true; // Export
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal del Wizard */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-slate-900 border-2 border-cyan-500 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Asistente para tu Primer LoRA</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      step.completed
                        ? 'bg-green-400'
                        : step.active
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}
                  />
                  <div className="mt-2 text-center">
                    <div className={`text-xs ${
                      step.active ? 'text-white font-medium' : 'text-white/60'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Paso actual */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Paso {currentStep + 1}: {steps[currentStep].title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido específico del paso */}
            <div className="bg-slate-800/50 rounded-xl p-6">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h4 className="text-xl font-bold text-slate-100">
                    ¡Vamos a crear tu primer LoRA!
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Un LoRA te permite enseñarle a la IA un concepto nuevo: tu estilo artístico, 
                    un personaje, un objeto específico, etc.
                  </p>
                  <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4 text-left">
                    <p className="text-sm text-cyan-200">
                      <strong>¿Qué necesitas?</strong><br />
                      • 15-50 imágenes de lo que quieres enseñar<br />
                      • Una palabra única (trigger word)<br />
                      • Una tarjeta gráfica NVIDIA con 8GB+ VRAM<br />
                      • 10-30 minutos de tu tiempo
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre del Proyecto
                    </label>
                    <input
                      type="text"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      placeholder="Ej: Mi Estilo Artístico, Personaje Juan, etc."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Trigger Word (palabra mágica)
                    </label>
                    <input
                      type="text"
                      value={triggerWord}
                      onChange={(e) => setTriggerWord(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="Ej: miestilo, juanchar, etc."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usa solo letras minúsculas y números. Mínimo 3 caracteres.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      ¿Qué quieres enseñar?
                    </label>
                    <textarea
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="Describe brevemente qué concepto quieres que la IA aprenda..."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 resize-none focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
                    <p className="text-sm text-cyan-200">
                      <strong>✅ Trigger word creado:</strong> <code className="bg-slate-800 px-2 py-0.5 rounded">{triggerWord || activeSession?.trigger_word}</code>
                    </p>
                    <p className="text-xs text-cyan-300/80 mt-2">
                      Esta es la palabra que usarás en tus prompts para activar el LoRA. 
                      Por ejemplo: "{triggerWord || 'mitrigger'} sentado en un parque"
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">💡 Consejos:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Usa una palabra única que no sea común</li>
                      <li>• Evita palabras que ya existan en el vocabulario de la IA</li>
                      <li>• Manténlo corto y fácil de recordar</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-300 mb-1">
                          Ahora necesitas subir imágenes
                        </p>
                        <p className="text-xs text-yellow-400/80">
                          Ve a la pestaña "Pipeline" y sube 15-50 imágenes de lo que quieres enseñar.
                          Luego regresa aquí para continuar.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">📸 Consejos para las imágenes:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Resolución mínima: 512x512 (SD 1.5) o 1024x1024 (SDXL)</li>
                      <li>• Variedad de ángulos, poses y fondos</li>
                      <li>• Buena iluminación y calidad</li>
                      <li>• Sin marcas de agua o texto</li>
                      <li>• Enfocadas en el concepto que quieres enseñar</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Imágenes cargadas: <strong className="text-cyan-300">{activeSession?.captions_generados.length || 0}</strong>
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300 mb-1">
                          Generar captions automáticamente
                        </p>
                        <p className="text-xs text-blue-400/80">
                          Ve a la pestaña "Pipeline" y ejecuta el pipeline para generar captions.
                          La IA creará descripciones automáticas para cada imagen.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">📝 ¿Qué son los captions?</h4>
                    <p className="text-xs text-slate-400">
                      Son descripciones textuales de cada imagen. Le dicen a la IA qué hay en la imagen.
                      Cuanto más precisos sean, mejor aprenderá tu LoRA.
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Captions generados: <strong className="text-cyan-300">{activeSession?.captions_generados.length || 0}</strong>
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-300 mb-1">
                          Validar la calidad del dataset
                        </p>
                        <p className="text-xs text-green-400/80">
                          Ve a la pestaña "Calidad" para verificar que tu dataset esté listo.
                          El sistema te dirá si hay problemas que necesitas corregir.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">✅ Checklist de calidad:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Todos los captions incluyen el trigger word</li>
                      <li>• Longitud promedio entre 80-200 caracteres</li>
                      <li>• Sin duplicados</li>
                      <li>• Buena diversidad de términos</li>
                      <li>• Score de calidad ≥ 80</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Calculator className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-300 mb-1">
                          Planificar el entrenamiento
                        </p>
                        <p className="text-xs text-purple-400/80">
                          Ve a la pestaña "Planner" para calcular cuántos pasos necesitas,
                          cuánta VRAM usarás y cuánto tiempo tomará.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">🧮 Parámetros clave:</h4>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• <strong>Epochs:</strong> Cuántas veces verás todo el dataset (5-20)</li>
                      <li>• <strong>Repeats:</strong> Cuántas veces se repite cada imagen por epoch (1-10)</li>
                      <li>• <strong>Batch Size:</strong> Imágenes procesadas a la vez (1-8)</li>
                      <li>• <strong>Learning Rate:</strong> Qué tan rápido aprende (1e-4 típico)</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-4 text-center">
                  <div className="text-6xl">🎊</div>
                  <h4 className="text-xl font-bold text-slate-100">
                    ¡Todo listo para entrenar!
                  </h4>
                  <p className="text-slate-300">
                    Ve a la pestaña "Exportar" para generar los archivos de configuración
                    que usarás en Kohya_ss para entrenar tu LoRA.
                  </p>
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-left">
                    <h5 className="text-sm font-medium text-green-300 mb-2">📋 Próximos pasos:</h5>
                    <ol className="text-xs text-green-400/80 space-y-1 list-decimal list-inside">
                      <li>Exporta la configuración desde la pestaña "Exportar"</li>
                      <li>Descarga e instala Kohya_ss si no lo tienes</li>
                      <li>Carga la configuración en Kohya_ss</li>
                      <li>Inicia el entrenamiento</li>
                      <li>¡Espera 10-30 minutos y tendrás tu LoRA!</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer con navegación */}
          <div className="border-t border-slate-800 p-4 bg-slate-900/50 flex-shrink-0">
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

              <div className="text-sm text-slate-400">
                Paso {currentStep + 1} de {steps.length}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 font-medium px-6 py-2 rounded-lg transition-colors ${
                  canProceed()
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
