/**
 * SessionHistory - Historial de sesiones de entrenamiento
 * 
 * Muestra todas las sesiones guardadas con:
 * - Estado visual (colores por estado)
 * - Info del proyecto
 * - Acciones: cargar, eliminar
 * - Integración PocketBase (placeholder)
 */

import { useState } from 'react';
import {
  History,
  Plus,
  Trash2,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import type { SessionEstado } from '../../types/lora-trainer';

interface SessionHistoryProps {
  onNewSession: () => void;
}

// Colores por estado
const estadoStyles: Record<SessionEstado, string> = {
  planificacion: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
  procesando: 'bg-blue-900/30 text-blue-300 border-blue-700 animate-pulse',
  completado: 'bg-green-900/30 text-green-300 border-green-700',
  error: 'bg-red-900/30 text-red-300 border-red-700',
};

const estadoIcons: Record<SessionEstado, React.ReactNode> = {
  planificacion: <Clock className="w-4 h-4" />,
  procesando: <Loader2 className="w-4 h-4 animate-spin" />,
  completado: <CheckCircle2 className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
};

const estadoLabels: Record<SessionEstado, string> = {
  planificacion: 'Planificación',
  procesando: 'Procesando',
  completado: 'Completado',
  error: 'Error',
};

export default function SessionHistory({ onNewSession }: SessionHistoryProps) {
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    deleteSession,
    pocketbaseUrl,
    pocketbaseConnected,
  } = useLoraTrainerStore();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleLoad = (id: string) => {
    setActiveSession(id);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteSession(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Historial de Sesiones</h2>
          </div>
          <button
            onClick={onNewSession}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Sesión
          </button>
        </div>

        {/* Estado PocketBase */}
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${
          pocketbaseConnected
            ? 'bg-green-900/20 border border-green-700/50 text-green-300'
            : 'bg-slate-800/50 border border-slate-700 text-slate-400'
        }`}>
          <Database className="w-4 h-4" />
          <span>
            PocketBase: {pocketbaseConnected ? 'Conectado' : 'Desconectado'} 
            <span className="text-xs ml-2 opacity-70">({pocketbaseUrl})</span>
          </span>
        </div>

        {/* Lista de sesiones */}
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">Sin sesiones</h3>
            <p className="text-slate-400 text-sm mb-4">
              Crea tu primera sesión de entrenamiento LoRA
            </p>
            <button
              onClick={onNewSession}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Crear Sesión
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`border rounded-xl p-4 transition-all ${
                  session.id === activeSessionId
                    ? 'border-cyan-600 bg-cyan-900/10'
                    : 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {session.nombre_proyecto}
                      </h4>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${estadoStyles[session.estado]}`}>
                        {estadoIcons[session.estado]}
                        {estadoLabels[session.estado]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono text-cyan-300">{session.trigger_word}</span>
                      <span>•</span>
                      <span>{session.resolucion_objetivo}px</span>
                      <span>•</span>
                      <span>{session.captions_generados.length} captions</span>
                      {session.created_at && (
                        <>
                          <span>•</span>
                          <span>{new Date(session.created_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    {session.concepto_base && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {session.concepto_base}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoad(session.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        session.id === activeSessionId
                          ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-600'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {session.id === activeSessionId ? 'Activa' : 'Cargar'}
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${
                        confirmDelete === session.id
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-red-300 hover:bg-slate-700'
                      }`}
                      title={confirmDelete === session.id ? 'Click para confirmar' : 'Eliminar'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen estadístico */}
      {sessions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Resumen</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-100">{sessions.length}</div>
              <div className="text-xs text-slate-400">Total sesiones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">
                {sessions.filter(s => s.estado === 'completado').length}
              </div>
              <div className="text-xs text-slate-400">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-300">
                {sessions.reduce((sum, s) => sum + s.captions_generados.length, 0)}
              </div>
              <div className="text-xs text-slate-400">Total captions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">
                {new Set(sessions.map(s => s.trigger_word)).size}
              </div>
              <div className="text-xs text-slate-400">Triggers únicos</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
