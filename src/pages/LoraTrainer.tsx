/**
 * LoraTrainer - Interfaz profesional con sidebar
 * 
 * Diseño elegante y organizado:
 * - Sidebar lateral con categorías colapsables
 * - Acceso libre a todas las herramientas
 * - Sin flujo forzado
 * - Diseño profesional tipo IDE
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
  ChevronDown,
  ChevronRight,
  Menu,
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

type TabId = 
  | 'progress' | 'sessions' | 'pipeline' | 'captions' | 'planner' | 'export'
  | 'templates' | 'metadata' | 'trigger' | 'duplicates' | 'classimages'
  | 'quality' | 'history' | 'backup' | 'report'
  | 'dashboard' | 'wordcloud' | 'recommender'
  | 'doctor' | 'photoguide' | 'timer' | 'glossary' | 'mistakes' | 'help';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAVIGATION: NavCategory[] = [
  {
    id: 'main',
    label: 'Principal',
    icon: <Layers className="w-4 h-4" />,
    items: [
      { id: 'progress', label: 'Mi Progreso', icon: <CheckCircle2 className="w-4 h-4" />, component: <ProgressChecklist /> },
      { id: 'sessions', label: 'Sesiones', icon: <Database className="w-4 h-4" />, component: <SessionHistory onNewSession={() => {}} /> },
      { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-4 h-4" />, component: <DatasetPipeline onComplete={() => {}} /> },
      { id: 'captions', label: 'Captions', icon: <FileText className="w-4 h-4" />, component: <div className="space-y-6"><BatchOperations /><CaptionPreview onExport={() => {}} onBack={() => {}} /></div> },
      { id: 'planner', label: 'Planner', icon: <Calculator className="w-4 h-4" />, component: <TrainingPlanner /> },
      { id: 'export', label: 'Exportar', icon: <FileCode2 className="w-4 h-4" />, component: <KohyaConfigExporter /> },
    ],
  },
  {
    id: 'dataset',
    label: 'Dataset',
    icon: <Database className="w-4 h-4" />,
    items: [
      { id: 'templates', label: 'Plantillas', icon: <Sparkles className="w-4 h-4" />, component: <CaptionTemplates /> },
      { id: 'metadata', label: 'Metadata', icon: <Info className="w-4 h-4" />, component: <MetadataExtractor /> },
      { id: 'trigger', label: 'Trigger Word', icon: <Hash className="w-4 h-4" />, component: <TriggerManager /> },
      { id: 'duplicates', label: 'Duplicados', icon: <Search className="w-4 h-4" />, component: <DuplicateDetector /> },
      { id: 'classimages', label: 'Class Images', icon: <Target className="w-4 h-4" />, component: <ClassImageGenerator /> },
    ],
  },
  {
    id: 'training',
    label: 'Entrenamiento',
    icon: <Calculator className="w-4 h-4" />,
    items: [
      { id: 'quality', label: 'Calidad', icon: <Shield className="w-4 h-4" />, component: <QualityChecker /> },
      { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" />, component: <ChangeHistory /> },
      { id: 'backup', label: 'Backup', icon: <Save className="w-4 h-4" />, component: <BackupRestore /> },
      { id: 'report', label: 'Reporte', icon: <FileText className="w-4 h-4" />, component: <FinalReport /> },
    ],
  },
  {
    id: 'analysis',
    label: 'Análisis',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, component: <Dashboard /> },
      { id: 'wordcloud', label: 'Word Cloud', icon: <Type className="w-4 h-4" />, component: <WordCloudAnalyzer /> },
      { id: 'recommender', label: 'Recomendador', icon: <Lightbulb className="w-4 h-4" />, component: <SmartRecommender /> },
    ],
  },
  {
    id: 'help',
    label: 'Ayuda',
    icon: <HelpCircle className="w-4 h-4" />,
    items: [
      { id: 'doctor', label: 'Dr. Dataset', icon: <AlertCircle className="w-4 h-4" />, component: <DatasetDoctor /> },
      { id: 'photoguide', label: 'Foto Guía', icon: <Sparkles className="w-4 h-4" />, component: <PhotoGuide /> },
      { id: 'timer', label: 'Calculadora', icon: <Calculator className="w-4 h-4" />, component: <TimeCalculator /> },
      { id: 'glossary', label: 'Glosario', icon: <BookOpen className="w-4 h-4" />, component: <InteractiveGlossary /> },
      { id: 'mistakes', label: 'Errores Comunes', icon: <AlertCircle className="w-4 h-4" />, component: <CommonMistakes /> },
      { id: 'help', label: 'Centro de Ayuda', icon: <HelpCircle className="w-4 h-4" />, component: <HelpCenter /> },
    ],
  },
];

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('progress');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['main']));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { activeSessionId, sessions, deleteSession, setActiveSession } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const toggleCategory = (catId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

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

  // Encontrar el componente activo
  const activeComponent = NAVIGATION
    .flatMap((cat) => cat.items)
    .find((item) => item.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-slate-900 border-r border-slate-800 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">LoRA Pipeline Pro</h1>
              <p className="text-xs text-slate-400">Dataset Tool</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAVIGATION.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200">
                  {category.icon}
                  <span className="text-sm font-medium">{category.label}</span>
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {expandedCategories.has(category.id) && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === item.id
                          ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Info de sesión activa */}
        {activeSession && (
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-500 font-medium">Proyecto Activo</div>
              <div className="text-sm text-white font-medium truncate">{activeSession.nombre_proyecto}</div>
              <div className="text-xs text-cyan-400 font-mono">{activeSession.trigger_word}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-slate-400" /> : <Menu className="w-5 h-5 text-slate-400" />}
              </button>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {NAVIGATION.flatMap((cat) => cat.items).find((item) => item.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Wizard</span>
              </button>

              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/20 transition-colors"
              >
                <Map className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Tour</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!activeSession}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Limpiar</span>
              </button>

              {onDatasetReady && activeSession && (
                <button
                  onClick={handleDatasetReady}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-green-600/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Dataset Listo</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm min-h-[calc(100vh-12rem)]">
            {activeComponent}
          </div>
        </main>
      </div>

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
        onNavigate={(tab) => setActiveTab(tab as TabId)}
      />

      {/* Wizard Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setActiveTab('sessions');
        }}
      />

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => setActiveTab(tab as TabId)}
        onValidateAll={handleExport}
        onExport={handleExport}
      />
    </div>
  );
}
