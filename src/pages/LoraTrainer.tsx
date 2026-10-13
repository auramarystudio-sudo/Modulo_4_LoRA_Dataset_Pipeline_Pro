/**
 * LoraTrainer - Interfaz autocontenida con pills horizontales
 * 
 * Diseño para integrarse como submódulo:
 * - Sin sidebar propio (usa el del módulo principal)
 * - Pills horizontales organizadas por categoría
 * - Header compacto con acciones esenciales
 * - Aprovecha todo el ancho disponible
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

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'main' | 'dataset' | 'training' | 'analysis' | 'help';
}

const TABS: Tab[] = [
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

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('progress');
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

  // Agrupar tabs por categoría
  const tabsByCategory = Object.entries(CATEGORIES).reduce((acc, [catKey, catInfo]) => {
    const categoryTabs = TABS.filter((tab) => tab.category === catKey);
    if (categoryTabs.length > 0) {
      acc[catKey] = { info: catInfo, tabs: categoryTabs };
    }
    return acc;
  }, {} as Record<string, { info: typeof CATEGORIES[keyof typeof CATEGORIES]; tabs: Tab[] }>);

  return (
    <div className="w-full">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LoRA Pipeline Pro</h1>
            <p className="text-xs text-slate-400">Herramientas de entrenamiento</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 transition-colors text-sm"
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Wizard</span>
          </button>

          <button
            onClick={() => setShowTour(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-600/20 transition-colors text-sm"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!activeSession}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>

          {onDatasetReady && activeSession && (
            <button
              onClick={handleDatasetReady}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-lg shadow-green-600/20 transition-all text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Dataset Listo</span>
            </button>
          )}
        </div>
      </div>

      {/* Pills horizontales organizadas por categoría */}
      <div className="space-y-4 mb-6">
        {Object.entries(tabsByCategory).map(([catKey, { info, tabs }]) => (
          <div key={catKey}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${info.color}`}></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {info.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm min-h-[600px]">
        {TABS.find((tab) => tab.id === activeTab)?.component}
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
