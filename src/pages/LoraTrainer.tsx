/**
 * LoraTrainer - Página principal optimizada
 * 
 * Diseño con Modo Principiante/Experto y navegación por categorías
 */

import { useState, useCallback } from 'react';
import {
  GraduationCap,
  Database,
  FileText,
  Info,
  Calculator,
  Hash,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Sparkles,
  BarChart3,
  Wand2,
  FileCode2,
  Search,
  Target,
  History,
  Type,
  Shield,
  BookOpen,
  Map,
  Save,
  FileText as ReportIcon,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useLoraTrainerStore } from '../store/lora-trainer-store';
import DatasetPipeline from '../components/lora-trainer/DatasetPipeline';
import CaptionPreview from '../components/lora-trainer/CaptionPreview';
import CaptionTemplates from '../components/lora-trainer/CaptionTemplates';
import MetadataExtractor from '../components/lora-trainer/MetadataExtractor';
import TrainingPlanner from '../components/lora-trainer/TrainingPlanner';
import TriggerManager from '../components/lora-trainer/TriggerManager';
import SessionHistory from '../components/lora-trainer/SessionHistory';
import Dashboard from '../components/lora-trainer/Dashboard';
import BatchOperations from '../components/lora-trainer/BatchOperations';
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

type TabId = 'progress' | 'dashboard' | 'sessions' | 'pipeline' | 'captions' | 'templates' | 'metadata' | 'planner' | 'trigger' | 'export' | 'duplicates' | 'classimages' | 'history' | 'wordcloud' | 'quality' | 'doctor' | 'photoguide' | 'timer' | 'glossary' | 'mistakes' | 'help' | 'backup' | 'report' | 'recommender';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'essentials' | 'dataset' | 'training' | 'analysis' | 'help';
  beginnerOnly?: boolean;
}

// Categorías de navegación
const CATEGORIES = {
  essentials: {
    label: '🎯 Esenciales',
    description: 'Lo básico para empezar',
  },
  dataset: {
    label: '📁 Dataset',
    description: 'Preparación de datos',
  },
  training: {
    label: '⚙️ Entrenamiento',
    description: 'Configuración y ejecución',
  },
  analysis: {
    label: '📊 Análisis',
    description: 'Herramientas avanzadas',
  },
  help: {
    label: '💡 Ayuda',
    description: 'Guías y recursos',
  },
};

// Todas las pestañas organizadas por categoría
const ALL_TABS: Tab[] = [
  // ESENCIALES
  { id: 'progress', label: 'Mi Progreso', icon: <CheckCircle2 className="w-4 h-4" />, description: 'Checklist paso a paso', category: 'essentials', beginnerOnly: true },
  { id: 'sessions', label: 'Sesiones', icon: <Database className="w-4 h-4" />, description: 'Crear y gestionar sesiones', category: 'essentials', beginnerOnly: true },
  { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-4 h-4" />, description: 'Procesar imágenes', category: 'essentials', beginnerOnly: true },
  { id: 'captions', label: 'Captions', icon: <FileText className="w-4 h-4" />, description: 'Revisar descripciones', category: 'essentials', beginnerOnly: true },
  { id: 'planner', label: 'Planificar', icon: <Calculator className="w-4 h-4" />, description: 'Configurar entrenamiento', category: 'essentials', beginnerOnly: true },
  { id: 'export', label: 'Exportar', icon: <FileCode2 className="w-4 h-4" />, description: 'Generar config Kohya', category: 'essentials', beginnerOnly: true },
  
  // DATASET
  { id: 'templates', label: 'Plantillas', icon: <Sparkles className="w-4 h-4" />, description: 'Captions por categorías', category: 'dataset' },
  { id: 'metadata', label: 'Metadata', icon: <Info className="w-4 h-4" />, description: 'Info de imágenes PNG', category: 'dataset' },
  { id: 'trigger', label: 'Trigger Word', icon: <Hash className="w-4 h-4" />, description: 'Validar palabra clave', category: 'dataset' },
  { id: 'duplicates', label: 'Duplicados', icon: <Search className="w-4 h-4" />, description: 'Detectar imágenes duplicadas', category: 'dataset' },
  { id: 'classimages', label: 'Class Images', icon: <Target className="w-4 h-4" />, description: 'Generar prompts de clase', category: 'dataset' },
  
  // TRAINING
  { id: 'quality', label: 'Calidad', icon: <Shield className="w-4 h-4" />, description: 'Control de calidad', category: 'training' },
  { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" />, description: 'Cambios y undo/redo', category: 'training' },
  { id: 'backup', label: 'Backup', icon: <Save className="w-4 h-4" />, description: 'Guardar y restaurar', category: 'training' },
  { id: 'report', label: 'Reporte', icon: <ReportIcon className="w-4 h-4" />, description: 'Reporte final', category: 'training' },
  
  // ANALYSIS
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, description: 'Vista general', category: 'analysis' },
  { id: 'wordcloud', label: 'Word Cloud', icon: <Type className="w-4 h-4" />, description: 'Análisis de palabras', category: 'analysis' },
  { id: 'recommender', label: 'Recomendador', icon: <Lightbulb className="w-4 h-4" />, description: 'Sugerencias IA', category: 'analysis' },
  
  // HELP
  { id: 'doctor', label: 'Dr. Dataset', icon: <Info className="w-4 h-4" />, description: 'Diagnóstico automático', category: 'help', beginnerOnly: true },
  { id: 'photoguide', label: 'Foto Guía', icon: <Sparkles className="w-4 h-4" />, description: 'Cómo tomar fotos', category: 'help', beginnerOnly: true },
  { id: 'timer', label: 'Calculadora', icon: <Calculator className="w-4 h-4" />, description: 'Tiempo de entrenamiento', category: 'help', beginnerOnly: true },
  { id: 'glossary', label: 'Glosario', icon: <BookOpen className="w-4 h-4" />, description: 'Términos explicados', category: 'help', beginnerOnly: true },
  { id: 'mistakes', label: 'Errores Comunes', icon: <FileText className="w-4 h-4" />, description: 'Qué evitar', category: 'help', beginnerOnly: true },
  { id: 'help', label: 'Centro de Ayuda', icon: <BookOpen className="w-4 h-4" />, description: 'Guía completa', category: 'help' },
];

interface LoraTrainerProps {
  initialPrompt?: string;
  initialTrigger?: string;
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('progress');
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['essentials', 'help'])
  );
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const { activeSessionId, sessions, createSession } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Filtrar tabs según modo
  const visibleTabs = ALL_TABS.filter((tab) => {
    if (beginnerMode) {
      return tab.beginnerOnly || tab.category === 'essentials';
    }
    return true;
  });

  // Agrupar tabs por categoría
  const tabsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTabs = visibleTabs.filter((tab) => tab.category === catKey);
    if (categoryTabs.length > 0) {
      acc[catKey] = { info: catInfo, tabs: categoryTabs };
    }
    return acc;
  }, {} as Record<string, { info: typeof CATEGORIES[keyof typeof CATEGORIES]; tabs: Tab[] }>);

  const toggleCategory = (cat: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateSession = useCallback((nombre: string, triggerWord: string, conceptoBase: string) => {
    createSession(nombre, triggerWord, conceptoBase);
    setShowNewSessionModal(false);
    setActiveTab('pipeline');
  }, [createSession]);

  const handleExport = useCallback(() => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  }, []);

  const handleDatasetReady = useCallback(() => {
    if (activeSession && onDatasetReady) {
      onDatasetReady(activeSession.trigger_word);
    }
  }, [activeSession, onDatasetReady]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header compacto */}
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="bg-cyan-600/20 p-2 rounded-lg border border-cyan-600/30">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-100">LoRA Pipeline Pro</h1>
                <p className="text-xs text-slate-400">Dataset Training Tool</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              {/* Toggle Modo */}
              <button
                onClick={() => setBeginnerMode(!beginnerMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  beginnerMode
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {beginnerMode ? <Wand2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{beginnerMode ? 'Principiante' : 'Experto'}</span>
              </button>

              {/* Botones de acción */}
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Wizard</span>
              </button>

              <button
                onClick={() => setShowTour(true)}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tour</span>
              </button>

              {onDatasetReady && activeSession && (
                <button
                  onClick={handleDatasetReady}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Listo →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar con navegación por categorías */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 overflow-hidden lg:block fixed lg:sticky top-[65px] left-0 h-[calc(100vh-65px)] bg-slate-900/50 border-r border-slate-800 z-30`}
        >
          <nav className="p-4 space-y-4 overflow-y-auto h-full">
            {Object.entries(tabsByCategory).map(([catKey, { info, tabs }]) => (
              <div key={catKey}>
                <button
                  onClick={() => toggleCategory(catKey)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-200">{info.label}</div>
                    <div className="text-xs text-slate-500">{info.description}</div>
                  </div>
                  {expandedCategories.has(catKey) ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedCategories.has(catKey) && (
                  <div className="mt-1 space-y-0.5 pl-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        {tab.icon}
                        <div className="text-left flex-1">
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-slate-500">{tab.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {/* Mensaje de integración */}
          {initialPrompt && (
            <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">Importado desde Generador</span>
              </div>
              <p className="text-xs text-slate-300">
                Prompt: <span className="text-cyan-200">{initialPrompt}</span>
                {initialTrigger && (
                  <> | Trigger: <span className="text-cyan-200 font-mono">{initialTrigger}</span></>
                )}
              </p>
            </div>
          )}

          {/* Contenido de la pestaña activa */}
          <div className="min-h-[600px]">
            {activeTab === 'progress' && <ProgressChecklist />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'sessions' && (
              <SessionHistory onNewSession={() => setShowNewSessionModal(true)} />
            )}
            {activeTab === 'pipeline' && (
              <DatasetPipeline onComplete={() => setActiveTab('captions')} />
            )}
            {activeTab === 'captions' && (
              <div className="space-y-6">
                <BatchOperations />
                <CaptionPreview
                  onExport={handleExport}
                  onBack={() => setActiveTab('pipeline')}
                />
              </div>
            )}
            {activeTab === 'templates' && <CaptionTemplates />}
            {activeTab === 'metadata' && <MetadataExtractor />}
            {activeTab === 'planner' && <TrainingPlanner />}
            {activeTab === 'trigger' && <TriggerManager />}
            {activeTab === 'export' && <KohyaConfigExporter />}
            {activeTab === 'duplicates' && <DuplicateDetector />}
            {activeTab === 'classimages' && <ClassImageGenerator />}
            {activeTab === 'history' && <ChangeHistory />}
            {activeTab === 'wordcloud' && <WordCloudAnalyzer />}
            {activeTab === 'quality' && <QualityChecker />}
            {activeTab === 'doctor' && <DatasetDoctor />}
            {activeTab === 'photoguide' && <PhotoGuide />}
            {activeTab === 'timer' && <TimeCalculator />}
            {activeTab === 'glossary' && <InteractiveGlossary />}
            {activeTab === 'mistakes' && <CommonMistakes />}
            {activeTab === 'help' && <HelpCenter />}
            {activeTab === 'backup' && <BackupRestore />}
            {activeTab === 'report' && <FinalReport />}
            {activeTab === 'recommender' && <SmartRecommender />}
          </div>
        </main>
      </div>

      {/* Atajos de teclado */}
      <KeyboardShortcuts
        onNavigate={(tab) => setActiveTab(tab as TabId)}
        onValidateAll={handleExport}
        onExport={handleExport}
      />

      {/* Tour Interactivo */}
      <InteractiveTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onNavigate={(tab) => setActiveTab(tab as TabId)}
      />

      {/* Wizard para Principiantes */}
      <BeginnerWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setActiveTab('sessions');
        }}
      />

      {/* Export success toast */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Dataset exportado exitosamente</span>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Nueva Sesión de Entrenamiento</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Proyecto</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mi LoRA de personaje"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Trigger Word</label>
            <input
              type="text"
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              placeholder="mytrigger"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Concepto Base</label>
            <textarea
              value={conceptoBase}
              onChange={(e) => setConceptoBase(e.target.value)}
              placeholder="Describe el concepto que quieres entrenar..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Crear Sesión
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
