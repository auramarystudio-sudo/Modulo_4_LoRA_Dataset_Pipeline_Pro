/**
 * LoraTrainer - Interfaz moderna tipo workflow
 * 
 * Diseño minimalista y profesional con:
 * - Flujo de trabajo visual paso a paso
 * - Panel de herramientas deslizable
 * - Botón limpiar con confirmación
 * - Contexto inteligente según el paso actual
 */

import { useState, useCallback } from 'react';
import {
  GraduationCap,
  Database,
  FileText,
  Calculator,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  Wand2,
  FileCode2,
  ArrowRight,
  Trash2,
  HelpCircle,
  Settings,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useLoraTrainerStore } from '../store/lora-trainer-store';
import DatasetPipeline from '../components/lora-trainer/DatasetPipeline';
import CaptionPreview from '../components/lora-trainer/CaptionPreview';
import BatchOperations from '../components/lora-trainer/BatchOperations';
import TrainingPlanner from '../components/lora-trainer/TrainingPlanner';
import SessionHistory from '../components/lora-trainer/SessionHistory';
import KohyaConfigExporter from '../components/lora-trainer/KohyaConfigExporter';
import ProgressChecklist from '../components/lora-trainer/ProgressChecklist';
import InteractiveGlossary from '../components/lora-trainer/InteractiveGlossary';
import CommonMistakes from '../components/lora-trainer/CommonMistakes';
import DatasetDoctor from '../components/lora-trainer/DatasetDoctor';
import PhotoGuide from '../components/lora-trainer/PhotoGuide';
import TimeCalculator from '../components/lora-trainer/TimeCalculator';

type WorkflowStep = 'start' | 'session' | 'upload' | 'captions' | 'plan' | 'export';

interface Step {
  id: WorkflowStep;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WORKFLOW_STEPS: Step[] = [
  { id: 'session', number: 1, title: 'Crear Sesión', description: 'Define tu proyecto', icon: <Database className="w-5 h-5" /> },
  { id: 'upload', number: 2, title: 'Subir Imágenes', description: 'Agrega tu dataset', icon: <Layers className="w-5 h-5" /> },
  { id: 'captions', number: 3, title: 'Revisar Captions', description: 'Verifica descripciones', icon: <FileText className="w-5 h-5" /> },
  { id: 'plan', number: 4, title: 'Planificar', description: 'Configura entrenamiento', icon: <Calculator className="w-5 h-5" /> },
  { id: 'export', number: 5, title: 'Exportar', description: 'Genera config final', icon: <FileCode2 className="w-5 h-5" /> },
];

interface ToolPanel {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const TOOL_PANELS: ToolPanel[] = [
  { id: 'progress', title: 'Mi Progreso', icon: <CheckCircle2 className="w-4 h-4" />, component: <ProgressChecklist /> },
  { id: 'doctor', title: 'Dr. Dataset', icon: <AlertCircle className="w-4 h-4" />, component: <DatasetDoctor /> },
  { id: 'photoguide', title: 'Foto Guía', icon: <Sparkles className="w-4 h-4" />, component: <PhotoGuide /> },
  { id: 'timer', title: 'Calculadora', icon: <Calculator className="w-4 h-4" />, component: <TimeCalculator /> },
  { id: 'glossary', title: 'Glosario', icon: <HelpCircle className="w-4 h-4" />, component: <InteractiveGlossary /> },
  { id: 'mistakes', title: 'Errores Comunes', icon: <AlertCircle className="w-4 h-4" />, component: <CommonMistakes /> },
];

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('start');
  const [showToolPanel, setShowToolPanel] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { activeSessionId, sessions, createSession, deleteSession, setActiveSession } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleCreateSession = useCallback((nombre: string, triggerWord: string, conceptoBase: string) => {
    createSession(nombre, triggerWord, conceptoBase);
    setShowNewSessionModal(false);
    setCurrentStep('upload');
  }, [createSession]);

  // Determinar paso actual basado en el estado
  const getActiveStep = (): WorkflowStep => {
    if (!activeSession) return 'session';
    if (activeSession.captions_generados.length === 0) return 'upload';
    if (activeSession.captions_generados.some((c) => !c.validated)) return 'captions';
    if (!activeSession.pasos_recomendados) return 'plan';
    return 'export';
  };

  const handleStart = useCallback(() => {
    if (activeSession) {
      setCurrentStep(getActiveStep());
    } else {
      setShowNewSessionModal(true);
    }
  }, [activeSession]);

  const handleExport = useCallback(() => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  }, []);

  const handleDatasetReady = useCallback(() => {
    if (activeSession && onDatasetReady) {
      onDatasetReady(activeSession.trigger_word);
    }
  }, [activeSession, onDatasetReady]);

  const handleClear = useCallback(() => {
    if (activeSessionId) {
      deleteSession(activeSessionId);
      setActiveSession(null);
      setCurrentStep('start');
    }
    setShowClearConfirm(false);
  }, [activeSessionId, deleteSession, setActiveSession]);

  const activeStep = getActiveStep();
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === activeStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header minimalista */}
      <header className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">LoRA Pipeline Pro</h1>
                <p className="text-xs text-slate-400">Dataset Training Tool</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              {/* Botón herramientas */}
              <button
                onClick={() => setShowToolPanel(showToolPanel ? null : 'progress')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Herramientas</span>
              </button>

              {/* Botón limpiar */}
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!activeSession}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Limpiar</span>
              </button>

              {/* Dataset listo */}
              {onDatasetReady && activeSession && (
                <button
                  onClick={handleDatasetReady}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-green-600/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Dataset Listo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar */}
        {activeSession && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-400">Progreso del Proyecto</h2>
              <span className="text-sm text-slate-500">
                Paso {currentStepIndex + 1} de {WORKFLOW_STEPS.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      index < currentStepIndex
                        ? 'bg-green-600/10 border border-green-600/30'
                        : index === currentStepIndex
                        ? 'bg-cyan-600/10 border border-cyan-600/30'
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        index < currentStepIndex
                          ? 'bg-green-600 text-white'
                          : index === currentStepIndex
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{step.number}</span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <div className={`text-sm font-medium ${
                        index <= currentStepIndex ? 'text-white' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-slate-600 mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Área de trabajo principal */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm">
              {currentStep === 'start' && !activeSession && (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-6 rounded-2xl inline-block mb-6">
                    <GraduationCap className="w-16 h-16 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Bienvenido a LoRA Pipeline Pro</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Te guiaremos paso a paso para crear tu primer modelo LoRA. 
                    Es más fácil de lo que piensas.
                  </p>
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-600/20 transition-all"
                  >
                    <Wand2 className="w-5 h-5" />
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {currentStep === 'session' && (
                <SessionHistory onNewSession={() => setCurrentStep('session')} />
              )}

              {currentStep === 'upload' && (
                <DatasetPipeline onComplete={() => setCurrentStep('captions')} />
              )}

              {currentStep === 'captions' && (
                <div className="space-y-6">
                  <BatchOperations />
                  <CaptionPreview
                    onExport={handleExport}
                    onBack={() => setCurrentStep('upload')}
                  />
                </div>
              )}

              {currentStep === 'plan' && <TrainingPlanner />}

              {currentStep === 'export' && <KohyaConfigExporter />}
            </div>

            {/* Navegación de pasos */}
            {activeSession && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => {
                    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
                    if (currentIndex > 0) {
                      setCurrentStep(WORKFLOW_STEPS[currentIndex - 1].id);
                    }
                  }}
                  disabled={currentStep === 'session'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  onClick={() => {
                    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
                    if (currentIndex < WORKFLOW_STEPS.length - 1) {
                      setCurrentStep(WORKFLOW_STEPS[currentIndex + 1].id);
                    }
                  }}
                  disabled={currentStep === 'export'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Panel lateral de herramientas */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                Herramientas de Ayuda
              </h3>
              <div className="space-y-2">
                {TOOL_PANELS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setShowToolPanel(tool.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      showToolPanel === tool.id
                        ? 'bg-cyan-600/10 border border-cyan-600/30 text-cyan-300'
                        : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {tool.icon}
                    <span className="text-sm font-medium">{tool.title}</span>
                  </button>
                ))}
              </div>

              {/* Info del proyecto activo */}
              {activeSession && (
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-medium text-slate-400 mb-3">Proyecto Activo</h4>
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Nombre</span>
                      <span className="text-sm text-white font-medium">{activeSession.nombre_proyecto}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Trigger</span>
                      <span className="text-sm text-cyan-400 font-mono">{activeSession.trigger_word}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Imágenes</span>
                      <span className="text-sm text-white">{activeSession.captions_generados.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de herramienta expandido */}
      {showToolPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {TOOL_PANELS.find((t) => t.id === showToolPanel)?.title}
              </h2>
              <button
                onClick={() => setShowToolPanel(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {TOOL_PANELS.find((t) => t.id === showToolPanel)?.component}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para limpiar */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600/10 p-3 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Limpiar Todo</h3>
                <p className="text-sm text-slate-400">¿Estás seguro?</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Esto eliminará la sesión actual y todos los datos asociados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
              >
                Sí, Limpiar
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de éxito */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">¡Dataset exportado exitosamente!</span>
        </div>
      )}

      {/* Modal nueva sesión */}
      {showNewSessionModal && (
        <NewSessionModal
          onClose={() => setShowNewSessionModal(false)}
          onCreate={handleCreateSession}
          initialPrompt={initialPrompt}
          initialTrigger={initialTrigger}
        />
      )}
    </div>
  );
}

// ============================================================
// MODAL DE NUEVA SESIÓN
// ============================================================

interface NewSessionModalProps {
  onClose: () => void;
  onCreate: (nombre: string, triggerWord: string, conceptoBase: string) => void;
  initialPrompt?: string;
  initialTrigger?: string;
}

function NewSessionModal({ onClose, onCreate, initialPrompt, initialTrigger }: NewSessionModalProps) {
  const [nombre, setNombre] = useState('');
  const [triggerWord, setTriggerWord] = useState(initialTrigger || '');
  const [conceptoBase, setConceptoBase] = useState(initialPrompt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre && triggerWord && conceptoBase) {
      onCreate(nombre, triggerWord, conceptoBase);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-white mb-6">Crear Nueva Sesión</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Mi personaje favorito"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trigger Word
            </label>
            <input
              type="text"
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              placeholder="Ej: sks, ohwx, miestilo"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Palabra única que representará tu concepto en los captions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción del Concepto
            </label>
            <textarea
              value={conceptoBase}
              onChange={(e) => setConceptoBase(e.target.value)}
              placeholder="Describe qué quieres entrenar..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-600/20 transition-all"
            >
              Crear Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
