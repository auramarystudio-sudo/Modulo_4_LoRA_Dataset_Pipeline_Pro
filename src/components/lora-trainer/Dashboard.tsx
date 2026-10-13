/**
 * Dashboard - Vista general con métricas y estadísticas visuales
 * 
 * Proporciona una visión completa del estado del dataset:
 * - Progreso general del pipeline
 * - Gráficos de distribución de captions
 * - Métricas clave (imágenes, validados, cobertura trigger)
 * - Estado de cada fase del proceso
 * - Timeline de actividad
 */

import { useMemo } from 'react';
import {
  BarChart3,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Target,
  Layers,
  FileText,
  Zap,
  Activity,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { validateDataset } from '../../utils/dataset-validator';
import type { TrainingSession, CaptionEntry, PipelineLogLine } from '../../types/lora-trainer';

export default function Dashboard() {
  const {
    sessions,
    activeSessionId,
    pipelineState,
    droppedImages,
  } = useLoraTrainerStore();

  const activeSession = sessions.find((s: TrainingSession) => s.id === activeSessionId);
  const captions: CaptionEntry[] = activeSession?.captions_generados || [];

  // Validación del dataset activo
  const validation = useMemo(() => {
    if (!activeSession) return null;
    return validateDataset(captions, activeSession.trigger_word);
  }, [captions, activeSession]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s: TrainingSession) => s.estado === 'completado').length;
    const totalCaptions = sessions.reduce((sum: number, s: TrainingSession) => sum + s.captions_generados.length, 0);
    const validatedCaptions = sessions.reduce(
      (sum: number, s: TrainingSession) => sum + s.captions_generados.filter((c: CaptionEntry) => c.validated).length, 0
    );
    const withMetadata = sessions.reduce(
      (sum: number, s: TrainingSession) => sum + s.captions_generados.filter((c: CaptionEntry) => c.originalMetadata && Object.keys(c.originalMetadata).length > 0).length, 0
    );

    return {
      totalSessions,
      completedSessions,
      totalCaptions,
      validatedCaptions,
      withMetadata,
      validationRate: totalCaptions > 0 ? Math.round((validatedCaptions / totalCaptions) * 100) : 0,
      metadataCoverage: totalCaptions > 0 ? Math.round((withMetadata / totalCaptions) * 100) : 0,
    };
  }, [sessions]);

  // Distribución de longitud de captions (para gráfico)
  const lengthDistribution = useMemo(() => {
    const buckets = [
      { range: '0-50', count: 0 },
      { range: '51-100', count: 0 },
      { range: '101-150', count: 0 },
      { range: '151-200', count: 0 },
      { range: '201-300', count: 0 },
      { range: '300+', count: 0 },
    ];

    captions.forEach((c: CaptionEntry) => {
      const len = c.caption.length;
      if (len <= 50) buckets[0].count++;
      else if (len <= 100) buckets[1].count++;
      else if (len <= 150) buckets[2].count++;
      else if (len <= 200) buckets[3].count++;
      else if (len <= 300) buckets[4].count++;
      else buckets[5].count++;
    });

    return buckets;
  }, [captions]);

  // Fases del pipeline
  const phases = useMemo(() => {
    const p = [
      { id: 'session', name: 'Sesión creada', done: !!activeSession, icon: <Layers className="w-4 h-4" /> },
      { id: 'images', name: 'Imágenes cargadas', done: captions.length > 0 || droppedImages.length > 0, icon: <ImageIcon className="w-4 h-4" /> },
      { id: 'captions', name: 'Captions generados', done: captions.length > 0, icon: <FileText className="w-4 h-4" /> },
      { id: 'validated', name: 'Captions validados', done: captions.length > 0 && captions.every((c: CaptionEntry) => c.validated), icon: <CheckCircle2 className="w-4 h-4" /> },
      { id: 'planned', name: 'Entrenamiento planificado', done: !!activeSession?.pasos_recomendados, icon: <Target className="w-4 h-4" /> },
      { id: 'ready', name: 'Listo para exportar', done: validation?.valid === true, icon: <Zap className="w-4 h-4" /> },
    ];
    return p;
  }, [activeSession, captions, droppedImages, validation]);

  const completedPhases = phases.filter(p => p.done).length;
  const overallProgress = Math.round((completedPhases / phases.length) * 100);

  // Max para el gráfico de barras
  const maxBarCount = Math.max(...lengthDistribution.map(b => b.count), 1);

  if (!activeSession) {
    return (
      <div className="space-y-6">
        {/* Resumen global */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Dashboard General</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              icon={<Layers className="w-5 h-5 text-blue-400" />}
              value={metrics.totalSessions}
              label="Sesiones totales"
              color="blue"
            />
            <MetricCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
              value={metrics.completedSessions}
              label="Completadas"
              color="green"
            />
            <MetricCard
              icon={<FileText className="w-5 h-5 text-purple-400" />}
              value={metrics.totalCaptions}
              label="Total captions"
              color="purple"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
              value={`${metrics.validationRate}%`}
              label="Tasa validación"
              color="cyan"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200 mb-2">Sin sesión activa</h3>
          <p className="text-slate-400">Crea una sesión para ver métricas detalladas del dataset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
        </div>
        <p className="text-sm text-slate-400">
          Sesión activa: <span className="text-cyan-300 font-medium">{activeSession.nombre_proyecto}</span>
        </p>
      </div>

      {/* Progreso general */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Progreso del Pipeline</h3>
          <span className="text-2xl font-bold text-cyan-400">{overallProgress}%</span>
        </div>
        
        {/* Barra de progreso general */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Fases */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                phase.done
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <div className={phase.done ? 'text-green-400' : 'text-slate-500'}>
                {phase.icon}
              </div>
              <span className={`text-xs text-center ${phase.done ? 'text-green-300' : 'text-slate-500'}`}>
                {phase.name}
              </span>
              {phase.done && <CheckCircle2 className="w-3 h-3 text-green-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Métricas clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          icon={<ImageIcon className="w-5 h-5 text-blue-400" />}
          value={captions.length}
          label="Imágenes"
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          value={captions.filter(c => c.validated).length}
          label="Validados"
          color="green"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
          value={validation?.warnings.length || 0}
          label="Advertencias"
          color="yellow"
        />
        <MetricCard
          icon={<Target className="w-5 h-5 text-purple-400" />}
          value={`${validation?.stats.triggerCoverage || 0}%`}
          label="Trigger coverage"
          color="purple"
        />
      </div>

      {/* Gráfico de distribución + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de longitud */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Distribución de longitud de captions
          </h3>
          
          {captions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Sin captions para analizar
            </div>
          ) : (
            <div className="space-y-2">
              {lengthDistribution.map((bucket) => (
                <div key={bucket.range} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16 text-right font-mono">{bucket.range}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-6 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(bucket.count / maxBarCount) * 100}%`, minWidth: bucket.count > 0 ? '2rem' : '0' }}
                    >
                      {bucket.count > 0 && (
                        <span className="text-xs text-white font-medium">{bucket.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Promedio: <span className="text-slate-200 font-medium">{validation?.stats.avgCaptionLength || 0} chars</span></span>
              <span>Total: <span className="text-slate-200 font-medium">{captions.length}</span></span>
            </div>
          </div>
        </div>

        {/* Estadísticas de la sesión */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Estadísticas de la Sesión
          </h3>
          
          <div className="space-y-4">
            <StatRow label="Trigger word" value={activeSession.trigger_word} mono />
            <StatRow label="Resolución objetivo" value={`${activeSession.resolucion_objetivo}px`} />
            <StatRow label="Estado" value={activeSession.estado} status={activeSession.estado} />
            <StatRow label="Pasos recomendados" value={activeSession.pasos_recomendados?.toLocaleString() || 'No calculados'} />
            <StatRow label="Class images prompts" value={String(activeSession.class_images_prompts.length)} />
            <StatRow
              label="Cobertura metadata"
              value={`${metrics.metadataCoverage}%`}
              highlight={metrics.metadataCoverage > 50}
            />
            <StatRow
              label="Tasa de validación"
              value={`${metrics.validationRate}%`}
              highlight={metrics.validationRate > 80}
            />
          </div>

          {/* Recomendaciones */}
          {validation && validation.warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Recomendaciones
              </h4>
              <ul className="space-y-1">
                {validation.warnings.slice(0, 3).map((w: { message: string }, i: number) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Timeline de actividad */}
      {pipelineState.logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Actividad Reciente
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pipelineState.logs.slice(-10).reverse().map((log: PipelineLogLine, i: number) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-slate-600 font-mono w-16">{log.timestamp.slice(11, 19)}</span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  log.level === 'error' ? 'bg-red-400' :
                  log.level === 'warning' ? 'bg-yellow-400' :
                  log.level === 'success' ? 'bg-green-400' :
                  'bg-slate-500'
                }`} />
                <span className="text-slate-300 truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'red';
}

function MetricCard({ icon, value, label, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700/30',
    green: 'bg-green-900/20 border-green-700/30',
    yellow: 'bg-yellow-900/20 border-yellow-700/30',
    purple: 'bg-purple-900/20 border-purple-700/30',
    cyan: 'bg-cyan-900/20 border-cyan-700/30',
    red: 'bg-red-900/20 border-red-700/30',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  mono?: boolean;
  status?: string;
  highlight?: boolean;
}

function StatRow({ label, value, mono, status, highlight }: StatRowProps) {
  const statusColors: Record<string, string> = {
    planificacion: 'text-yellow-300',
    procesando: 'text-blue-300',
    completado: 'text-green-300',
    error: 'text-red-300',
  };

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${
        status ? statusColors[status] || 'text-slate-200' :
        highlight ? 'text-green-300' :
        mono ? 'text-cyan-300 font-mono' :
        'text-slate-200'
      }`}>
        {value}
      </span>
    </div>
  );
}
