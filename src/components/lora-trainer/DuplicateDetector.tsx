/**
 * DuplicateDetector - Detecta imágenes duplicadas o muy similares
 * 
 * Analiza el dataset para encontrar:
 * - Archivos con mismo nombre (duplicados exactos)
 * - Captions idénticos o muy similares
 * - Imágenes con metadatos idénticos (mismo seed, prompt, etc.)
 * 
 * Ayuda a evitar overfitting por datos redundantes.
 */

import { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Copy,
  Image as ImageIcon,
  FileText,
  Hash,
  Filter,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import type { CaptionEntry } from '../../types/lora-trainer';

interface DuplicateGroup {
  type: 'exact_caption' | 'similar_caption' | 'same_metadata' | 'same_filename';
  items: CaptionEntry[];
  similarity: number; // 0-1
  reason: string;
}

export default function DuplicateDetector() {
  const { activeSessionId, sessions } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions: CaptionEntry[] = activeSession?.captions_generados || [];

  const [filter, setFilter] = useState<'all' | 'exact' | 'similar' | 'metadata'>('all');
  const [showDetails, setShowDetails] = useState<Set<number>>(new Set());

  // Detectar duplicados
  const duplicates = useMemo((): DuplicateGroup[] => {
    if (captions.length < 2) return [];

    const groups: DuplicateGroup[] = [];

    // 1. Captions idénticos
    const captionMap = new Map<string, CaptionEntry[]>();
    captions.forEach(c => {
      const key = c.caption.trim().toLowerCase();
      if (!captionMap.has(key)) {
        captionMap.set(key, []);
      }
      captionMap.get(key)!.push(c);
    });

    captionMap.forEach((items, key) => {
      if (items.length > 1) {
        groups.push({
          type: 'exact_caption',
          items,
          similarity: 1.0,
          reason: `Caption idéntico: "${key.slice(0, 50)}..."`,
        });
      }
    });

    // 2. Captions muy similares (>90% similaridad)
    for (let i = 0; i < captions.length; i++) {
      for (let j = i + 1; j < captions.length; j++) {
        const sim = calculateSimilarity(captions[i].caption, captions[j].caption);
        if (sim > 0.9 && sim < 1.0) {
          // Verificar si ya están en un grupo
          const alreadyGrouped = groups.some(g =>
            g.type === 'similar_caption' &&
            g.items.some(item => item.filename === captions[i].filename) &&
            g.items.some(item => item.filename === captions[j].filename)
          );

          if (!alreadyGrouped) {
            groups.push({
              type: 'similar_caption',
              items: [captions[i], captions[j]],
              similarity: sim,
              reason: `Captions ${Math.round(sim * 100)}% similares`,
            });
          }
        }
      }
    }

    // 3. Metadatos idénticos (mismo seed, prompt, etc.)
    const metadataMap = new Map<string, CaptionEntry[]>();
    captions.forEach(c => {
      if (c.originalMetadata && c.originalMetadata.seed && c.originalMetadata.prompt) {
        const key = `${c.originalMetadata.seed}-${c.originalMetadata.prompt.slice(0, 50)}`;
        if (!metadataMap.has(key)) {
          metadataMap.set(key, []);
        }
        metadataMap.get(key)!.push(c);
      }
    });

    metadataMap.forEach((items, key) => {
      if (items.length > 1) {
        groups.push({
          type: 'same_metadata',
          items,
          similarity: 1.0,
          reason: `Mismos metadatos (seed: ${items[0].originalMetadata?.seed})`,
        });
      }
    });

    // 4. Nombres de archivo duplicados
    const filenameMap = new Map<string, CaptionEntry[]>();
    captions.forEach(c => {
      const baseName = c.filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase();
      if (!filenameMap.has(baseName)) {
        filenameMap.set(baseName, []);
      }
      filenameMap.get(baseName)!.push(c);
    });

    filenameMap.forEach((items, baseName) => {
      if (items.length > 1) {
        groups.push({
          type: 'same_filename',
          items,
          similarity: 1.0,
          reason: `Nombres de archivo similares: "${baseName}"`,
        });
      }
    });

    return groups;
  }, [captions]);

  // Filtrar duplicados
  const filteredDuplicates = useMemo(() => {
    if (filter === 'all') return duplicates;
    if (filter === 'exact') return duplicates.filter(d => d.type === 'exact_caption');
    if (filter === 'similar') return duplicates.filter(d => d.type === 'similar_caption');
    if (filter === 'metadata') return duplicates.filter(d => d.type === 'same_metadata');
    return duplicates;
  }, [duplicates, filter]);

  // Toggle detalles
  const toggleDetails = (index: number) => {
    setShowDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Estadísticas
  const stats = useMemo(() => {
    const totalDuplicates = duplicates.reduce((sum, g) => sum + g.items.length, 0);
    const exactCount = duplicates.filter(d => d.type === 'exact_caption').length;
    const similarCount = duplicates.filter(d => d.type === 'similar_caption').length;
    const metadataCount = duplicates.filter(d => d.type === 'same_metadata').length;

    return {
      totalGroups: duplicates.length,
      totalDuplicates,
      exactCount,
      similarCount,
      metadataCount,
      duplicatePercentage: captions.length > 0 ? Math.round((totalDuplicates / captions.length) * 100) : 0,
    };
  }, [duplicates, captions]);

  if (captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin captions para analizar</h3>
        <p className="text-slate-400">Genera captions primero para detectar duplicados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Detector de Duplicados</h2>
        </div>
        <p className="text-sm text-slate-400">
          Analiza el dataset para encontrar imágenes duplicadas o muy similares que podrían causar overfitting.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
          value={stats.totalGroups}
          label="Grupos encontrados"
          color="yellow"
        />
        <StatCard
          icon={<Copy className="w-5 h-5 text-red-400" />}
          value={stats.exactCount}
          label="Captions idénticos"
          color="red"
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-orange-400" />}
          value={stats.similarCount}
          label="Captions similares"
          color="orange"
        />
        <StatCard
          icon={<Hash className="w-5 h-5 text-purple-400" />}
          value={stats.metadataCount}
          label="Mismos metadatos"
          color="purple"
        />
        <StatCard
          icon={<ImageIcon className="w-5 h-5 text-cyan-400" />}
          value={`${stats.duplicatePercentage}%`}
          label="% duplicados"
          color="cyan"
        />
      </div>

      {/* Alerta si hay muchos duplicados */}
      {stats.duplicatePercentage > 10 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300 mb-1">
                ⚠️ Alto porcentaje de duplicados detectado
              </p>
              <p className="text-xs text-red-400/80">
                El {stats.duplicatePercentage}% de tus imágenes son duplicadas o muy similares.
                Esto puede causar overfitting. Considera eliminar los duplicados antes de entrenar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sin duplicados */}
      {duplicates.length === 0 && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-300 mb-2">
            ¡No se encontraron duplicados!
          </h3>
          <p className="text-sm text-green-400/80">
            Tu dataset está limpio y listo para entrenar.
          </p>
        </div>
      )}

      {/* Filtros */}
      {duplicates.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Filtrar:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos', count: duplicates.length },
              { id: 'exact', label: 'Idénticos', count: stats.exactCount },
              { id: 'similar', label: 'Similares', count: stats.similarCount },
              { id: 'metadata', label: 'Mismos metadatos', count: stats.metadataCount },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de duplicados */}
      {filteredDuplicates.length > 0 && (
        <div className="space-y-3">
          {filteredDuplicates.map((group, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              {/* Header del grupo */}
              <button
                onClick={() => toggleDetails(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    group.type === 'exact_caption' ? 'bg-red-900/30' :
                    group.type === 'similar_caption' ? 'bg-orange-900/30' :
                    'bg-purple-900/30'
                  }`}>
                    {group.type === 'exact_caption' ? <Copy className="w-4 h-4 text-red-400" /> :
                     group.type === 'similar_caption' ? <FileText className="w-4 h-4 text-orange-400" /> :
                     <Hash className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-slate-200">{group.reason}</p>
                    <p className="text-xs text-slate-400">
                      {group.items.length} imágenes • {Math.round(group.similarity * 100)}% similaridad
                    </p>
                  </div>
                </div>
                <div className="text-slate-500">
                  {showDetails.has(index) ? '▼' : '▶'}
                </div>
              </button>

              {/* Detalles expandibles */}
              {showDetails.has(index) && (
                <div className="border-t border-slate-800 p-4 space-y-2">
                  {group.items.map((item, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-slate-400 mb-1">{item.filename}</p>
                          <p className="text-sm text-slate-300 line-clamp-2">{item.caption}</p>
                          {item.originalMetadata && Object.keys(item.originalMetadata).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(item.originalMetadata).slice(0, 3).map(([k, v]) => (
                                <span key={k} className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs">
                                  {k}: {String(v).slice(0, 20)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recomendaciones */}
      {duplicates.length > 0 && (
        <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-200">
              <p className="font-medium mb-1">Recomendaciones:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
                <li>Elimina captions idénticos para evitar overfitting</li>
                <li>Revisa captions similares y decide si mantener ambos</li>
                <li>Imágenes con mismos metadatos pueden ser variaciones del mismo prompt</li>
                <li>Un dataset diverso es mejor que uno grande con duplicados</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Calcula similaridad entre dos strings (0-1)
 * Usa una versión simplificada de Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Comparación de palabras
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size; // Jaccard similarity
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'yellow' | 'red' | 'orange' | 'purple' | 'cyan';
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow-900/20 border-yellow-700/30',
    red: 'bg-red-900/20 border-red-700/30',
    orange: 'bg-orange-900/20 border-orange-700/30',
    purple: 'bg-purple-900/20 border-purple-700/30',
    cyan: 'bg-cyan-900/20 border-cyan-700/30',
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
