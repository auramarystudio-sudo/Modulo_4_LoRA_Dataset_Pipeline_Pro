/**
 * LoraTrainer - Layout con sidebar contextual
 * 
 * Glassmorphism Dark Pro v3.0
 * 
 * Estructura:
 * - Header compacto con acciones esenciales
 * - Pills horizontales por categoría
 * - Contenido principal (75% del ancho)
 * - Sidebar contextual complementario (25% del ancho)
 *   → NO compite con el sidebar principal del módulo padre
 *   → Muestra contexto, acciones rápidas e info del proyecto
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
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'main' | 'dataset' | 'training' | 'analysis' | 'help';
}

const TOOLS: Tool[] = [
  // MAIN
  { id: 'progress', label: 'Progreso', icon: <CheckCircle2 className="w-4 h-4" />, component: <ProgressChecklist />, category: 'main' },
  { id: 'sessions', label: 'Sesiones', icon: <Database className="w-4 h-4" />, component: <SessionHistory onNewSession={() => {}} />, category: 'main' },
  { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-4 h-4" />, component: <DatasetPipeline onComplete={() => {}} />, category: 'main' },
  { id: 'captions', label: 'Captions', icon: <FileText className="w-4 h-4" />, component: <div className="space-y-6"><BatchOperations /><CaptionPreview onExport={() => {}} onBack={() => {}} /></div>, category: 'main' },
  { id: 'planner', label: 'Planner', icon: <Calculator className="w-4 h-4" />, component: <TrainingPlanner />, category: 'main' },
  { id: 'export', label: 'Exportar', icon: <FileCode2 className="w-4 h-4" />, component: <KohyaConfigExporter />, category: 'main' },
  
  // DATASET
  { id: 'templates', label: 'Plantillas', icon: <Sparkles className="w-4 h-4" />, component: <CaptionTemplates />, category: 'dataset' },
  { id: 'metadata', label: 'Metadata', icon: <Info className="w-4 h-4" />, component: <MetadataExtractor />, category: 'dataset' },
  { id: 'trigger', label: 'Trigger', icon: <Hash className="w-4 h-4" />, component: <TriggerManager />, category: 'dataset' },
  { id: 'duplicates', label: 'Duplicados', icon: <Search className="w-4 h-4" />, component: <DuplicateDetector />, category: 'dataset' },
  { id: 'classimages', label: 'Class Images', icon: <Target className="w-4 h-4" />, component: <ClassImageGenerator />, category: 'dataset' },
  
  // TRAINING
  { id: 'quality', label: 'Calidad', icon: <Shield className="w-4 h-4" />, component: <QualityChecker />, category: 'training' },
  { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" />, component: <ChangeHistory />, category: 'training' },
  { id: 'backup', label: 'Backup', icon: <Save className="w-4 h-4" />, component: <BackupRestore />, category: 'training' },
  { id: 'report', label: 'Reporte', icon: <FileText className="w-4 h-4" />, component: <FinalReport />, category: 'training' },
  
  // ANALYSIS
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, component: <Dashboard />, category: 'analysis' },
  { id: 'wordcloud', label: 'Word Cloud', icon: <Type className="w-4 h-4" />, component: <WordCloudAnalyzer />, category: 'analysis' },
  { id: 'recommender', label: 'Recomendador', icon: <Lightbulb className="w-4 h-4" />, component: <SmartRecommender />, category: 'analysis' },
  
  // HELP
  { id: 'doctor', label: 'Dr. Dataset', icon: <AlertCircle className="w-4 h-4" />, component: <DatasetDoctor />, category: 'help' },
  { id: 'photoguide', label: 'Foto Guía', icon: <Sparkles className="w-4 h-4" />, component: <PhotoGuide />, category: 'help' },
  { id: 'timer', label: 'Calculadora', icon: <Calculator className="w-4 h-4" />, component: <TimeCalculator />, category: 'help' },
  { id: 'glossary', label: 'Glosario', icon: <BookOpen className="w-4 h-4" />, component: <InteractiveGlossary />, category: 'help' },
  { id: 'mistakes', label: 'Errores', icon: <AlertCircle className="w-4 h-4" />, component: <CommonMistakes />, category: 'help' },
  { id: 'help', label: 'Ayuda', icon: <HelpCircle className="w-4 h-4" />, component: <HelpCenter />, category: 'help' },
];

const CATEGORIES = {
  main: { label: 'Principal', color: 'bg-cyan-500' },
  dataset: { label: 'Dataset', color: 'bg-blue-500' },
  training: { label: 'Entrenamiento', color: 'bg-purple-500' },
  analysis: { label: 'Análisis', color: 'bg-green-500' },
  help: { label: 'Ayuda', color: 'bg-yellow-500' },
};

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

// Presets por categoría
const PRESETS = {
  estilos: [
    { id: 'retrato', name: 'Retrato Fotográfico', desc: 'Retrato profesional con iluminación de estudio', category: 'main' },
    { id: 'paisaje', name: 'Paisaje Épico', desc: 'Paisajes épicos con iluminación natural', category: 'main' },
    { id: 'anime', name: 'Personaje Anime', desc: 'Personajes de anime con detalles completos', category: 'main' },
    { id: 'producto', name: 'Producto Comercial', desc: 'Fotografía de producto profesional', category: 'main' },
    { id: 'cyberpunk', name: 'Ciudad Cyberpunk', desc: 'Escenas cyberpunk con ambiente noir', category: 'main' },
  ],
  boost: [
    { id: 'calidad-alta', name: 'Calidad Alta', desc: '1024x1024, 50 steps, CFG 7', category: 'dataset' },
    { id: 'rapido', name: 'Modo Rápido', desc: '512x512, 20 steps, CFG 5', category: 'dataset' },
    { id: 'balanceado', name: 'Balanceado', desc: '768x768, 30 steps, CFG 6', category: 'dataset' },
    { id: 'detallado', name: 'Ultra Detallado', desc: '1024x1024, 80 steps, CFG 8', category: 'dataset' },
  ],
  macros: [
    { id: 'batch-caption', name: 'Batch Caption', desc: 'Generar captions para todas las imágenes', category: 'training' },
    { id: 'validar-todo', name: 'Validar Todo', desc: 'Validar todos los captions automáticamente', category: 'training' },
    { id: 'exportar-config', name: 'Exportar Config', desc: 'Generar configuración Kohya completa', category: 'training' },
    { id: 'limpiar-metadata', name: 'Limpiar Metadata', desc: 'Eliminar metadatos innecesarios', category: 'training' },
  ],
  neg: [
    { id: 'calidad', name: 'Análisis de Calidad', desc: 'Detectar imágenes de baja calidad', category: 'analysis' },
    { id: 'duplicados', name: 'Buscar Duplicados', desc: 'Encontrar imágenes duplicadas', category: 'analysis' },
    { id: 'wordcloud', name: 'Word Cloud', desc: 'Analizar palabras más frecuentes', category: 'analysis' },
    { id: 'estadisticas', name: 'Estadísticas', desc: 'Ver estadísticas del dataset', category: 'analysis' },
  ],
  plant: [
    { id: 'wizard', name: 'Wizard Completo', desc: 'Asistente paso a paso para principiantes', category: 'help' },
    { id: 'glosario', name: 'Glosario', desc: 'Términos explicados fácilmente', category: 'help' },
    { id: 'errores', name: 'Errores Comunes', desc: 'Qué evitar en el entrenamiento', category: 'help' },
    { id: 'fotoguia', name: 'Foto Guía', desc: 'Cómo tomar buenas fotos', category: 'help' },
  ],
};

type PresetCategory = 'estilos' | 'boost' | 'macros' | 'neg' | 'plant';

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeTool, setActiveTool] = useState<ToolId>('progress');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activePresetCategory, setActivePresetCategory] = useState<PresetCategory | null>(null);
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null);

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

  const handleLoadPreset = useCallback((presetId: string, category: string) => {
    setLoadedPreset(presetId);
    // Navegar a la herramienta correspondiente según la categoría
    const categoryMap: Record<string, ToolId> = {
      main: 'progress',
      dataset: 'pipeline',
      training: 'planner',
      analysis: 'dashboard',
      help: 'help',
    };
    setActiveTool(categoryMap[category] || 'progress');
    setActivePresetCategory(null);
  }, []);

  const toolsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTools = TOOLS.filter((tool) => tool.category === catKey);
    if (categoryTools.length > 0) {
      acc[catKey] = { info: catInfo, tools: categoryTools };
    }
    return acc;
  }, {} as Record<string, { info: typeof CATEGORIES[keyof typeof CATEGORIES]; tools: Tool[] }>);

  const activeToolData = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header compacto - Glassmorphism */}
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

      {/* Pills horizontales */}
      <div className="max-w-[1800px] mx-auto px-6 py-4 border-b border-slate-800/50">
        <div className="space-y-3">
          {Object.entries(toolsByCategory).map(([catKey, { info, tools }]) => (
            <div key={catKey}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${info.color}`}></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {info.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeTool === tool.id
                        ? 'bg-slate-700 text-white shadow-lg'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout principal con sidebar contextual */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Contenido principal (75%) */}
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl min-h-[600px]">
            {activeToolData?.component}
          </div>

          {/* Sidebar contextual complementario (25%) */}
          <aside className="space-y-6">
            {/* Quick Presets Panel */}
            <div className="space-y-4">
              {/* 5 botones de estilo */}
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-2 backdrop-blur-sm shadow-xl">
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onClick={() => setActivePresetCategory(activePresetCategory === 'estilos' ? null : 'estilos')}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition ${
                      activePresetCategory === 'estilos'
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Estilos</span>
                  </button>
                  <button
                    onClick={() => setActivePresetCategory(activePresetCategory === 'boost' ? null : 'boost')}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition ${
                      activePresetCategory === 'boost'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Boost</span>
                  </button>
                  <button
                    onClick={() => setActivePresetCategory(activePresetCategory === 'macros' ? null : 'macros')}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition ${
                      activePresetCategory === 'macros'
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Macros</span>
                  </button>
                  <button
                    onClick={() => setActivePresetCategory(activePresetCategory === 'neg' ? null : 'neg')}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition ${
                      activePresetCategory === 'neg'
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Neg</span>
                  </button>
                  <button
                    onClick={() => setActivePresetCategory(activePresetCategory === 'plant' ? null : 'plant')}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition ${
                      activePresetCategory === 'plant'
                        ? 'bg-gradient-to-br from-yellow-600 to-orange-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Plant</span>
                  </button>
                </div>
              </div>

              {/* Panel desplegable con presets */}
              {activePresetCategory && (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 backdrop-blur-sm shadow-xl space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {activePresetCategory === 'estilos' && '🎨 Estilos'}
                      {activePresetCategory === 'boost' && '⚡ Boost'}
                      {activePresetCategory === 'macros' && '⚙️ Macros'}
                      {activePresetCategory === 'neg' && '🔍 Análisis'}
                      {activePresetCategory === 'plant' && '💡 Plantillas'}
                    </h4>
                    <button
                      onClick={() => setActivePresetCategory(null)}
                      className="text-slate-500 hover:text-slate-300 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {PRESETS[activePresetCategory].map((preset) => (
                    <div key={preset.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-200">{preset.name}</span>
                        <button
                          onClick={() => handleLoadPreset(preset.id, preset.category)}
                          className="text-xs px-3 py-1 rounded-lg bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/50 transition"
                        >
                          Cargar
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{preset.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Preset cargado */}
              {loadedPreset && (
                <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-700/30 rounded-2xl p-4 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-300">Preset Cargado</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {PRESETS.estilos.find(p => p.id === loadedPreset)?.name ||
                     PRESETS.boost.find(p => p.id === loadedPreset)?.name ||
                     PRESETS.macros.find(p => p.id === loadedPreset)?.name ||
                     PRESETS.neg.find(p => p.id === loadedPreset)?.name ||
                     PRESETS.plant.find(p => p.id === loadedPreset)?.name}
                  </p>
                </div>
              )}
            </div>

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
                  onClick={() => setActiveTool('sessions')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition border border-slate-700/50"
                >
                  <Database className="w-4 h-4" />
                  Nueva Sesión
                </button>
                <button
                  onClick={() => setActiveTool('pipeline')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm transition border border-slate-700/50"
                >
                  <Layers className="w-4 h-4" />
                  Procesar Dataset
                </button>
                <button
                  onClick={() => setActiveTool('planner')}
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
        onNavigate={(tab) => setActiveTool(tab as ToolId)}
      />

      {/* Wizard Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setActiveTool('sessions');
        }}
      />

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => setActiveTool(tab as ToolId)}
        onValidateAll={handleExport}
        onExport={handleExport}
      />
    </div>
  );
}
