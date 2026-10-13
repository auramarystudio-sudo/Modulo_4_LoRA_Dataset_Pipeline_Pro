/**
 * TimeCalculator - Calculadora de tiempo de entrenamiento
 * 
 * Estima cuánto tardará el entrenamiento según el hardware del usuario,
 * la cantidad de imágenes y los parámetros configurados.
 */

import { useState } from 'react';
import {
  Clock,
  Cpu,
  Image,
  Calculator,
  Info,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface GPUSpec {
  name: string;
  vram: number; // GB
  speedFactor: number; // relativo (1.0 = referencia)
  tier: 'low' | 'mid' | 'high' | 'enthusiast';
}

const GPUS: GPUSpec[] = [
  { name: 'GTX 1650 (4GB)', vram: 4, speedFactor: 0.3, tier: 'low' },
  { name: 'GTX 1660 Super (6GB)', vram: 6, speedFactor: 0.45, tier: 'low' },
  { name: 'RTX 2060 (6GB)', vram: 6, speedFactor: 0.5, tier: 'low' },
  { name: 'RTX 3050 (8GB)', vram: 8, speedFactor: 0.55, tier: 'mid' },
  { name: 'RTX 2070 (8GB)', vram: 8, speedFactor: 0.6, tier: 'mid' },
  { name: 'RTX 3060 (12GB)', vram: 12, speedFactor: 0.75, tier: 'mid' },
  { name: 'RTX 3070 (8GB)', vram: 8, speedFactor: 0.8, tier: 'mid' },
  { name: 'RTX 3080 (10GB)', vram: 10, speedFactor: 0.9, tier: 'high' },
  { name: 'RTX 3090 (24GB)', vram: 24, speedFactor: 1.0, tier: 'high' },
  { name: 'RTX 4060 Ti (16GB)', vram: 16, speedFactor: 0.85, tier: 'mid' },
  { name: 'RTX 4070 (12GB)', vram: 12, speedFactor: 1.0, tier: 'high' },
  { name: 'RTX 4070 Ti (12GB)', vram: 12, speedFactor: 1.15, tier: 'high' },
  { name: 'RTX 4080 (16GB)', vram: 16, speedFactor: 1.4, tier: 'high' },
  { name: 'RTX 4090 (24GB)', vram: 24, speedFactor: 1.8, tier: 'enthusiast' },
  { name: 'RTX 5080 (16GB)', vram: 16, speedFactor: 1.9, tier: 'enthusiast' },
  { name: 'RTX 5090 (32GB)', vram: 32, speedFactor: 2.2, tier: 'enthusiast' },
];

const TIER_COLORS = {
  low: 'text-red-400 bg-red-900/20 border-red-700/30',
  mid: 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30',
  high: 'text-green-400 bg-green-900/20 border-green-700/30',
  enthusiast: 'text-purple-400 bg-purple-900/20 border-purple-700/30',
};

const TIER_LABELS = {
  low: 'Básica',
  mid: 'Media',
  high: 'Alta',
  enthusiast: 'Entusiasta',
};

function formatTime(minutes: number): string {
  if (minutes < 1) return 'Menos de 1 minuto';
  if (minutes < 60) return `${Math.round(minutes)} minutos`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return `${hours}h ${mins}min`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export default function TimeCalculator() {
  const [selectedGpu, setSelectedGpu] = useState<number>(5); // RTX 3060 by default
  const [numImages, setNumImages] = useState(25);
  const [resolution, setResolution] = useState<'512' | '768' | '1024'>('512');
  const [networkDim, setNetworkDim] = useState(32);
  const [targetSteps, setTargetSteps] = useState(2000);

  const gpu = GPUS[selectedGpu];

  // Cálculos
  const resolutionMultiplier = resolution === '512' ? 1 : resolution === '768' ? 1.8 : 3.2;
  const dimMultiplier = networkDim / 32; // 32 es la referencia
  
  // Segundos por step en una RTX 3090 a 512px con dim 32 (referencia)
  const baseSecondsPerStep = 1.5;
  
  const secondsPerStep = (baseSecondsPerStep * resolutionMultiplier * dimMultiplier) / gpu.speedFactor;
  const totalSeconds = secondsPerStep * targetSteps;
  const totalMinutes = totalSeconds / 60;

  // Calcular repeats y epochs recomendados
  const repeats = Math.max(1, Math.round(200 / numImages));
  const dataPerEpoch = numImages * repeats;
  const epochs = Math.max(1, Math.round(targetSteps / dataPerEpoch));
  const actualSteps = dataPerEpoch * epochs;

  // VRAM estimada
  const baseVRAM = resolution === '512' ? 4 : resolution === '768' ? 6 : 8;
  const vramForDim = (networkDim / 32) * 1;
  const estimatedVRAM = baseVRAM + vramForDim;
  const vramOk = estimatedVRAM <= gpu.vram;

  // Recomendación
  const getRecommendation = () => {
    if (!vramOk) {
      return {
        level: 'error' as const,
        message: `Tu GPU no tiene suficiente VRAM para esta configuración. Necesitas ~${estimatedVRAM.toFixed(1)}GB pero solo tienes ${gpu.vram}GB.`,
        suggestion: `Baja la resolución a ${resolution === '1024' ? '768' : '512'}px o reduce la Network Dim.`,
      };
    }
    if (totalMinutes > 480) {
      return {
        level: 'warning' as const,
        message: `El entrenamiento tomará ${formatTime(totalMinutes)}. Es bastante tiempo.`,
        suggestion: 'Considera reducir los pasos o la resolución para acelerar. Puedes empezar con menos y ver si el resultado te convence.',
      };
    }
    if (totalMinutes < 5) {
      return {
        level: 'info' as const,
        message: `¡Muy rápido! Solo ${formatTime(totalMinutes)}.`,
        suggestion: 'Con tiempos tan cortos, podrías aumentar los pasos para un mejor resultado.',
      };
    }
    return {
      level: 'good' as const,
      message: `Tiempo estimado: ${formatTime(totalMinutes)}. Duración razonable.`,
      suggestion: 'Esta configuración está bien balanceada para tu hardware.',
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-slate-100">Calculadora de Tiempo de Entrenamiento</h2>
        </div>
        <p className="text-sm text-slate-400">
          Estima cuánto tardará tu entrenamiento según tu hardware y configuración. 
          <span className="text-blue-400"> Ajusta los valores para ver cómo cambia el tiempo.</span>
        </p>
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GPU */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Cpu className="w-4 h-4 text-blue-400" />
            Tu GPU
          </label>
          <select
            value={selectedGpu}
            onChange={(e) => setSelectedGpu(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {GPUS.map((g, i) => (
              <option key={i} value={i}>{g.name} - {g.vram}GB VRAM</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${TIER_COLORS[gpu.tier]}`}>
              {TIER_LABELS[gpu.tier]}
            </span>
            <span className="text-xs text-slate-500">{gpu.vram}GB VRAM</span>
          </div>
        </div>

        {/* Images */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Image className="w-4 h-4 text-green-400" />
            Número de imágenes
          </label>
          <input
            type="range"
            min={5}
            max={100}
            value={numImages}
            onChange={(e) => setNumImages(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5</span>
            <span className="text-cyan-400 font-medium">{numImages} imágenes</span>
            <span>100</span>
          </div>
        </div>

        {/* Resolution */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Resolución
          </label>
          <div className="flex gap-2">
            {(['512', '768', '1024'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                disabled={res !== '512' && gpu.vram < (res === '768' ? 8 : 12)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  resolution === res
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                {res}px
              </button>
            ))}
          </div>
          {resolution !== '512' && gpu.vram < (resolution === '768' ? 8 : 12) && (
            <p className="text-xs text-red-400">Tu GPU no tiene suficiente VRAM para esta resolución</p>
          )}
        </div>

        {/* Network Dim */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
            <Zap className="w-4 h-4 text-yellow-400" />
            Network Dimension
          </label>
          <div className="flex gap-2">
            {[8, 16, 32, 64, 128].map((dim) => (
              <button
                key={dim}
                onClick={() => setNetworkDim(dim)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  networkDim === dim
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {networkDim <= 16 && 'Básico: aprende menos, más rápido'}
            {networkDim === 32 && 'Estándar: buen equilibrio'}
            {networkDim >= 64 && 'Avanzado: aprende más, pero necesita más datos'}
          </p>
        </div>
      </div>

      {/* Target Steps */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Calculator className="w-4 h-4 text-cyan-400" />
          Pasos objetivo de entrenamiento
        </label>
        <input
          type="range"
          min={500}
          max={10000}
          step={100}
          value={targetSteps}
          onChange={(e) => setTargetSteps(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>500</span>
          <span className="text-cyan-400 font-medium text-sm">{targetSteps.toLocaleString()} steps</span>
          <span>10,000</span>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Resultado Estimado
        </h3>

        {/* Time display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-cyan-400">{formatTime(totalMinutes)}</div>
          <p className="text-sm text-slate-400 mt-2">Tiempo estimado de entrenamiento</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-200">{actualSteps.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Steps totales</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-200">{epochs}</div>
            <div className="text-xs text-slate-500">Epochs</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-slate-200">{repeats}</div>
            <div className="text-xs text-slate-500">Repeats</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${vramOk ? 'text-green-400' : 'text-red-400'}`}>
              {estimatedVRAM.toFixed(1)}GB
            </div>
            <div className="text-xs text-slate-500">VRAM necesaria</div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`rounded-xl p-4 border ${
          recommendation.level === 'error' ? 'bg-red-900/20 border-red-700/30' :
          recommendation.level === 'warning' ? 'bg-yellow-900/20 border-yellow-700/30' :
          recommendation.level === 'good' ? 'bg-green-900/20 border-green-700/30' :
          'bg-blue-900/20 border-blue-700/30'
        }`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              recommendation.level === 'error' ? 'text-red-400' :
              recommendation.level === 'warning' ? 'text-yellow-400' :
              recommendation.level === 'good' ? 'text-green-400' :
              'text-blue-400'
            }`} />
            <div>
              <p className={`text-sm ${
                recommendation.level === 'error' ? 'text-red-300' :
                recommendation.level === 'warning' ? 'text-yellow-300' :
                recommendation.level === 'good' ? 'text-green-300' :
                'text-blue-300'
              }`}>{recommendation.message}</p>
              <p className="text-xs text-slate-400 mt-1">{recommendation.suggestion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-200 mb-3">📋 Referencia rápida: Pasos recomendados según cantidad de imágenes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-slate-400 font-medium">Imágenes</th>
                <th className="text-left py-2 text-slate-400 font-medium">Repeats</th>
                <th className="text-left py-2 text-slate-400 font-medium">Epochs</th>
                <th className="text-left py-2 text-slate-400 font-medium">Steps aprox.</th>
                <th className="text-left py-2 text-slate-400 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-2">10-15</td>
                <td>15-20</td>
                <td>6-10</td>
                <td>1500-3000</td>
                <td className="text-yellow-400">Pocas imágenes, más epochs</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2">15-25</td>
                <td>8-12</td>
                <td>5-8</td>
                <td>1500-2500</td>
                <td className="text-green-400">Cantidad ideal</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2">25-40</td>
                <td>5-8</td>
                <td>4-6</td>
                <td>1000-2000</td>
                <td className="text-green-400">Menos epochs necesarios</td>
              </tr>
              <tr>
                <td className="py-2">40-100</td>
                <td>2-5</td>
                <td>3-5</td>
                <td>800-1500</td>
                <td className="text-blue-400">Muchas imágenes, pocos epochs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 text-center">
        ⚠️ Los tiempos son estimaciones aproximadas. El tiempo real puede variar según otros factores 
        como el modelo base, optimizadores, y configuración del sistema.
      </p>
    </div>
  );
}
