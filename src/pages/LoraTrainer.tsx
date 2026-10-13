/**
 * LoraTrainer - Página principal del Módulo 4
 * 
 * Orquesta todos los componentes del pipeline:
 * - SessionHistory: Gestión de sesiones
 * - DatasetPipeline: Ejecución del pipeline Python
 * - CaptionPreview: Previsualización de captions
 * - MetadataExtractor: Visualización de metadatos
 * - TrainingPlanner: Planificación de entrenamiento
 * - TriggerManager: Gestión de trigger words
 * 
 * Integración con Módulo 3 (Generador):
 * - Recibe props de navegación desde el generador
 * - Botón "Dataset Listo" para volver al generador
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

type TabId = 'dashboard' | 'sessions' | 'pipeline' | 'captions' | 'templates' | 'metadata' | 'planner' | 'trigger' | 'export' | 'duplicates' | 'classimages' | 'history' | 'wordcloud' | 'quality' | 'help' | 'backup' | 'report' | 'recommender';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, description: 'Vista general' },
  { id: 'sessions', label: 'Sesiones', icon: <Database className="w-4 h-4" />, description: 'Gestión de sesiones' },
  { id: 'pipeline', label: 'Pipeline', icon: <Layers className="w-4 h-4" />, description: 'Ejecutar pipeline Python' },
  { id: 'captions', label: 'Captions', icon: <FileText className="w-4 h-4" />, description: 'Previsualizar y editar' },
  { id: 'templates', label: 'Plantillas', icon: <Sparkles className="w-4 h-4" />, description: 'Captions por categorías' },
  { id: 'metadata', label: 'Metadata', icon: <Info className="w-4 h-4" />, description: 'PNG Info extraído' },
  { id: 'planner', label: 'Planner', icon: <Calculator className="w-4 h-4" />, description: 'Calcular entrenamiento' },
  { id: 'trigger', label: 'Trigger', icon: <Hash className="w-4 h-4" />, description: 'Validar trigger word' },
  { id: 'export', label: 'Exportar', icon: <FileCode2 className="w-4 h-4" />, description: 'Config Kohya_ss' },
  { id: 'duplicates', label: 'Duplicados', icon: <Search className="w-4 h-4" />, description: 'Detector de duplicados' },
  { id: 'classimages', label: 'Class Images', icon: <Target className="w-4 h-4" />, description: 'Generador de prompts' },
  { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" />, description: 'Cambios y undo/redo' },
  { id: 'wordcloud', label: 'Word Cloud', icon: <Type className="w-4 h-4" />, description: 'Análisis de palabras' },
  { id: 'quality', label: 'Calidad', icon: <Shield className="w-4 h-4" />, description: 'Control de calidad' },
  { id: 'help', label: 'Ayuda', icon: <BookOpen className="w-4 h-4" />, description: 'Guía y glosario' },
  { id: 'backup', label: 'Backup', icon: <Save className="w-4 h-4" />, description: 'Backup y restauración' },
  { id: 'report', label: 'Reporte', icon: <ReportIcon className="w-4 h-4" />, description: 'Reporte final' },
  { id: 'recommender', label: 'Recomendador', icon: <Lightbulb className="w-4 h-4" />, description: 'Sugerencias inteligentes' },
];

interface LoraTrainerProps {
  /** Prompt recibido desde el Módulo 3 (Generador) */
  initialPrompt?: string;
  /** Trigger word recibido desde el Módulo 3 */
  initialTrigger?: string;
  /** Callback para volver al Módulo 3 con trigger configurado */
  onDatasetReady?: (triggerWord: string) => void;
}

export default function LoraTrainer({ initialPrompt, initialTrigger, onDatasetReady }: LoraTrainerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sessions');
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const {
    activeSessionId,
    sessions,
    createSession,
  } = useLoraTrainerStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Crear nueva sesión
  const handleCreateSession = useCallback((nombre: string, triggerWord: string, conceptoBase: string) => {
    createSession(nombre, triggerWord, conceptoBase);
    setShowNewSessionModal(false);
    setActiveTab('pipeline');
  }, [createSession]);

  // Exportar dataset final
  const handleExport = useCallback(() => {
    // Simular exportación (en producción escribiría archivos .txt gemelos)
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  }, []);

  // Dataset listo → volver a generador
  const handleDatasetReady = useCallback(() => {
    if (activeSession && onDatasetReady) {
      onDatasetReady(activeSession.trigger_word);
    }
  }, [activeSession, onDatasetReady]);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-600/20 p-2.5 rounded-xl border border-cyan-600/30">
              <GraduationCap className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">LoRA Dataset Pipeline Pro</h1>
              <p className="text-sm text-slate-400">Preparación profesional de datasets para entrenamiento LoRA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botones de ayuda para principiantes */}
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              title="Asistente paso a paso para principiantes"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Primer LoRA</span>
            </button>
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              title="Tour interactivo por la interfaz"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Tour</span>
            </button>

            {onDatasetReady && activeSession && (
              <button
                onClick={handleDatasetReady}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Dataset Listo →
              </button>
            )}
            {onDatasetReady && (
              <button
                onClick={() => onDatasetReady?.('')}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de integración con Módulo 3 */}
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

        {/* Navegación por tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <div className="min-h-[500px]">
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
          {activeTab === 'help' && <HelpCenter />}
          {activeTab === 'backup' && <BackupRestore />}
          {activeTab === 'report' && <FinalReport />}
          {activeTab === 'recommender' && <SmartRecommender />}
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
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
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
