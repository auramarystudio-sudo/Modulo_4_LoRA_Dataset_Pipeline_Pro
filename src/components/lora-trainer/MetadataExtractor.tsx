/**
 * MetadataExtractor - Visualizador de PNG Info extraído
 * 
 * Muestra los metadatos extraídos de las imágenes del dataset:
 * - Prompts originales
 * - Parámetros de generación
 * - Modelo usado
 * - Comparación con el caption generado
 */

import { useMemo } from 'react';
import { Info, Image, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

export default function MetadataExtractor() {
  const { activeSessionId, sessions } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  // Agrupar imágenes con y sin metadata
  const { withMetadata, withoutMetadata } = useMemo(() => {
    const withM = captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0);
    const withoutM = captions.filter(c => !c.originalMetadata || Object.keys(c.originalMetadata).length === 0);
    return { withMetadata: withM, withoutMetadata: withoutM };
  }, [captions]);

  // Extraer campos únicos de metadata
  const metadataFields = useMemo(() => {
    const fields = new Set<string>();
    withMetadata.forEach(c => {
      if (c.originalMetadata) {
        Object.keys(c.originalMetadata).forEach(k => fields.add(k));
      }
    });
    return Array.from(fields);
  }, [withMetadata]);

  if (captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin datos para analizar</h3>
        <p className="text-slate-400">Ejecuta el pipeline para extraer metadatos de las imágenes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Metadatos Extraídos</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Image className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">{captions.length}</div>
            <div className="text-xs text-slate-400">Total imágenes</div>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-700/30">
            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-300">{withMetadata.length}</div>
            <div className="text-xs text-purple-400">Con metadata</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-100">{metadataFields.length}</div>
            <div className="text-xs text-slate-400">Campos únicos</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-slate-100">
              {captions.length > 0 ? Math.round((withMetadata.length / captions.length) * 100) : 0}%
            </div>
            <div className="text-xs text-slate-400">Cobertura</div>
          </div>
        </div>
      </div>

      {/* Campos encontrados */}
      {metadataFields.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Campos de Metadata Detectados</h3>
          <div className="flex flex-wrap gap-2">
            {metadataFields.map(field => (
              <span
                key={field}
                className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-700/50"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de comparación */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Comparación: Metadata Original → Caption Generado</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {withMetadata.slice(0, 10).map((caption) => (
            <div key={caption.filename} className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 font-mono mb-2">{caption.filename}</div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Metadata original */}
                <div className="space-y-1">
                  <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
                    <Info className="w-3 h-3" /> Metadata Original
                  </div>
                  {caption.originalMetadata && Object.entries(caption.originalMetadata).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-slate-500">{key}:</span>{' '}
                      <span className="text-slate-300 truncate block max-w-xs">{value}</span>
                    </div>
                  ))}
                </div>
                {/* Caption generado */}
                <div className="space-y-1">
                  <div className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Caption Generado
                  </div>
                  <p className="text-xs text-slate-300">{caption.caption}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <ArrowRight className="w-3 h-3" />
                Enriquecido con contexto de metadata original
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Imágenes sin metadata */}
      {withoutMetadata.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-yellow-300 mb-3">
            ⚠️ {withoutMetadata.length} imágenes sin metadatos PNG
          </h3>
          <p className="text-xs text-yellow-400/80 mb-3">
            Estas imágenes no contienen información de generación. El caption se generó desde cero.
          </p>
          <div className="flex flex-wrap gap-2">
            {withoutMetadata.slice(0, 8).map(c => (
              <span key={c.filename} className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-mono">
                {c.filename}
              </span>
            ))}
            {withoutMetadata.length > 8 && (
              <span className="text-xs text-slate-500 self-center">+{withoutMetadata.length - 8} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
