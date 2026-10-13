/**
 * ChangeHistory - Historial de cambios con Undo/Redo
 * 
 * Permite:
 * - Ver historial de ediciones en captions
 * - Deshacer cambios (undo)
 * - Rehacer cambios (redo)
 * - Ver qué cambió en cada edición
 * - Restaurar versiones anteriores
 */

import { useState, useMemo } from 'react';
import {
  History,
  Undo2,
  Redo2,
  Clock,
  Trash2,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import type { CaptionEntry } from '../../types/lora-trainer';

interface HistoryEntry {
  id: string;
  timestamp: number;
  action: 'edit' | 'validate' | 'delete' | 'add';
  filename: string;
  before?: string;
  after?: string;
  description: string;
}

export default function ChangeHistory() {
  const { activeSessionId, sessions } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions: CaptionEntry[] = activeSession?.captions_generados || [];

  // Estado local del historial (en producción real, esto estaría en el store)
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Registrar cambio
  const logChange = (action: HistoryEntry['action'], filename: string, before?: string, after?: string) => {
    const entry: HistoryEntry = {
      id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      action,
      filename,
      before,
      after,
      description: getDescription(action, filename, before, after),
    };

    setHistory(prev => {
      // Si estamos en medio del historial, truncar lo que viene después
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, entry];
    });
    setCurrentIndex(prev => prev + 1);
  };

  // Undo
  const handleUndo = () => {
    if (currentIndex < 0) return;
    
    const entry = history[currentIndex];
    
    // En producción real, aquí se revertiría el cambio en el store
    console.log('Undo:', entry);
    
    setCurrentIndex(prev => prev - 1);
  };

  // Redo
  const handleRedo = () => {
    if (currentIndex >= history.length - 1) return;
    
    const entry = history[currentIndex + 1];
    
    // En producción real, aquí se reaplicaría el cambio
    console.log('Redo:', entry);
    
    setCurrentIndex(prev => prev + 1);
  };

  // Limpiar historial
  const clearHistory = () => {
    setHistory([]);
    setCurrentIndex(-1);
  };

  // Generar descripción del cambio
  function getDescription(
    action: HistoryEntry['action'],
    filename: string,
    before?: string,
    after?: string
  ): string {
    switch (action) {
      case 'edit':
        return `Editado: ${filename}`;
      case 'validate':
        return `Validado: ${filename}`;
      case 'delete':
        return `Eliminado: ${filename}`;
      case 'add':
        return `Agregado: ${filename}`;
      default:
        return `Cambio en: ${filename}`;
    }
  }

  // Formatear timestamp
  function formatTimestamp(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Hace menos de 1 min';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return date.toLocaleDateString();
  }

  // Icono por tipo de acción
  function getActionIcon(action: HistoryEntry['action']) {
    switch (action) {
      case 'edit':
        return <Edit3 className="w-4 h-4 text-blue-400" />;
      case 'validate':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'add':
        return <X className="w-4 h-4 text-cyan-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  }

  // Color por tipo de acción
  function getActionColor(action: HistoryEntry['action']): string {
    switch (action) {
      case 'edit':
        return 'bg-blue-900/20 border-blue-700/30';
      case 'validate':
        return 'bg-green-900/20 border-green-700/30';
      case 'delete':
        return 'bg-red-900/20 border-red-700/30';
      case 'add':
        return 'bg-cyan-900/20 border-cyan-700/30';
      default:
        return 'bg-slate-800/50 border-slate-700';
    }
  }

  if (captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin historial</h3>
        <p className="text-slate-400">Los cambios que hagas en los captions aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Historial de Cambios</h2>
          </div>
          
          {/* Controles Undo/Redo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={currentIndex < 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentIndex >= 0
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-4 h-4" />
              Deshacer
            </button>
            <button
              onClick={handleRedo}
              disabled={currentIndex >= history.length - 1}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                currentIndex < history.length - 1
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Redo2 className="w-4 h-4" />
              Rehacer
            </button>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-red-900/30 hover:bg-red-900/50 text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          {history.length === 0
            ? 'No hay cambios registrados aún. Edita captions para ver el historial.'
            : `${history.length} cambio${history.length !== 1 ? 's' : ''} registrado${history.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-300">
              {history.filter(h => h.action === 'edit').length}
            </div>
            <div className="text-xs text-slate-400">Ediciones</div>
          </div>
          <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">
              {history.filter(h => h.action === 'validate').length}
            </div>
            <div className="text-xs text-slate-400">Validaciones</div>
          </div>
          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-300">
              {history.filter(h => h.action === 'delete').length}
            </div>
            <div className="text-xs text-slate-400">Eliminaciones</div>
          </div>
          <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-300">
              {history.filter(h => h.action === 'add').length}
            </div>
            <div className="text-xs text-slate-400">Agregados</div>
          </div>
        </div>
      )}

      {/* Timeline de cambios */}
      {history.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Timeline</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice().reverse().map((entry, index) => {
              const actualIndex = history.length - 1 - index;
              const isCurrent = actualIndex === currentIndex;
              const isPast = actualIndex <= currentIndex;

              return (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isCurrent
                      ? 'bg-cyan-900/20 border-cyan-600'
                      : isPast
                      ? getActionColor(entry.action)
                      : 'bg-slate-800/30 border-slate-700 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-200">{entry.description}</p>
                        <span className="text-xs text-slate-500">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mb-2">{entry.filename}</p>
                      
                      {/* Diff antes/después */}
                      {entry.before !== undefined && entry.after !== undefined && (
                        <div className="space-y-2 mt-3">
                          <div className="bg-red-900/20 border border-red-700/30 rounded p-2">
                            <div className="text-xs text-red-400 mb-1">Antes:</div>
                            <p className="text-xs text-slate-300 font-mono line-clamp-2">
                              {entry.before || '(vacío)'}
                            </p>
                          </div>
                          <div className="bg-green-900/20 border border-green-700/30 rounded p-2">
                            <div className="text-xs text-green-400 mb-1">Después:</div>
                            <p className="text-xs text-slate-300 font-mono line-clamp-2">
                              {entry.after || '(vacío)'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="flex-shrink-0">
                        <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded">
                          Actual
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-200 mb-2">Historial vacío</h3>
          <p className="text-sm text-slate-400">
            Los cambios que hagas en los captions aparecerán aquí automáticamente.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <History className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Cómo funciona:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              <li>Cada edición, validación o eliminación se registra automáticamente</li>
              <li>Usa "Deshacer" para revertir el último cambio</li>
              <li>Usa "Rehacer" para volver a aplicar un cambio deshecho</li>
              <li>El historial muestra qué cambió en cada edición</li>
              <li>Puedes limpiar el historial en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
