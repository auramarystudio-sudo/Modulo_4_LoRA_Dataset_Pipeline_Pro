/**
 * DatasetPipeline - Componente principal que controla el pipeline Python
 * 
 * Gestiona:
 * - Configuración del pipeline (input/output, método, dry-run)
 * - Ejecución del proceso Python con progreso en tiempo real
 * - Visualización de logs y estado
 * - Transición a CaptionPreview cuando se completa
 */

import { useState, useCallback } from 'react';
import {
  Play,
  Square,
  Settings,
  FolderOpen,
  Cpu,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Zap,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { runDatasetPipeline } from '../../utils/python-runner';
import type { PipelineLogLine, CaptionMethod } from '../../types/lora-trainer';
import { OLLAMA_MODELS } from '../../data/lora-defaults';

interface DatasetPipelineProps {
  onComplete: () => void;
}

export default function DatasetPipeline({ onComplete }: DatasetPipelineProps) {
  const {
    activeSessionId,
    sessions,
    pipelineState,
    pipelineConfig,
    setPipelineState,
    setPipelineConfig,
    addCaptionsToSession,
    updateSessionEstado,
  } = useLoraTrainerStore();

  const [localInputDir, setLocalInputDir] = useState(pipelineConfig.inputDir);
  const [localOutputDir, setLocalOutputDir] = useState(pipelineConfig.outputDir);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Ejecutar el pipeline
  const handleRun = useCallback(async () => {
    if (!activeSession) return;

    const config = {
      inputDir: localInputDir,
      outputDir: localOutputDir,
      triggerWord: activeSession.trigger_word,
      method: pipelineConfig.method,
      model: pipelineConfig.model,
      dryRun: pipelineConfig.dryRun,
      ollamaEndpoint: pipelineConfig.ollamaEndpoint,
    };

    setPipelineConfig({ inputDir: localInputDir, outputDir: localOutputDir });
    setPipelineState({ running: true, progress: 0, logs: [], result: undefined });
    updateSessionEstado(activeSession.id, 'procesando');

    try {
      const result = await runDatasetPipeline(config, (log: PipelineLogLine) => {
        setPipelineState({
          running: true,
          progress: log.progress ?? 0,
          currentFile: log.message.includes('Procesando') ? log.message : undefined,
          logs: [...pipelineState.logs, log],
        });
      });

      // Agregar captions a la sesión
      if (result.success && result.captions.length > 0) {
        addCaptionsToSession(activeSession.id, result.captions);
      }

      updateSessionEstado(activeSession.id, result.success ? 'completado' : 'error');
      
      setPipelineState({
        running: false,
        progress: 100,
        result,
        logs: [...pipelineState.logs, {
          timestamp: new Date().toISOString(),
          level: result.success ? 'success' : 'error',
          message: result.success ? '✅ Pipeline finalizado exitosamente' : `❌ Error: ${result.error}`,
          progress: 100,
        }],
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      updateSessionEstado(activeSession.id, 'error');
      setPipelineState({
        running: false,
        progress: 0,
        logs: [...pipelineState.logs, {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `❌ Error fatal: ${errorMsg}`,
        }],
      });
    }
  }, [activeSession, localInputDir, localOutputDir, pipelineConfig, pipelineState.logs, setPipelineState, setPipelineConfig, addCaptionsToSession, updateSessionEstado]);

  // Detener pipeline (simulado)
  const handleStop = useCallback(() => {
    setPipelineState({ running: false });
    if (activeSession) {
      updateSessionEstado(activeSession.id, 'planificacion');
    }
  }, [activeSession, setPipelineState, updateSessionEstado]);

  if (!activeSession) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">No hay sesión activa</h3>
        <p className="text-slate-400">Crea una nueva sesión de entrenamiento para comenzar el pipeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Pipeline de Dataset</h2>
          </div>
          <div className="flex items-center gap-2">
            {pipelineState.running && (
              <span className="flex items-center gap-2 text-blue-300 text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </span>
            )}
            {pipelineState.result?.success && (
              <span className="flex items-center gap-2 text-green-300 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Completado
              </span>
            )}
          </div>
        </div>

        {/* Info de sesión activa */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Proyecto:</span>
              <span className="ml-2 text-slate-200 font-medium">{activeSession.nombre_proyecto}</span>
            </div>
            <div>
              <span className="text-slate-400">Trigger:</span>
              <span className="ml-2 text-cyan-300 font-mono">{activeSession.trigger_word}</span>
            </div>
            <div>
              <span className="text-slate-400">Concepto:</span>
              <span className="ml-2 text-slate-200">{activeSession.concepto_base.slice(0, 40)}...</span>
            </div>
          </div>
        </div>

        {/* Configuración de directorios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <FolderOpen className="w-4 h-4 inline mr-1" />
              Directorio de Entrada
            </label>
            <input
              type="text"
              value={localInputDir}
              onChange={(e) => setLocalInputDir(e.target.value)}
              placeholder="/ruta/a/imagenes/originales"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={pipelineState.running}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              <FolderOpen className="w-4 h-4 inline mr-1" />
              Directorio de Salida
            </label>
            <input
              type="text"
              value={localOutputDir}
              onChange={(e) => setLocalOutputDir(e.target.value)}
              placeholder="/ruta/a/dataset/procesado"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={pipelineState.running}
            />
          </div>
        </div>

        {/* Método y opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Método</label>
            <select
              value={pipelineConfig.method}
              onChange={(e) => setPipelineConfig({ method: e.target.value as CaptionMethod })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              disabled={pipelineState.running}
            >
              <option value="florence2">🧠 Florence-2 (Local)</option>
              <option value="ollama">🌐 Ollama API</option>
            </select>
          </div>

          {pipelineConfig.method === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Modelo Ollama</label>
              <select
                value={pipelineConfig.model || 'llava:7b'}
                onChange={(e) => setPipelineConfig({ model: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                disabled={pipelineState.running}
              >
                {OLLAMA_MODELS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pipelineConfig.dryRun}
                onChange={(e) => setPipelineConfig({ dryRun: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                disabled={pipelineState.running}
              />
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Dry Run</span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Avanzado
            </button>
          </div>
        </div>

        {/* Opciones avanzadas */}
        {showAdvanced && (
          <div className="bg-slate-800/30 rounded-lg p-4 mb-4 border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Configuración Avanzada</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Endpoint Ollama</label>
                <input
                  type="text"
                  value={pipelineConfig.ollamaEndpoint}
                  onChange={(e) => setPipelineConfig({ ollamaEndpoint: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  disabled={pipelineState.running}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Modelo Florence-2</label>
                <input
                  type="text"
                  value={pipelineConfig.model || 'microsoft/Florence-2-base'}
                  onChange={(e) => setPipelineConfig({ model: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  disabled={pipelineState.running}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones de control */}
        <div className="flex gap-3">
          {!pipelineState.running ? (
            <button
              onClick={handleRun}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Ejecutar Pipeline
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              Detener
            </button>
          )}

          {pipelineState.result?.success && (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Ver Captions Generados
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      {(pipelineState.running || pipelineState.result) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Progreso</span>
            <span className="text-sm font-mono text-cyan-400">{pipelineState.progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                pipelineState.running ? 'bg-cyan-500 animate-pulse' : 'bg-green-500'
              }`}
              style={{ width: `${pipelineState.progress}%` }}
            />
          </div>
          {pipelineState.currentFile && (
            <p className="text-xs text-slate-400 mt-2 truncate">{pipelineState.currentFile}</p>
          )}
        </div>
      )}

      {/* Terminal de logs */}
      {pipelineState.logs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Output del Pipeline</span>
            {pipelineConfig.dryRun && (
              <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-700">
                DRY RUN
              </span>
            )}
          </div>
          <div className="bg-slate-950 rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
            {pipelineState.logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warning' ? 'text-yellow-400' :
                  log.level === 'success' ? 'text-green-400' :
                  'text-slate-400'
                }`}
              >
                <span className="text-slate-600">[{log.timestamp.slice(11, 19)}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultado resumen */}
      {pipelineState.result && (
        <div className={`border rounded-xl p-4 ${
          pipelineState.result.success
            ? 'bg-green-900/20 border-green-700/50'
            : 'bg-red-900/20 border-red-700/50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {pipelineState.result.success ? (
              <Zap className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={`font-medium ${pipelineState.result.success ? 'text-green-300' : 'text-red-300'}`}>
              {pipelineState.result.success ? 'Pipeline Exitoso' : 'Pipeline con Errores'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Imágenes:</span>
              <span className="ml-1 text-slate-200 font-medium">{pipelineState.result.processedCount}</span>
            </div>
            <div>
              <span className="text-slate-400">Duración:</span>
              <span className="ml-1 text-slate-200 font-medium">{pipelineState.result.durationSeconds.toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-slate-400">Estado:</span>
              <span className="ml-1 text-slate-200 font-medium">{pipelineState.result.success ? 'OK' : 'Error'}</span>
            </div>
            <div>
              <span className="text-slate-400">Captions:</span>
              <span className="ml-1 text-slate-200 font-medium">{pipelineState.result.captions.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
