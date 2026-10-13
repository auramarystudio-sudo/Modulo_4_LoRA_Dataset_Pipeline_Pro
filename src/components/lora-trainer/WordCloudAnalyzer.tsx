/**
 * WordCloudAnalyzer - Análisis visual de términos en captions
 * 
 * Genera una nube de palabras con los términos más frecuentes
 * Ayuda a identificar:
 * - Patrones comunes en el dataset
 * - Términos sobreutilizados
 * - Oportunidades de diversificación
 */

import { useMemo, useState } from 'react';
import {
  BarChart3,
  Tag,
  Filter,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

// Palabras comunes a ignorar (stop words)
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'what', 'which', 'who', 'whom',
]);

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

export default function WordCloudAnalyzer() {
  const { activeSessionId, sessions } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  const [minFrequency, setMinFrequency] = useState(2);
  const [showStopWords, setShowStopWords] = useState(false);

  // Analizar frecuencia de palabras
  const wordFrequencies = useMemo((): WordFrequency[] => {
    const wordCount = new Map<string, number>();
    let totalWords = 0;

    captions.forEach(caption => {
      // Limpiar y dividir el caption en palabras
      const words = caption.caption
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remover puntuación
        .split(/\s+/)
        .filter(w => w.length > 2); // Solo palabras con más de 2 caracteres

      words.forEach(word => {
        if (!showStopWords && STOP_WORDS.has(word)) return;
        
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
        totalWords++;
      });
    });

    // Convertir a array y ordenar por frecuencia
    const frequencies: WordFrequency[] = Array.from(wordCount.entries())
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? (count / totalWords) * 100 : 0,
      }))
      .filter(w => w.count >= minFrequency)
      .sort((a, b) => b.count - a.count);

    return frequencies;
  }, [captions, minFrequency, showStopWords]);

  // Estadísticas
  const stats = useMemo(() => {
    const uniqueWords = wordFrequencies.length;
    const totalOccurrences = wordFrequencies.reduce((sum, w) => sum + w.count, 0);
    const avgFrequency = uniqueWords > 0 ? totalOccurrences / uniqueWords : 0;
    const topWord = wordFrequencies[0];

    return {
      uniqueWords,
      totalOccurrences,
      avgFrequency: avgFrequency.toFixed(1),
      topWord: topWord?.word || 'N/A',
      topWordCount: topWord?.count || 0,
    };
  }, [wordFrequencies]);

  // Categorizar palabras por frecuencia
  const categories = useMemo(() => {
    const high = wordFrequencies.filter(w => w.count >= 10);
    const medium = wordFrequencies.filter(w => w.count >= 5 && w.count < 10);
    const low = wordFrequencies.filter(w => w.count >= minFrequency && w.count < 5);

    return { high, medium, low };
  }, [wordFrequencies, minFrequency]);

  if (captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin captions para analizar</h3>
        <p className="text-slate-400">Genera captions primero para ver el análisis de palabras.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Análisis de Palabras</h2>
        </div>
        <p className="text-sm text-slate-400">
          Visualiza los términos más frecuentes en tus captions para identificar patrones y oportunidades de diversificación.
        </p>
      </div>

      {/* Controles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <label className="text-sm text-slate-300">Frecuencia mínima:</label>
            <input
              type="number"
              value={minFrequency}
              onChange={(e) => setMinFrequency(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={50}
              className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showStopWords}
              onChange={(e) => setShowStopWords(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-300">Incluir palabras comunes</span>
          </label>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard
          icon={<Tag className="w-5 h-5 text-blue-400" />}
          value={stats.uniqueWords}
          label="Palabras únicas"
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          value={stats.totalOccurrences}
          label="Total ocurrencias"
          color="green"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5 text-purple-400" />}
          value={stats.avgFrequency}
          label="Frecuencia promedio"
          color="purple"
        />
        <StatCard
          icon={<Tag className="w-5 h-5 text-cyan-400" />}
          value={stats.topWord}
          label="Palabra más usada"
          color="cyan"
          mono
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-yellow-400" />}
          value={stats.topWordCount}
          label="Veces usada"
          color="yellow"
        />
      </div>

      {/* Word Cloud Visual */}
      {wordFrequencies.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Nube de Palabras</h3>
          <div className="flex flex-wrap gap-3 justify-center items-center min-h-[200px] p-4 bg-slate-800/30 rounded-lg">
            {wordFrequencies.slice(0, 50).map((wordFreq, index) => {
              // Calcular tamaño basado en frecuencia
              const maxSize = 3; // rem
              const minSize = 0.75; // rem
              const maxCount = wordFrequencies[0]?.count || 1;
              const size = minSize + ((wordFreq.count / maxCount) * (maxSize - minSize));

              // Color basado en frecuencia
              const colors = [
                'text-cyan-400',
                'text-blue-400',
                'text-purple-400',
                'text-pink-400',
                'text-green-400',
                'text-yellow-400',
              ];
              const color = colors[index % colors.length];

              return (
                <span
                  key={wordFreq.word}
                  className={`${color} font-medium hover:scale-110 transition-transform cursor-default`}
                  style={{ fontSize: `${size}rem` }}
                  title={`${wordFreq.word}: ${wordFreq.count} veces (${wordFreq.percentage.toFixed(1)}%)`}
                >
                  {wordFreq.word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorías por frecuencia */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alta frecuencia */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-medium text-red-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Alta Frecuencia (≥10)
          </h4>
          {categories.high.length === 0 ? (
            <p className="text-xs text-slate-500">Sin palabras en esta categoría</p>
          ) : (
            <div className="space-y-2">
              {categories.high.slice(0, 10).map(w => (
                <div key={w.word} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-mono">{w.word}</span>
                  <span className="text-red-400 font-medium">{w.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media frecuencia */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-medium text-yellow-300 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Media Frecuencia (5-9)
          </h4>
          {categories.medium.length === 0 ? (
            <p className="text-xs text-slate-500">Sin palabras en esta categoría</p>
          ) : (
            <div className="space-y-2">
              {categories.medium.slice(0, 10).map(w => (
                <div key={w.word} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-mono">{w.word}</span>
                  <span className="text-yellow-400 font-medium">{w.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Baja frecuencia */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-medium text-green-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Baja Frecuencia (&lt;5)
          </h4>
          {categories.low.length === 0 ? (
            <p className="text-xs text-slate-500">Sin palabras en esta categoría</p>
          ) : (
            <div className="space-y-2">
              {categories.low.slice(0, 10).map(w => (
                <div key={w.word} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-mono">{w.word}</span>
                  <span className="text-green-400 font-medium">{w.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Análisis y Recomendaciones:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              {categories.high.length > 5 && (
                <li>
                  Tienes {categories.high.length} palabras con alta frecuencia. Considera diversificar más los captions.
                </li>
              )}
              {categories.low.length > categories.high.length && (
                <li>
                  Buena diversidad: más palabras únicas que repetidas.
                </li>
              )}
              {stats.topWordCount > 20 && (
                <li>
                  La palabra "{stats.topWord}" aparece {stats.topWordCount} veces. ¿Es tu trigger word o un término muy genérico?
                </li>
              )}
              <li>
                Un dataset balanceado debería tener una distribución variada de términos descriptivos.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'cyan';
  mono?: boolean;
}

function StatCard({ icon, value, label, color, mono }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-900/20 border-blue-700/30',
    green: 'bg-green-900/20 border-green-700/30',
    yellow: 'bg-yellow-900/20 border-yellow-700/30',
    purple: 'bg-purple-900/20 border-purple-700/30',
    cyan: 'bg-cyan-900/20 border-cyan-700/30',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className={`text-2xl font-bold text-slate-100 ${mono ? 'font-mono text-lg' : ''}`}>
        {value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
