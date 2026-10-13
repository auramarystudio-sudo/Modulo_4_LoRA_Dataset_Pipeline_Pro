/**
 * LoraTrainer - Interfaz moderna con TODAS las funcionalidades
 * 
 * Diseño profesional con:
 * - Flujo de trabajo visual paso a paso
 * - Panel de herramientas organizado por categorías
 * - Botón limpiar con confirmación
 * - Tour interactivo y wizard para principiantes
 * - Todas las herramientas avanzadas accesibles
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
  Info,
  Hash,
  Search,
  Target,
  History,
  Type,
  Shield,
  BookOpen,
  Map,
  Save,
  Lightbulb,
  BarChart3,
} from 'lucide-react';
import { useLoraTrainerStore } from '../store/lora-trainer-store';

// Importar TODOS los componentes
import DatasetPipeline from '../components/lora-trainer/DatasetPipeline';
import CaptionPreview from '../components/lora-trainer/CaptionPreview';
import CaptionTemplates from '../components/lora-trainer/CaptionTemplates';
import BatchOperations from '../components/lora-trainer/BatchOperations';
import MetadataExtractor from '../components/lora-trainer/MetadataExtractor';
import TrainingPlanner from '../components/lora-trainer/TrainingPlanner';
import TriggerManager from '../components/lora-trainer/TriggerManager';
import SessionHistory from '../components/lora-trainer/SessionHistory';
import Dashboard from '../components/lora-trainer/Dashboard';
import KohyaConfigExporter from '../components/lora-trainer/KohyaConfigExporter';
import DuplicateDetector from '../components/lora-trainer/DuplicateDetector';
import ClassImageGenerator from '../components/lora-trainer/ClassImageGenerator';
import ChangeHistory from '../components/lora-trainer/ChangeHistory';
import WordCloudAnalyzer from '../components/lora-trainer/WordCloudAnalyzer';
import QualityChecker from '../components/lora-trainer/QualityChecker';
import KeyboardShortcuts from '../components/lora-trainer/KeyboardShortcuts';
import InteractiveTour from '../components/lora-trainer/InteractiveTour';
import HelpCenter from '../components/lora-trainer/HelpCenter';
import BeginnerWizard from '../components/lora-trainer/BeginnerWizard';
import BackupRestore from '../components/lora-trainer/BackupRestore';
import FinalReport from '../components/lora-trainer/FinalReport';
import SmartRecommender from '../components/lora-trainer/SmartRecommender';
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
}

const WORKFLOW_STEPS: Step[] = [
  { id: 'session', number: 1, title: 'Crear Sesión', description: 'Define tu proyecto' },
  { id: 'upload', number: 2, title: 'Subir Imágenes', description: 'Agrega tu dataset' },
  { id: 'captions', number: 3, title: 'Revisar Captions', description: 'Verifica descripciones' },
  { id: 'plan', number: 4, title: 'Planificar', description: 'Configura entrenamiento' },
  { id: 'export', number: 5, title: 'Exportar', description: 'Genera config final' },
];

// TODAS las herramientas organizadas por categorías
interface Tool {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'essentials' | 'dataset' | 'training' | 'analysis';
  description: string;
}

const ALL_TOOLS: Tool[] = [
  // ESENCIALES (Principiante)
  { id: 'progress', title: 'Mi Progreso', icon: <CheckCircle2 className="w-4 h-4" />, component: <ProgressChecklist />, category: 'essentials', description: 'Checklist paso a paso' },
  { id: 'doctor', title: 'Dr. Dataset', icon: <AlertCircle className="w-4 h-4" />, component: <DatasetDoctor />, category: 'essentials', description: 'Diagnóstico automático' },
  { id: 'photoguide', title: 'Foto Guía', icon: <Sparkles className="w-4 h-4" />, component: <PhotoGuide />, category: 'essentials', description: 'Cómo tomar fotos' },
  { id: 'timer', title: 'Calculadora', icon: <Calculator className="w-4 h-4" />, component: <TimeCalculator />, category: 'essentials', description: 'Tiempo de entrenamiento' },
  { id: 'glossary', title: 'Glosario', icon: <BookOpen className="w-4 h-4" />, component: <InteractiveGlossary />, category: 'essentials', description: 'Términos explicados' },
  { id: 'mistakes', title: 'Errores Comunes', icon: <AlertCircle className="w-4 h-4" />, component: <CommonMistakes />, category: 'essentials', description: 'Qué evitar' },
  
  // DATASET (Avanzado)
  { id: 'templates', title: 'Plantillas', icon: <Sparkles className="w-4 h-4" />, component: <CaptionTemplates />, category: 'dataset', description: 'Captions por categorías' },
  { id: 'metadata', title: 'Metadata', icon: <Info className="w-4 h-4" />, component: <MetadataExtractor />, category: 'dataset', description: 'Info de imágenes PNG' },
  { id: 'trigger', title: 'Trigger Word', icon: <Hash className="w-4 h-4" />, component: <TriggerManager />, category: 'dataset', description: 'Validar palabra clave' },
  { id: 'duplicates', title: 'Duplicados', icon: <Search className="w-4 h-4" />, component: <DuplicateDetector />, category: 'dataset', description: 'Detectar duplicados' },
  { id: 'classimages', title: 'Class Images', icon: <Target className="w-4 h-4" />, component: <ClassImageGenerator />, category: 'dataset', description: 'Generar prompts' },
  
  // TRAINING (Avanzado)
  { id: 'quality', title: 'Calidad', icon: <Shield className="w-4 h-4" />, component: <QualityChecker />, category: 'training', description: 'Control de calidad' },
  { id: 'history', title: 'Historial', icon: <History className="w-4 h-4" />, component: <ChangeHistory />, category: 'training', description: 'Cambios y undo/redo' },
  { id: 'backup', title: 'Backup', icon: <Save className="w-4 h-4" />, component: <BackupRestore />, category: 'training', description: 'Guardar y restaurar' },
  { id: 'report', title: 'Reporte', icon: <FileText className="w-4 h-4" />, component: <FinalReport />, category: 'training', description: 'Reporte final' },
  
  // ANALYSIS (Experto)
  { id: 'dashboard', title: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, component: <Dashboard />, category: 'analysis', description: 'Vista general' },
  { id: 'wordcloud', title: 'Word Cloud', icon: <Type className="w-4 h-4" />, component: <WordCloudAnalyzer />, category: 'analysis', description: 'Análisis de palabras' },
  { id: 'recommender', title: 'Recomendador', icon: <Lightbulb className="w-4 h-4" />, component: <SmartRecommender />, category: 'analysis', description: 'Sugerencias IA' },
  { id: 'help', title: 'Centro de Ayuda', icon: <HelpCircle className="w-4 h-4" />, component: <HelpCenter />, category: 'analysis', description: 'Guía completa' },
];

const CATEGORIES = {
  essentials: { label: '🎯 Esenciales', color: 'text-cyan-400' },
  dataset: { label: '📁 Dataset', color: 'text-blue-400' },
  training: { label: '⚙️ Entrenamiento', color: 'text-purple-400' },
  analysis: { label: '📊 Análisis', color: 'text-green-400' },
};

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
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['essentials']));

  const { activeSessionId, sessions, createSession, deleteSession, setActiveSession } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleCreateSession = useCallback((nombre: string, triggerWord: string, conceptoBase: string) => {
    createSession(nombre, triggerWord, conceptoBase);
    setShowNewSessionModal(false);
    setCurrentStep('upload');
  }, [createSession]);

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

  const toggleCategory = (cat: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  const activeStep = getActiveStep();
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === activeStep);

  // Agrupar herramientas por categoría
  const toolsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTools = ALL_TOOLS.filter((tool) => tool.category === catKey);
    if (categoryTools.length > 0) {
      acc[catKey] = { info: catInfo, tools: categoryTools };
    }
    return acc;
  }, {} as Record<string, { info: typeof CATEGORIES[keyof typeof CATEGORIES]; tools: Tool[] }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">LoRA Pipeline Pro</h1>
                <p className="text-xs text-slate-400">Dataset Training Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Wizard</span>
              </button>

              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/20 transition-colors"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Tour</span>
              </button>

              <button
                onClick={() => setShowToolPanel(showToolPanel ? null : 'all')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Herramientas</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!activeSession}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Limpiar</span>
              </button>

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
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm min-h-[600px]">
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
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowWizard(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
                >
                  <Wand2 className="w-5 h-5" />
                  Wizard para Principiantes
                </button>
                <button
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-600/20 transition-all"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 'session' && (
            <SessionHistory onNewSession={() => setShowNewSessionModal(true)} />
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

      {/* Panel de herramientas - Lista completa */}
      {showToolPanel === 'all' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Todas las Herramientas</h2>
                <p className="text-sm text-slate-400 mt-1">Organizadas por categoría</p>
              </div>
              <button
                onClick={() => setShowToolPanel(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(toolsByCategory).map(([catKey, { info, tools }]) => (
                  <div key={catKey}>
                    <button
                      onClick={() => toggleCategory(catKey)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors mb-2"
                    >
                      <div className={`text-sm font-bold ${info.color}`}>
                        {info.label}
                      </div>
                      {expandedCategories.has(catKey) ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {expandedCategories.has(catKey) && (
                      <div className="space-y-2">
                        {tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => setShowToolPanel(tool.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-left transition-colors"
                          >
                            <div className={info.color}>{tool.icon}</div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{tool.title}</div>
                              <div className="text-xs text-slate-500">{tool.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de herramienta individual */}
      {showToolPanel && showToolPanel !== 'all' && ALL_TOOLS.find((t) => t.id === showToolPanel) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">
                {ALL_TOOLS.find((t) => t.id === showToolPanel)?.title}
              </h2>
              <button
                onClick={() => setShowToolPanel('all')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {ALL_TOOLS.find((t) => t.id === showToolPanel)?.component}
            </div>
          </div>
        </div>
      )}

      {/* Modal limpiar */}
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

      {/* Toast éxito */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">¡Dataset exportado exitosamente!</span>
        </div>
      )}

      {/* Tour Interactivo */}
      <InteractiveTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigate={(tab) => {
          const stepMap: Record<string, WorkflowStep> = {
            sessions: 'session',
            pipeline: 'upload',
            captions: 'captions',
            planner: 'plan',
            export: 'export',
          };
          setCurrentStep(stepMap[tab] || 'start');
        }}
      />

      {/* Wizard Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setShowNewSessionModal(true);
        }}
      />

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => {
          const stepMap: Record<string, WorkflowStep> = {
            sessions: 'session',
            pipeline: 'upload',
            captions: 'captions',
            planner: 'plan',
            export: 'export',
          };
          setCurrentStep(stepMap[tab] || 'start');
        }}
        onValidateAll={handleExport}
        onExport={handleExport}
      />

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

// Modal nueva sesión
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
              Palabra única que representará tu concepto
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
