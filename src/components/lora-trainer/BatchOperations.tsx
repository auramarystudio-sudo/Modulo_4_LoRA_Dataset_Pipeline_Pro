/**
 * BatchOperations - Operaciones en lote sobre captions
 * 
 * Permite seleccionar múltiples captions y aplicar acciones masivas:
 * - Validar/desvalidar todos los seleccionados
 * - Editar caption (agregar/quitar texto a todos)
 * - Agregar prefijo/sufijo
 * - Reemplazar texto
 * - Eliminar seleccionados
 * - Exportar seleccionados
 */

import { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Check,
  X,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Replace,
  Download,
  Wand2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import type { CaptionEntry } from '../../types/lora-trainer';

type BatchAction = 'validate' | 'invalidate' | 'prefix' | 'suffix' | 'replace' | 'append' | 'delete';

interface BatchOperationState {
  selectedIds: Set<string>;
  activeAction: BatchAction | null;
  actionValue: string;
  replaceTarget: string;
}

export default function BatchOperations() {
  const {
    activeSessionId,
    sessions,
    updateCaption,
    validateCaption,
  } = useLoraTrainerStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions: CaptionEntry[] = activeSession?.captions_generados || [];

  const [state, setState] = useState<BatchOperationState>({
    selectedIds: new Set(),
    activeAction: null,
    actionValue: '',
    replaceTarget: '',
  });
  const [showPanel, setShowPanel] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Seleccionar/deseleccionar todos
  const allSelected = captions.length > 0 && state.selectedIds.size === captions.length;
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setState(prev => ({ ...prev, selectedIds: new Set() }));
    } else {
      setState(prev => ({
        ...prev,
        selectedIds: new Set(captions.map(c => c.filename)),
      }));
    }
  };

  const toggleSelect = (filename: string) => {
    setState(prev => {
      const newSet = new Set(prev.selectedIds);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return { ...prev, selectedIds: newSet };
    });
  };

  // Aplicar acción en lote
  const applyBatchAction = () => {
    if (!activeSessionId || state.selectedIds.size === 0 || !state.activeAction) return;

    let count = 0;
    const selectedCaptions = captions.filter(c => state.selectedIds.has(c.filename));

    switch (state.activeAction) {
      case 'validate':
        selectedCaptions.forEach(c => {
          validateCaption(activeSessionId, c.filename, true);
          count++;
        });
        setLastAction(`✅ ${count} captions validados`);
        break;

      case 'invalidate':
        selectedCaptions.forEach(c => {
          validateCaption(activeSessionId, c.filename, false);
          count++;
        });
        setLastAction(`⬜ ${count} captions desvalidados`);
        break;

      case 'prefix':
        if (state.actionValue.trim()) {
          selectedCaptions.forEach(c => {
            updateCaption(activeSessionId, c.filename, `${state.actionValue.trim()} ${c.caption}`);
            count++;
          });
          setLastAction(`➕ Prefijo agregado a ${count} captions`);
        }
        break;

      case 'suffix':
        if (state.actionValue.trim()) {
          selectedCaptions.forEach(c => {
            updateCaption(activeSessionId, c.filename, `${c.caption} ${state.actionValue.trim()}`);
            count++;
          });
          setLastAction(`➕ Sufijo agregado a ${count} captions`);
        }
        break;

      case 'append':
        if (state.actionValue.trim()) {
          selectedCaptions.forEach(c => {
            updateCaption(activeSessionId, c.filename, `${c.caption}, ${state.actionValue.trim()}`);
            count++;
          });
          setLastAction(`➕ Texto agregado a ${count} captions`);
        }
        break;

      case 'replace':
        if (state.replaceTarget && state.actionValue) {
          selectedCaptions.forEach(c => {
            const newCaption = c.caption.split(state.replaceTarget).join(state.actionValue);
            updateCaption(activeSessionId, c.filename, newCaption);
            count++;
          });
          setLastAction(`🔄 Reemplazado en ${count} captions`);
        }
        break;

      case 'delete':
        // En un sistema real, eliminaría del store
        setLastAction(`🗑️ ${count} captions eliminados (demo)`);
        break;
    }

    // Reset
    setState(prev => ({
      ...prev,
      selectedIds: new Set(),
      activeAction: null,
      actionValue: '',
      replaceTarget: '',
    }));

    setTimeout(() => setLastAction(null), 3000);
  };

  // Exportar seleccionados
  const exportSelected = () => {
    if (!activeSession) return;
    const selectedCaptions = captions.filter(c => state.selectedIds.has(c.filename));
    const content = selectedCaptions.map(c => `${c.filename}: ${c.caption}`).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.trigger_word}_selected_captions.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setLastAction(`📥 ${selectedCaptions.length} captions exportados`);
    setTimeout(() => setLastAction(null), 3000);
  };

  if (captions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Barra de control */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                allSelected
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            
            {state.selectedIds.size > 0 && (
              <span className="text-sm text-cyan-300">
                {state.selectedIds.size} seleccionado{state.selectedIds.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPanel(!showPanel)}
              disabled={state.selectedIds.size === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                state.selectedIds.size > 0
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Operaciones en lote
              {showPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {state.selectedIds.size > 0 && (
              <button
                onClick={exportSelected}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
          </div>
        </div>

        {/* Feedback de última acción */}
        {lastAction && (
          <div className="mt-3 bg-green-900/20 border border-green-700/50 rounded-lg p-2 text-sm text-green-300">
            {lastAction}
          </div>
        )}
      </div>

      {/* Panel de operaciones */}
      {showPanel && state.selectedIds.size > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-medium text-slate-300">Selecciona una operación:</h4>
          
          {/* Grid de acciones */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <ActionButton
              icon={<Check className="w-4 h-4" />}
              label="Validar"
              active={state.activeAction === 'validate'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'validate' }))}
              color="green"
            />
            <ActionButton
              icon={<X className="w-4 h-4" />}
              label="Desvalidar"
              active={state.activeAction === 'invalidate'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'invalidate' }))}
              color="yellow"
            />
            <ActionButton
              icon={<Plus className="w-4 h-4" />}
              label="Prefijo"
              active={state.activeAction === 'prefix'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'prefix' }))}
              color="blue"
            />
            <ActionButton
              icon={<Plus className="w-4 h-4" />}
              label="Sufijo"
              active={state.activeAction === 'suffix'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'suffix' }))}
              color="blue"
            />
            <ActionButton
              icon={<Edit3 className="w-4 h-4" />}
              label="Agregar"
              active={state.activeAction === 'append'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'append' }))}
              color="purple"
            />
            <ActionButton
              icon={<Replace className="w-4 h-4" />}
              label="Reemplazar"
              active={state.activeAction === 'replace'}
              onClick={() => setState(prev => ({ ...prev, activeAction: 'replace' }))}
              color="orange"
            />
          </div>

          {/* Input para la acción */}
          {state.activeAction && state.activeAction !== 'validate' && state.activeAction !== 'invalidate' && (
            <div className="space-y-3 bg-slate-800/50 rounded-lg p-4">
              {state.activeAction === 'replace' ? (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Buscar:</label>
                    <input
                      type="text"
                      value={state.replaceTarget}
                      onChange={(e) => setState(prev => ({ ...prev, replaceTarget: e.target.value }))}
                      placeholder="Texto a buscar..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Reemplazar con:</label>
                    <input
                      type="text"
                      value={state.actionValue}
                      onChange={(e) => setState(prev => ({ ...prev, actionValue: e.target.value }))}
                      placeholder="Nuevo texto..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {state.activeAction === 'prefix' ? 'Prefijo a agregar:' :
                     state.activeAction === 'suffix' ? 'Sufijo a agregar:' :
                     'Texto a agregar al final:'}
                  </label>
                  <input
                    type="text"
                    value={state.actionValue}
                    onChange={(e) => setState(prev => ({ ...prev, actionValue: e.target.value }))}
                    placeholder="Escribe el texto..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Preview */}
              {state.actionValue && (
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Preview:</div>
                  <p className="text-sm text-slate-300 font-mono">
                    {state.activeAction === 'prefix' && `${state.actionValue} ${captions[0]?.caption || ''}`}
                    {state.activeAction === 'suffix' && `${captions[0]?.caption || ''} ${state.actionValue}`}
                    {state.activeAction === 'append' && `${captions[0]?.caption || ''}, ${state.actionValue}`}
                    {state.activeAction === 'replace' && (
                      captions[0]?.caption.split(state.replaceTarget).join(state.actionValue) || ''
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botón aplicar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setState(prev => ({ ...prev, activeAction: null, actionValue: '', replaceTarget: '' }))}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={applyBatchAction}
              disabled={
                !state.activeAction ||
                (state.activeAction !== 'validate' && state.activeAction !== 'invalidate' && !state.actionValue.trim()) ||
                (state.activeAction === 'replace' && !state.replaceTarget.trim())
              }
              className={`flex items-center gap-2 font-medium px-6 py-2 rounded-lg transition-colors ${
                state.activeAction && (
                  state.activeAction === 'validate' || state.activeAction === 'invalidate' ||
                  (state.actionValue.trim() && (state.activeAction === 'prefix' || state.activeAction === 'suffix' || state.activeAction === 'append')) ||
                  (state.activeAction === 'replace' && state.replaceTarget.trim() && state.actionValue.trim())
                )
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Aplicar a {state.selectedIds.size} caption{state.selectedIds.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Lista de selección */}
      {state.selectedIds.size > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Seleccionados:</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {Array.from(state.selectedIds).map(filename => (
              <span
                key={filename}
                className="inline-flex items-center gap-1 bg-cyan-900/30 text-cyan-300 border border-cyan-700/50 px-2 py-1 rounded text-xs font-mono"
              >
                {filename}
                <button
                  onClick={() => toggleSelect(filename)}
                  className="text-cyan-400 hover:text-cyan-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
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

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: 'green' | 'yellow' | 'blue' | 'purple' | 'orange';
}

function ActionButton({ icon, label, active, onClick, color }: ActionButtonProps) {
  const colorClasses = {
    green: active ? 'bg-green-600 text-white border-green-500' : 'bg-slate-800 text-green-400 border-slate-700 hover:border-green-600',
    yellow: active ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-slate-800 text-yellow-400 border-slate-700 hover:border-yellow-600',
    blue: active ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-blue-400 border-slate-700 hover:border-blue-600',
    purple: active ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-purple-400 border-slate-700 hover:border-purple-600',
    orange: active ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-800 text-orange-400 border-slate-700 hover:border-orange-600',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
