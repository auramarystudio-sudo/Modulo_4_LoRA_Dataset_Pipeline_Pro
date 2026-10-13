/**
 * LoraTrainer - Navegación simplificada 2 niveles
 * 
 * Glassmorphism Dark Pro v3.0
 * 
 * Estructura:
 * - Header compacto
 * - 5 botones de categorías (Principal, Dataset, Entrenamiento, Análisis, Ayuda)
 * - Panel desplegable con herramientas de la categoría seleccionada
 * - Contenido principal (herramienta activa)
 * - Sidebar contextual complementario
 */

import { useState, useCallback } from 'react';
import {
  GraduationCap,
  Database,
  FileText,
  Calculator,
  CheckCircle2,
  Layers,
  Sparkles,
  Wand2,
  FileCode2,
  Trash2,
  HelpCircle,
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
  AlertCircle,
  Zap,
  Clock,
  Image as ImageIcon,
  Palette,
  X,
  Menu,
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

type ToolId = 
  | 'progress' | 'sessions' | 'pipeline' | 'captions' | 'planner' | 'export'
  | 'templates' | 'metadata' | 'trigger' | 'duplicates' | 'classimages'
  | 'quality' | 'history' | 'backup' | 'report'
  | 'dashboard' | 'wordcloud' | 'recommender'
  | 'doctor' | 'photoguide' | 'timer' | 'glossary' | 'mistakes' | 'help';

type CategoryId = 'main' | 'dataset' | 'training' | 'analysis' | 'help';

interface Tool {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: CategoryId;
}

const TOOLS: Tool[] = [
  // MAIN
  { id: 'progress', label: 'Progreso', icon: <CheckCircle2 className="w-3 h-3" />, component: <ProgressChecklist />, category: 'main' },
  { id: 'sessions', label: 'Sesiones', icon: <Database className="w-3 h-3" />, component: <SessionHistory onNewSession={() => {}} />, category: 'main' },
  { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-3 h-3" />, component: <DatasetPipeline onComplete={() => {}} />, category: 'main' },
  { id: 'captions', label: 'Captions', icon: <FileText className="w-3 h-3" />, component: <div className="space-y-6"><BatchOperations /><CaptionPreview onExport={() => {}} onBack={() => {}} /></div>, category: 'main' },
  { id: 'planner', label: 'Planner', icon: <Calculator className="w-3 h-3" />, component: <TrainingPlanner />, category: 'main' },
  { id: 'export', label: 'Exportar', icon: <FileCode2 className="w-3 h-3" />, component: <KohyaConfigExporter />, category: 'main' },
  
  // DATASET
  { id: 'templates', label: 'Plantillas', icon: <Sparkles className="w-3 h-3" />, component: <CaptionTemplates />, category: 'dataset' },
  { id: 'metadata', label: 'Metadata', icon: <Info className="w-3 h-3" />, component: <MetadataExtractor />, category: 'dataset' },
  { id: 'trigger', label: 'Trigger', icon: <Hash className="w-3 h-3" />, component: <TriggerManager />, category: 'dataset' },
  { id: 'duplicates', label: 'Duplicados', icon: <Search className="w-3 h-3" />, component: <DuplicateDetector />, category: 'dataset' },
  { id: 'classimages', label: 'Class Images', icon: <Target className="w-3 h-3" />, component: <ClassImageGenerator />, category: 'dataset' },
  
  // TRAINING
  { id: 'quality', label: 'Calidad', icon: <Shield className="w-3 h-3" />, component: <QualityChecker />, category: 'training' },
  { id: 'history', label: 'Historial', icon: <History className="w-3 h-3" />, component: <ChangeHistory />, category: 'training' },
  { id: 'backup', label: 'Backup', icon: <Save className="w-3 h-3" />, component: <BackupRestore />, category: 'training' },
  { id: 'report', label: 'Reporte', icon: <FileText className="w-3 h-3" />, component: <FinalReport />, category: 'training' },
  
  // ANALYSIS
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-3 h-3" />, component: <Dashboard />, category: 'analysis' },
  { id: 'wordcloud', label: 'Word Cloud', icon: <Type className="w-3 h-3" />, component: <WordCloudAnalyzer />, category: 'analysis' },
  { id: 'recommender', label: 'Recomendador', icon: <Lightbulb className="w-3 h-3" />, component: <SmartRecommender />, category: 'analysis' },
  
  // HELP
  { id: 'doctor', label: 'Dr. Dataset', icon: <AlertCircle className="w-3 h-3" />, component: <DatasetDoctor />, category: 'help' },
  { id: 'photoguide', label: 'Foto Guía', icon: <Sparkles className="w-3 h-3" />, component: <PhotoGuide />, category: 'help' },
  { id: 'timer', label: 'Calculadora', icon: <Calculator className="w-3 h-3" />, component: <TimeCalculator />, category: 'help' },
  { id: 'glossary', label: 'Glosario', icon: <BookOpen className="w-3 h-3" />, component: <InteractiveGlossary />, category: 'help' },
  { id: 'mistakes', label: 'Errores', icon: <AlertCircle className="w-3 h-3" />, component: <CommonMistakes />, category: 'help' },
  { id: 'help', label: 'Ayuda', icon: <HelpCircle className="w-3 h-3" />, component: <HelpCenter />, category: 'help' },
];

const CATEGORIES: Record<CategoryId, { label: string; icon: React.ReactNode; gradient: string }> = {
  main: { label: 'Principal', icon: <Layers className="w-4 h-4" />, gradient: 'from-cyan-600 to-blue-600' },
  dataset: { label: 'Dataset', icon: <Database className="w-4 h-4" />, gradient: 'from-blue-600 to-indigo-600' },
  training: { label: 'Entrenamiento', icon: <Calculator className="w-4 h-4" />, gradient: 'from-purple-600 to-pink-600' },
  analysis: { label: 'Análisis', icon: <BarChart3 className="w-4 h-4" />, gradient: 'from-green-600 to-emerald-600' },
  help: { label: 'Ayuda', icon: <HelpCircle className="w-4 h-4" />, gradient: 'from-yellow-600 to-orange-600' },
};

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [activeTool, setActiveTool] = useState<ToolId>('progress');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const { activeSessionId, sessions, deleteSession, setActiveSession } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

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
    }
    setShowClearConfirm(false);
  }, [activeSessionId, deleteSession, setActiveSession]);

  const handleCategoryClick = (catId: CategoryId) => {
    setActiveCategory(activeCategory === catId ? null : catId);
  };

  const handleToolClick = (toolId: ToolId) => {
    setActiveTool(toolId);
    setActiveCategory(null);
  };

  const toolsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTools = TOOLS.filter((tool) => tool.category === catKey);
    if (categoryTools.length > 0) {
      acc[catKey as CategoryId] = { info: catInfo, tools: categoryTools };
    }
    return acc;
  }, {} as Record<CategoryId, { info: typeof CATEGORIES[CategoryId]; tools: Tool[] }>);

  const activeToolData = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header compacto */}
      <header className="border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  LoRA Pipeline Pro
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuCollapsed(!menuCollapsed)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition border border-slate-700/50"
                title={menuCollapsed ? 'Mostrar menú' : 'Ocultar menú'}
              >
                <Menu className="w-4 h-4" />
                <span className="hidden lg:inline">{menuCollapsed ? 'Mostrar' : 'Ocultar'}</span>
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium transition shadow-lg"
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden lg:inline">Wizard</span>
              </button>
              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition"
              >
                <Map className="w-4 h-4" />
                <span className="hidden lg:inline">Tour</span>
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!activeSession}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-700/50 text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Limpiar</span>
              </button>
              {onDatasetReady && activeSession && (
                <button
                  onClick={handleDatasetReady}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium transition shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Listo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menú de Categorías - Colapsable */}
      {!menuCollapsed && (
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-2 backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(CATEGORIES) as [CategoryId, typeof CATEGORIES[CategoryId]][]).map(([catId, catInfo]) => (
                <button
                  key={catId}
                  onClick={() => handleCategoryClick(catId)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    activeCategory === catId
                      ? `bg-gradient-to-br ${catInfo.gradient} text-white shadow-lg`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-4 h-4">{catInfo.icon}</div>
                  <span>{catInfo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel desplegable con herramientas */}
          {activeCategory && (
            <div className="mt-3 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-3 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <div className="w-3 h-3">{CATEGORIES[activeCategory].icon}</div>
                  {CATEGORIES[activeCategory].label}
                </h3>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-slate-500 hover:text-slate-300 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
                {toolsByCategory[activeCategory].tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      activeTool === tool.id
                        ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-600/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    <div className="w-3 h-3">{tool.icon}</div>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout principal con sidebar contextual */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Contenido principal (75%) */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl min-h-[600px]">
            {activeToolData?.component}
          </div>

          {/* Sidebar contextual complementario (25%) */}
          <aside className="space-y-6">
            {/* Info del proyecto activo */}
            {activeSession && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Proyecto Activo
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Nombre</div>
                    <div className="text-sm text-slate-200 font-medium">{activeSession.nombre_proyecto}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Trigger Word</div>
                    <div className="text-sm text-cyan-400 font-mono bg-slate-800/50 px-2 py-1 rounded">{activeSession.trigger_word}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Imágenes</div>
                    <div className="text-sm text-slate-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      {activeSession.captions_generados.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Estado</div>
                    <div className="text-xs px-2 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/30 inline-block">
                      {activeSession.estado}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleToolClick('sessions')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition border border-slate-700/50"
                >
                  <Database className="w-4 h-4" />
                  Nueva Sesión
                </button>
                <button
                  onClick={() => handleToolClick('pipeline')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition border border-slate-700/50"
                >
                  <Layers className="w-4 h-4" />
                  Procesar Dataset
                </button>
                <button
                  onClick={() => handleToolClick('planner')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition border border-slate-700/50"
                >
                  <Calculator className="w-4 h-4" />
                  Planificar Entrenamiento
                </button>
              </div>
            </div>

            {/* Tips contextuales */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-700/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                Tip del Día
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeSession 
                  ? 'Revisa los captions antes de exportar. Un buen caption es la clave para un LoRA exitoso.'
                  : 'Comienza creando una nueva sesión para definir tu proyecto de entrenamiento LoRA.'}
              </p>
            </div>

            {/* Estado del dataset */}
            {activeSession && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  Progreso
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Imágenes cargadas</span>
                    <span className="text-slate-200">{activeSession.captions_generados.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Captions validados</span>
                    <span className="text-slate-200">
                      {activeSession.captions_generados.filter(c => c.validated).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pasos recomendados</span>
                    <span className="text-slate-200">
                      {activeSession.pasos_recomendados || 'No calculado'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Modal limpiar */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">Limpiar Todo</h3>
                <p className="text-sm text-slate-400">¿Estás seguro?</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Esto eliminará la sesión actual y todos los datos asociados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition"
              >
                Sí, Limpiar
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/50 font-medium transition"
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
        onNavigate={(tab) => handleToolClick(tab as ToolId)}
      />

      {/* Wizard Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          handleToolClick('sessions');
        }}
      />

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => handleToolClick(tab as ToolId)}
        onValidateAll={handleExport}
        onExport={handleExport}
      />
    </div>
  );
}
