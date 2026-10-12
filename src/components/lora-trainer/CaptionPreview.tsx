/**
 * CaptionPreview - Galería de previsualización imagen + caption + metadata
 * 
 * Muestra cada imagen del dataset con:
 * - Thumbnail de la imagen
 * - Caption editable (textarea)
 * - Metadatos originales extraídos (badges)
 * - Botones de acción por tarjeta
 * - Filtros globales
 * - Botón de exportación final
 */

import { useState, useMemo } from 'react';
import {
  Check,
  RefreshCw,
  FileText,
  Eye,
  EyeOff,
  Download,
  Filter,
  Image,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { validateDataset, getValidationSummary } from '../../utils/dataset-validator';
import type { CaptionEntry } from '../../types/lora-trainer';

interface CaptionPreviewProps {
  onExport: () => void;
  onBack: () => void;
}

type FilterMode = 'all' | 'unvalidated' | 'with_metadata' | 'without_metadata';

export default function CaptionPreview({ onExport, onBack }: CaptionPreviewProps) {
  const {
    activeSessionId,
    sessions,
    updateCaption,
    validateCaption,
  } = useLoraTrainerStore();

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  // Filtrar captions según modo
  const filteredCaptions = useMemo(() => {
    switch (filterMode) {
      case 'unvalidated':
        return captions.filter(c => !c.validated);
      case 'with_metadata':
        return captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0);
      case 'without_metadata':
        return captions.filter(c => !c.originalMetadata || Object.keys(c.originalMetadata).length === 0);
      default:
        return captions;
    }
  }, [captions, filterMode]);

  // Validación del dataset
  const validation = useMemo(() => {
    if (!activeSession) return null;
    return validateDataset(captions, activeSession.trigger_word);
  }, [captions, activeSession]);

  // Estadísticas
  const stats = useMemo(() => {
    const validated = captions.filter(c => c.validated).length;
    const withMetadata = captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0).length;
    return {
      total: captions.length,
      validated,
      withMetadata,
      pending: captions.length - validated,
    };
  }, [captions]);

  // Handlers
  const handleStartEdit = (caption: CaptionEntry) => {
    setEditingId(caption.filename);
    setEditValue(caption.caption);
  };

  const handleSaveEdit = (filename: string) => {
    if (activeSessionId) {
      updateCaption(activeSessionId, filename, editValue);
    }
    setEditingId(null);
  };

  const handleToggleValidated = (filename: string, current: boolean) => {
    if (activeSessionId) {
      validateCaption(activeSessionId, filename, !current);
    }
  };

  const handleRegenerate = (caption: CaptionEntry) => {
    // Simular regeneración (en producción llamaría al Python)
    if (activeSessionId) {
      const variations = [
        `${activeSession?.trigger_word}, professional photography, studio lighting, high detail`,
        `${activeSession?.trigger_word}, artistic composition, natural colors, sharp focus`,
        `${activeSession?.trigger_word}, cinematic style, dramatic lighting, detailed textures`,
        `${activeSession?.trigger_word}, clean background, soft shadows, high resolution`,
      ];
      const newCaption = variations[Math.floor(Math.random() * variations.length)];
      updateCaption(activeSessionId, caption.filename, newCaption);
    }
  };

  if (!activeSession || captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Image className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin captions generados</h3>
        <p className="text-slate-400 mb-4">Ejecuta el pipeline primero para generar captions.</p>
        <button
          onClick={onBack}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          Volver al Pipeline
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Preview de Captions</h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              <span className="text-cyan-300 font-medium">{stats.validated}</span>/{stats.total} validados
            </span>
            <span className="text-slate-400">
              <Tag className="w-3 h-3 inline mr-1" />
              <span className="text-purple-300 font-medium">{stats.withMetadata}</span> con metadata
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          {([
            ['all', 'Todos', stats.total],
            ['unvalidated', 'Pendientes', stats.pending],
            ['with_metadata', 'Con Metadata', stats.withMetadata],
            ['without_metadata', 'Sin Metadata', stats.total - stats.withMetadata],
          ] as [FilterMode, string, number][]).map(([mode, label, count]) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterMode === mode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Validación resumen */}
        {validation && (
          <div className={`p-3 rounded-lg text-sm ${
            validation.valid
              ? 'bg-green-900/20 border border-green-700/50 text-green-300'
              : 'bg-yellow-900/20 border border-yellow-700/50 text-yellow-300'
          }`}>
            <div className="flex items-center gap-2">
              {validation.valid ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{getValidationSummary(validation)}</span>
            </div>
            {validation.warnings.length > 0 && (
              <div className="mt-2 space-y-1">
                {validation.warnings.slice(0, 3).map((w, i) => (
                  <p key={i} className="text-xs text-yellow-400/80 ml-6">⚠️ {w.message}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCaptions.map((caption) => (
          <div
            key={caption.filename}
            className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
              caption.validated
                ? 'border-green-700/50'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <Image className="w-10 h-10 text-slate-500 mx-auto mb-1" />
                <span className="text-xs text-slate-500 font-mono">{caption.filename}</span>
              </div>
              {/* Badge de variación */}
              <div className="absolute top-2 right-2 bg-slate-900/80 rounded px-2 py-0.5 text-xs text-slate-300">
                Var: {(caption.variacion * 100).toFixed(0)}%
              </div>
              {/* Badge validado */}
              {caption.validated && (
                <div className="absolute top-2 left-2 bg-green-900/80 rounded px-2 py-0.5 text-xs text-green-300 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Validado
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="p-4 space-y-3">
              {editingId === caption.filename ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-slate-800 border border-cyan-600 rounded-lg px-3 py-2 text-sm text-slate-200 resize-none focus:outline-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(caption.filename)}
                      className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm text-slate-300 cursor-pointer hover:text-slate-100 transition-colors line-clamp-3"
                  onClick={() => handleStartEdit(caption)}
                  title="Click para editar"
                >
                  {caption.caption}
                </p>
              )}

              {/* Metadata badges */}
              {caption.originalMetadata && Object.keys(caption.originalMetadata).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(caption.originalMetadata).slice(0, 4).map(([key, value]) => (
                    <span
                      key={key}
                      className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-700/50"
                      title={`${key}: ${value}`}
                    >
                      {key}
                    </span>
                  ))}
                  {Object.keys(caption.originalMetadata).length > 4 && (
                    <span className="text-xs text-slate-500">+{Object.keys(caption.originalMetadata).length - 4}</span>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleToggleValidated(caption.filename, caption.validated)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                    caption.validated
                      ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {caption.validated ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {caption.validated ? 'Validado' : 'Validar'}
                </button>
                <button
                  onClick={() => handleRegenerate(caption)}
                  className="flex items-center gap-1 text-xs bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones finales */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={onBack}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-2.5 rounded-lg transition-colors"
        >
          ← Volver al Pipeline
        </button>
        <button
          onClick={onExport}
          disabled={validation ? !validation.valid : false}
          className={`flex items-center gap-2 font-medium px-6 py-2.5 rounded-lg transition-colors ${
            validation?.valid
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          Exportar Dataset Final
        </button>
      </div>
    </div>
  );
}
