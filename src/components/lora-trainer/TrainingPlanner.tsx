/**
 * TrainingPlanner - Calculadora de buckets, pasos y VRAM
 * 
 * Calcula en tiempo real:
 * - Buckets de resolución recomendados
 * - Pasos totales de entrenamiento
 * - VRAM estimada
 * - Tiempo estimado
 * - Alertas de dataset insuficiente/excesivo
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Calculator,
  Monitor,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  HardDrive,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { RESOLUTION_BUCKETS, TRAINING_FORMULAS } from '../../data/lora-defaults';
import type { ResolucionObjetivo } from '../../types/lora-trainer';

export default function TrainingPlanner() {
  const {
    activeSessionId,
    sessions,
    trainingConfig,
    setTrainingConfig,
    updateSession,
  } = useLoraTrainerStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const [numImagenes, setNumImagenes] = useState(trainingConfig.numImagenes || 30);
  const [repeats, setRepeats] = useState(trainingConfig.repeats || 5);
  const [epochs, setEpochs] = useState(trainingConfig.epochs || 10);
  const [batchSize, setBatchSize] = useState(trainingConfig.batchSize || 1);
  const [resolucion, setResolucion] = useState<ResolucionObjetivo>(trainingConfig.resolucion || '1024');

  // Cálculos en tiempo real
  const calculations = useMemo(() => {
    const formula = TRAINING_FORMULAS[resolucion];
    const buckets = RESOLUTION_BUCKETS[resolucion];
    
    // Pasos totales = (num_imagenes * repeats * epochs) / batch_size
    const pasosBase = (numImagenes * repeats * epochs) / batchSize;
    const pasosTotales = Math.round(pasosBase * formula.multiplicador);
    
    // VRAM estimada (bucket más grande)
    const maxBucket = buckets.reduce((max, b) => b.vramEstimadaGB > max.vramEstimadaGB ? b : max, buckets[0]);
    const vramBase = maxBucket.vramEstimadaGB;
    // Ajustar por batch size
    const vramEstimadaGB = Math.round((vramBase + (batchSize - 1) * 1.5) * 10) / 10;
    
    // Tiempo estimado (asumiendo ~0.5s por paso en GPU media)
    const tiempoEstimadoMin = Math.round((pasosTotales * 0.5) / 60);
    
    return {
      pasosTotales: Math.max(pasosTotales, formula.minPasos),
      vramEstimadaGB,
      buckets,
      tiempoEstimadoMin,
      lrRecomendada: formula.lrBase,
      minPasos: formula.minPasos,
      maxPasos: formula.maxPasos,
    };
  }, [resolucion, numImagenes, repeats, epochs, batchSize]);

  // Alertas
  const alerts = useMemo(() => {
    const a: { type: 'warning' | 'error' | 'success'; message: string }[] = [];
    
    if (numImagenes < 15) {
      a.push({ type: 'warning', message: 'Dataset muy pequeño (< 15 imágenes). El LoRA podría sobreajustarse.' });
    }
    if (numImagenes < 5) {
      a.push({ type: 'error', message: 'Dataset insuficiente. Mínimo 5 imágenes para un LoRA básico.' });
    }
    if (numImagenes > 200 && repeats > 1) {
      a.push({ type: 'warning', message: 'Con >200 imágenes, considera reducir repeats a 1-2.' });
    }
    if (calculations.pasosTotales > calculations.maxPasos) {
      a.push({ type: 'warning', message: `Pasos (${calculations.pasosTotales}) exceden máximo recomendado (${calculations.maxPasos}). Reduce epochs o repeats.` });
    }
    if (calculations.pasosTotales < calculations.minPasos) {
      a.push({ type: 'warning', message: `Pasos (${calculations.pasosTotales}) por debajo del mínimo (${calculations.minPasos}). Aumenta epochs o repeats.` });
    }
    if (calculations.vramEstimadaGB > 24) {
      a.push({ type: 'error', message: `VRAM estimada (${calculations.vramEstimadaGB}GB) excede una RTX 4090. Reduce resolución o batch size.` });
    }
    if (numImagenes >= 15 && numImagenes <= 100 && calculations.pasosTotales >= calculations.minPasos) {
      a.push({ type: 'success', message: 'Configuración óptima para entrenamiento LoRA.' });
    }
    
    return a;
  }, [numImagenes, repeats, calculations]);

  // Aplicar configuración
  const handleApply = useCallback(() => {
    setTrainingConfig({
      resolucion,
      numImagenes,
      repeats,
      epochs,
      batchSize,
      pasosTotales: calculations.pasosTotales,
      vramEstimadaGB: calculations.vramEstimadaGB,
      buckets: calculations.buckets,
      tiempoEstimadoMin: calculations.tiempoEstimadoMin,
    });

    if (activeSessionId && activeSession) {
      updateSession(activeSessionId, {
        resolucion_objetivo: resolucion,
        pasos_recomendados: calculations.pasosTotales,
      });
    }
  }, [resolucion, numImagenes, repeats, epochs, batchSize, calculations, setTrainingConfig, activeSessionId, activeSession, updateSession]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Planificador de Entrenamiento</h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Resolución</label>
            <select
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value as ResolucionObjetivo)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="512">512px (SD 1.5)</option>
              <option value="768">768px (Intermedio)</option>
              <option value="1024">1024px (SDXL/Flux)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nº Imágenes</label>
            <input
              type="number"
              value={numImagenes}
              onChange={(e) => setNumImagenes(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={500}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Repeats</label>
            <input
              type="number"
              value={repeats}
              onChange={(e) => setRepeats(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={100}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Epochs</label>
            <input
              type="number"
              value={epochs}
              onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={200}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Batch Size</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={16}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Resultados calculados */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">{calculations.pasosTotales.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Pasos Totales</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <HardDrive className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">{calculations.vramEstimadaGB} GB</div>
            <div className="text-xs text-slate-400">VRAM Estimada</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">~{calculations.tiempoEstimadoMin} min</div>
            <div className="text-xs text-slate-400">Tiempo Estimado</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Monitor className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">{calculations.lrRecomendada.toExponential(0)}</div>
            <div className="text-xs text-slate-400">LR Recomendada</div>
          </div>
        </div>

        {/* Fórmula */}
        <div className="bg-slate-800/30 rounded-lg p-3 mb-6 border border-slate-700/50">
          <p className="text-xs text-slate-400 font-mono">
            pasos = ({numImagenes} imgs × {repeats} repeats × {epochs} epochs) / {batchSize} batch × {TRAINING_FORMULAS[resolucion].multiplicador} = {calculations.pasosTotales.toLocaleString()}
          </p>
        </div>

        {/* Alertas */}
        <div className="space-y-2 mb-6">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                alert.type === 'error'
                  ? 'bg-red-900/20 border border-red-700/50 text-red-300'
                  : alert.type === 'warning'
                  ? 'bg-yellow-900/20 border border-yellow-700/50 text-yellow-300'
                  : 'bg-green-900/20 border border-green-700/50 text-green-300'
              }`}
            >
              {alert.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : alert.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              )}
              {alert.message}
            </div>
          ))}
        </div>

        <button
          onClick={handleApply}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Aplicar Configuración
        </button>
      </div>

      {/* Tabla de Buckets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">
          Buckets de Resolución ({resolucion}px base)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">Resolución</th>
                <th className="text-left py-2 px-3">Ratio</th>
                <th className="text-left py-2 px-3">Imgs Recomendadas</th>
                <th className="text-left py-2 px-3">VRAM</th>
              </tr>
            </thead>
            <tbody>
              {calculations.buckets.map((bucket, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-slate-200 font-mono">{bucket.width}×{bucket.height}</td>
                  <td className="py-2 px-3 text-slate-300">{bucket.ratio}</td>
                  <td className="py-2 px-3 text-cyan-300">{bucket.imagenesRecomendadas}</td>
                  <td className="py-2 px-3">
                    <span className={`${
                      bucket.vramEstimadaGB <= 8 ? 'text-green-400' :
                      bucket.vramEstimadaGB <= 12 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {bucket.vramEstimadaGB} GB
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
