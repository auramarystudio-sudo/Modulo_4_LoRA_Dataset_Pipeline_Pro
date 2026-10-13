/**
 * LoraTrainer - Interfaz con grid de tarjetas visuales
 * 
 * Diseño tipo dashboard visual:
 * - Tarjetas grandes con iconos
 * - Grid organizado por categorías
 * - Click para expandir herramienta
 * - Sin sidebar propio (para integrarse en módulo principal)
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
  ArrowLeft,
  X,
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

interface Tool {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'main' | 'dataset' | 'training' | 'analysis' | 'help';
  color: string;
}

const TOOLS: Tool[] = [
  // MAIN
  { id: 'progress', title: 'Mi Progreso', description: 'Checklist paso a paso', icon: <CheckCircle2 className="w-8 h-8" />, component: <ProgressChecklist />, category: 'main', color: 'from-cyan-500 to-blue-600' },
  { id: 'sessions', title: 'Sesiones', description: 'Gestionar proyectos', icon: <Database className="w-8 h-8" />, component: <SessionHistory onNewSession={() => {}} />, category: 'main', color: 'from-cyan-500 to-blue-600' },
  { id: 'pipeline', title: 'Pipeline', description: 'Procesar imágenes', icon: <Layers className="w-8 h-8" />, component: <DatasetPipeline onComplete={() => {}} />, category: 'main', color: 'from-cyan-500 to-blue-600' },
  { id: 'captions', title: 'Captions', description: 'Revisar descripciones', icon: <FileText className="w-8 h-8" />, component: <div className="space-y-6"><BatchOperations /><CaptionPreview onExport={() => {}} onBack={() => {}} /></div>, category: 'main', color: 'from-cyan-500 to-blue-600' },
  { id: 'planner', title: 'Planner', description: 'Configurar entrenamiento', icon: <Calculator className="w-8 h-8" />, component: <TrainingPlanner />, category: 'main', color: 'from-cyan-500 to-blue-600' },
  { id: 'export', title: 'Exportar', description: 'Generar config Kohya', icon: <FileCode2 className="w-8 h-8" />, component: <KohyaConfigExporter />, category: 'main', color: 'from-cyan-500 to-blue-600' },
  
  // DATASET
  { id: 'templates', title: 'Plantillas', description: 'Captions por categorías', icon: <Sparkles className="w-8 h-8" />, component: <CaptionTemplates />, category: 'dataset', color: 'from-blue-500 to-indigo-600' },
  { id: 'metadata', title: 'Metadata', description: 'Info de imágenes PNG', icon: <Info className="w-8 h-8" />, component: <MetadataExtractor />, category: 'dataset', color: 'from-blue-500 to-indigo-600' },
  { id: 'trigger', title: 'Trigger Word', description: 'Validar palabra clave', icon: <Hash className="w-8 h-8" />, component: <TriggerManager />, category: 'dataset', color: 'from-blue-500 to-indigo-600' },
  { id: 'duplicates', title: 'Duplicados', description: 'Detectar imágenes duplicadas', icon: <Search className="w-8 h-8" />, component: <DuplicateDetector />, category: 'dataset', color: 'from-blue-500 to-indigo-600' },
  { id: 'classimages', title: 'Class Images', description: 'Generar prompts de clase', icon: <Target className="w-8 h-8" />, component: <ClassImageGenerator />, category: 'dataset', color: 'from-blue-500 to-indigo-600' },
  
  // TRAINING
  { id: 'quality', title: 'Calidad', description: 'Control de calidad', icon: <Shield className="w-8 h-8" />, component: <QualityChecker />, category: 'training', color: 'from-purple-500 to-pink-600' },
  { id: 'history', title: 'Historial', description: 'Cambios y undo/redo', icon: <History className="w-8 h-8" />, component: <ChangeHistory />, category: 'training', color: 'from-purple-500 to-pink-600' },
  { id: 'backup', title: 'Backup', description: 'Guardar y restaurar', icon: <Save className="w-8 h-8" />, component: <BackupRestore />, category: 'training', color: 'from-purple-500 to-pink-600' },
  { id: 'report', title: 'Reporte', description: 'Reporte final', icon: <FileText className="w-8 h-8" />, component: <FinalReport />, category: 'training', color: 'from-purple-500 to-pink-600' },
  
  // ANALYSIS
  { id: 'dashboard', title: 'Dashboard', description: 'Vista general', icon: <BarChart3 className="w-8 h-8" />, component: <Dashboard />, category: 'analysis', color: 'from-green-500 to-emerald-600' },
  { id: 'wordcloud', title: 'Word Cloud', description: 'Análisis de palabras', icon: <Type className="w-8 h-8" />, component: <WordCloudAnalyzer />, category: 'analysis', color: 'from-green-500 to-emerald-600' },
  { id: 'recommender', title: 'Recomendador', description: 'Sugerencias inteligentes', icon: <Lightbulb className="w-8 h-8" />, component: <SmartRecommender />, category: 'analysis', color: 'from-green-500 to-emerald-600' },
  
  // HELP
  { id: 'doctor', title: 'Dr. Dataset', description: 'Diagnóstico automático', icon: <AlertCircle className="w-8 h-8" />, component: <DatasetDoctor />, category: 'help', color: 'from-yellow-500 to-orange-600' },
  { id: 'photoguide', title: 'Foto Guía', description: 'Cómo tomar fotos', icon: <Sparkles className="w-8 h-8" />, component: <PhotoGuide />, category: 'help', color: 'from-yellow-500 to-orange-600' },
  { id: 'timer', title: 'Calculadora', description: 'Tiempo de entrenamiento', icon: <Calculator className="w-8 h-8" />, component: <TimeCalculator />, category: 'help', color: 'from-yellow-500 to-orange-600' },
  { id: 'glossary', title: 'Glosario', description: 'Términos explicados', icon: <BookOpen className="w-8 h-8" />, component: <InteractiveGlossary />, category: 'help', color: 'from-yellow-500 to-orange-600' },
  { id: 'mistakes', title: 'Errores Comunes', description: 'Qué evitar', icon: <AlertCircle className="w-8 h-8" />, component: <CommonMistakes />, category: 'help', color: 'from-yellow-500 to-orange-600' },
  { id: 'help', title: 'Centro de Ayuda', description: 'Guía completa', icon: <HelpCircle className="w-8 h-8" />, component: <HelpCenter />, category: 'help', color: 'from-yellow-500 to-orange-600' },
];

const CATEGORIES = {
  main: { label: '🎯 Principal', description: 'Flujo básico de trabajo' },
  dataset: { label: '📁 Dataset', description: 'Preparación de datos' },
  training: { label: '⚙️ Entrenamiento', description: 'Configuración avanzada' },
  analysis: { label: '📊 Análisis', description: 'Herramientas de análisis' },
  help: { label: '💡 Ayuda', description: 'Guías y recursos' },
};

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [expandedTool, setExpandedTool] = useState<ToolId | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

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

  // Agrupar herramientas por categoría
  const toolsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTools = TOOLS.filter((tool) => tool.category === catKey);
    if (categoryTools.length > 0) {
      acc[catKey] = { info: catInfo, tools: categoryTools };
    }
    return acc;
  }, {} as Record<string, { info: typeof CATEGORIES[keyof typeof CATEGORIES]; tools: Tool[] }>);

  const expandedToolData = TOOLS.find((t) => t.id === expandedTool);

  return (
    <div className="w-full">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LoRA Pipeline Pro</h1>
            <p className="text-sm text-slate-400">Selecciona una herramienta para comenzar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 transition-colors text-sm"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Wizard</span>
          </button>

          <button
            onClick={() => setShowTour(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/20 transition-colors text-sm"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!activeSession}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>

          {onDatasetReady && activeSession && (
            <button
              onClick={handleDatasetReady}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-green-600/20 transition-all text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Dataset Listo</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista expandida de herramienta */}
      {expandedTool && expandedToolData && (
        <div className="mb-6">
          <button
            onClick={() => setExpandedTool(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </button>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm min-h-[600px]">
            {expandedToolData.component}
          </div>
        </div>
      )}

      {/* Grid de tarjetas por categoría */}
      {!expandedTool && (
        <div className="space-y-8">
          {Object.entries(toolsByCategory).map(([catKey, { info, tools }]) => (
            <div key={catKey}>
              {/* Título de categoría */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white">{info.label}</h2>
                <p className="text-sm text-slate-400">{info.description}</p>
              </div>

              {/* Grid de tarjetas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setExpandedTool(tool.id)}
                    className="group relative bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 backdrop-blur-sm hover:border-slate-700 transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Icono con gradiente */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} text-white mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      {tool.icon}
                    </div>

                    {/* Contenido */}
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {tool.description}
                    </p>

                    {/* Indicador de hover */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
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
        onNavigate={(tab) => setExpandedTool(tab as ToolId)}
      />

      {/* Wizard Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setExpandedTool('sessions');
        }}
      />

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => setExpandedTool(tab as ToolId)}
        onValidateAll={handleExport}
        onExport={handleExport}
      />
    </div>
  );
}
