/**
 * DatasetPipeline - Componente principal que controla el pipeline Python
 * 
 * Gestiona:
 * - Configuración del pipeline (input/output, método, dry-run)
 * - Selector de directorios con explorador visual
 * - Zona drag & drop para imágenes (funciona con 1+ imágenes)
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
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { runDatasetPipeline } from '../../utils/python-runner';
import type { PipelineLogLine, CaptionMethod } from '../../types/lora-trainer';
import { OLLAMA_MODELS } from '../../data/lora-defaults';
import DirectoryPicker from './DirectoryPicker';
import ImageDropZone, { type DroppedImage } from './ImageDropZone';

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
    droppedImages,
    setDroppedImages,
  } = useLoraTrainerStore();

  const [localInputDir, setLocalInputDir] = useState(pipelineConfig.inputDir);
  const [localOutputDir, setLocalOutputDir] = useState(pipelineConfig.outputDir);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDirPicker, setShowDirPicker] = useState<'input' | 'output' | null>(null);
  const [localImages, setLocalImages] = useState<DroppedImage[]>([]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Sincronizar imágenes locales con el store
  const handleImagesChange = useCallback((images: DroppedImage[]) => {
    setLocalImages(images);
    // Guardar versión simplificada en el store (sin File objects)
    setDroppedImages(images.map(img => ({
      id: img.id,
      name: img.name,
      preview: img.preview,
      size: img.size,
    })));
  }, [setDroppedImages]);

  // Ejecutar el pipeline
  const handleRun = useCallback(async () => {
    if (!activeSession) return;

    // Validar que haya al menos una fuente de imágenes
    const hasImages = localImages.length > 0 || localInputDir.trim() !== '';
    if (!hasImages) {
      setPipelineState({
        running: false,
        progress: 0,
        logs: [{
          timestamp: new Date().toISOString(),
          level: 'error',
          message: '❌ No hay imágenes. Arrastra imágenes o selecciona un directorio de entrada.',
        }],
      });
      return;
    }

    const config = {
      inputDir: localInputDir || '(imágenes cargadas)',
      outputDir: localOutputDir || '(directorio por defecto)',
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
        const currentLogs = useLoraTrainerStore.getState().pipelineState.logs;
        setPipelineState({
          running: true,
          progress: log.progress ?? 0,
          currentFile: log.message.includes('Procesando') ? log.message : undefined,
          logs: [...currentLogs, log],
        });
      });

      // Agregar captions a la sesión
      if (result.success && result.captions.length > 0) {
        addCaptionsToSession(activeSession.id, result.captions);
      }

      updateSessionEstado(activeSession.id, result.success ? 'completado' : 'error');
      
      const finalLogs = useLoraTrainerStore.getState().pipelineState.logs;
      setPipelineState({
        running: false,
        progress: 100,
        result,
        logs: [...finalLogs, {
          timestamp: new Date().toISOString(),
          level: result.success ? 'success' : 'error',
          message: result.success ? '✅ Pipeline finalizado exitosamente' : `❌ Error: ${result.error}`,
          progress: 100,
        }],
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      updateSessionEstado(activeSession.id, 'error');
      const errorLogs = useLoraTrainerStore.getState().pipelineState.logs;
      setPipelineState({
        running: false,
        progress: 0,
        logs: [...errorLogs, {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `❌ Error fatal: ${errorMsg}`,
        }],
      });
    }
  }, [activeSession, localInputDir, localOutputDir, localImages, pipelineConfig, setPipelineState, setPipelineConfig, addCaptionsToSession, updateSessionEstado]);

  // Detener pipeline (simulado)
  const handleStop = useCallback(() => {
    setPipelineState({ running: false });
    if (activeSession) {
      updateSessionEstado(activeSession.id, 'planificacion');
    }
  }, [activeSession, setPipelineState, updateSessionEstado]);

  // Abrir selector de directorios
  const openDirPicker = (mode: 'input' | 'output') => {
    setShowDirPicker(mode);
  };

  // Seleccionar directorio
  const handleDirSelect = (path: string) => {
    if (showDirPicker === 'input') {
      setLocalInputDir(path);
    } else {
      setLocalOutputDir(path);
    }
    setShowDirPicker(null);
  };

  // Puede ejecutar?
  const canRun = activeSession && (localImages.length > 0 || localInputDir.trim() !== '');

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
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
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
              <span className="ml-2 text-slate-200 truncate block max-w-[200px]">{activeSession.concepto_base}</span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECCIÓN: FUENTES DE IMÁGENES */}
        {/* ============================================ */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Fuentes de Imágenes
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Selecciona un directorio existente o arrastra imágenes directamente. Puedes usar ambas opciones.
          </p>

          {/* Opción 1: Selector de directorio */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              📁 Opción 1: Directorio de imágenes existentes
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={localInputDir}
                  onChange={(e) => setLocalInputDir(e.target.value)}
                  placeholder="/ruta/a/imagenes/ o usa el explorador →"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  disabled={pipelineState.running}
                />
              </div>
              <button
                onClick={() => openDirPicker('input')}
                disabled={pipelineState.running}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Explorar</span>
              </button>
            </div>
          </div>

          {/* Opción 2: Drag & Drop */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              🖼️ Opción 2: Arrastra imágenes (funciona con 1 o más)
            </label>
            <ImageDropZone
              images={localImages}
              onImagesChange={handleImagesChange}
              disabled={pipelineState.running}
            />
          </div>

          {/* Resumen de fuentes */}
          {(localInputDir || localImages.length > 0) && (
            <div className="mt-4 bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {localInputDir && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
                    Directorio: <span className="font-mono text-cyan-300">{localInputDir}</span>
                  </span>
                )}
                {localImages.length > 0 && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                    {localImages.length} imagen{localImages.length !== 1 ? 'es' : ''} cargada{localImages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECCIÓN: DIRECTORIO DE SALIDA */}
        {/* ============================================ */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            📂 Directorio de Salida (dataset procesado)
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={localOutputDir}
                onChange={(e) => setLocalOutputDir(e.target.value)}
                placeholder="/ruta/a/dataset/procesado o usa el explorador →"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                disabled={pipelineState.running}
              />
            </div>
            <button
              onClick={() => openDirPicker('output')}
              disabled={pipelineState.running}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Explorar</span>
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECCIÓN: MÉTODO Y OPCIONES */}
        {/* ============================================ */}
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
        <div className="flex flex-wrap gap-3">
          {!pipelineState.running ? (
            <button
              onClick={handleRun}
              disabled={!canRun}
              className={`flex items-center gap-2 font-medium px-6 py-2.5 rounded-lg transition-colors ${
                canRun
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
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

          {!canRun && !pipelineState.running && (
            <span className="flex items-center gap-1 text-xs text-yellow-400 self-center">
              <AlertCircle className="w-3.5 h-3.5" />
              Agrega imágenes o selecciona un directorio
            </span>
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

      {/* Directory Picker Modal */}
      {showDirPicker && (
        <DirectoryPicker
          isOpen={true}
          onClose={() => setShowDirPicker(null)}
          onSelect={handleDirSelect}
          initialPath={showDirPicker === 'input' ? localInputDir : localOutputDir}
          mode={showDirPicker}
        />
      )}
    </div>
  );
}
