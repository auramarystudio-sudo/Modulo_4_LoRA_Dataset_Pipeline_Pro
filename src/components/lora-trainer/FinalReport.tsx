/**
 * FinalReport - Reporte final completo antes de entrenar
 * 
 * Genera un resumen ejecutivo del proyecto:
 * - Información de la sesión
 * - Estadísticas del dataset
 * - Análisis de calidad
 * - Configuración de entrenamiento
 * - Checklist final
 * - Exportar como PDF/HTML
 */

import { useMemo } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Target,
  Calculator,
  TrendingUp,
  Shield,
  Printer,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { validateDataset } from '../../utils/dataset-validator';

export default function FinalReport() {
  const {
    sessions,
    activeSessionId,
  } = useLoraTrainerStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  // Validación del dataset
  const validation = useMemo(() => {
    if (!activeSession) return null;
    return validateDataset(captions, activeSession.trigger_word);
  }, [captions, activeSession]);

  // Estadísticas del dataset
  const stats = useMemo(() => {
    if (captions.length === 0) return null;

    const totalImages = captions.length;
    const validatedCount = captions.filter(c => c.validated).length;
    const withMetadata = captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0).length;
    const avgCaptionLength = Math.round(captions.reduce((sum, c) => sum + c.caption.length, 0) / totalImages);
    const triggerCoverage = validation?.stats.triggerCoverage || 0;

    return {
      totalImages,
      validatedCount,
      validationRate: Math.round((validatedCount / totalImages) * 100),
      withMetadata,
      metadataCoverage: Math.round((withMetadata / totalImages) * 100),
      avgCaptionLength,
      triggerCoverage,
      uniqueWords: new Set(captions.flatMap(c => c.caption.toLowerCase().split(/\s+/).filter(w => w.length > 2))).size,
    };
  }, [captions, validation]);

  // Score de calidad
  const qualityScore = useMemo(() => {
    if (!stats || !validation) return 0;

    let score = 100;

    // Penalizaciones
    if (stats.validationRate < 80) score -= 20;
    if (stats.triggerCoverage < 90) score -= 20;
    if (stats.avgCaptionLength < 50) score -= 15;
    if (stats.totalImages < 15) score -= 15;
    if (validation.warnings.length > 5) score -= 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [stats, validation]);

  // Checklist final
  const checklist = useMemo(() => {
    if (!stats || !activeSession) return [];

    return [
      {
        label: 'Mínimo 15 imágenes',
        checked: stats.totalImages >= 15,
        critical: true,
      },
      {
        label: 'Todos los captions validados',
        checked: stats.validationRate === 100,
        critical: true,
      },
      {
        label: 'Trigger word en todos los captions',
        checked: stats.triggerCoverage >= 95,
        critical: true,
      },
      {
        label: 'Longitud promedio adecuada (80-200 chars)',
        checked: stats.avgCaptionLength >= 80 && stats.avgCaptionLength <= 200,
        critical: false,
      },
      {
        label: 'Sin errores críticos',
        checked: validation?.errors.length === 0,
        critical: true,
      },
      {
        label: 'Score de calidad ≥ 80',
        checked: qualityScore >= 80,
        critical: false,
      },
      {
        label: 'Configuración de entrenamiento planificada',
        checked: !!activeSession.pasos_recomendados,
        critical: false,
      },
    ];
  }, [stats, validation, qualityScore, activeSession]);

  const allCriticalChecked = checklist.filter(c => c.critical).every(c => c.checked);
  const totalChecked = checklist.filter(c => c.checked).length;

  // Exportar reporte
  const handleExport = () => {
    if (!activeSession || !stats) return;

    const report = `
# REPORTE FINAL - LoRA Dataset Pipeline Pro
# ==========================================

## INFORMACIÓN DEL PROYECTO
- Nombre: ${activeSession.nombre_proyecto}
- Trigger Word: ${activeSession.trigger_word}
- Concepto: ${activeSession.concepto_base}
- Resolución: ${activeSession.resolucion_objetivo}px
- Estado: ${activeSession.estado}

## ESTADÍSTICAS DEL DATASET
- Total de imágenes: ${stats.totalImages}
- Captions validados: ${stats.validatedCount} (${stats.validationRate}%)
- Imágenes con metadata: ${stats.withMetadata} (${stats.metadataCoverage}%)
- Longitud promedio de captions: ${stats.avgCaptionLength} caracteres
- Trigger coverage: ${stats.triggerCoverage}%
- Palabras únicas: ${stats.uniqueWords}

## ANÁLISIS DE CALIDAD
- Score de calidad: ${qualityScore}/100
- Errores: ${validation?.errors.length || 0}
- Advertencias: ${validation?.warnings.length || 0}

## CHECKLIST FINAL
${checklist.map(c => `- [${c.checked ? 'X' : ' '}] ${c.label} ${c.critical ? '(CRÍTICO)' : ''}`).join('\n')}

## CONFIGURACIÓN DE ENTRENAMIENTO
- Pasos recomendados: ${activeSession.pasos_recomendados || 'No definido'}
- Class images prompts: ${activeSession.class_images_prompts.length}

## RECOMENDACIONES
${validation?.warnings.slice(0, 5).map(w => `- ${w.message}`).join('\n') || '- No hay advertencias críticas'}

---
Generado por LoRA Dataset Pipeline Pro
Fecha: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${activeSession.nombre_proyecto.replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeSession || !stats) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin datos para reportar</h3>
        <p className="text-slate-400">Crea una sesión y genera captions para ver el reporte final.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Reporte Final</h2>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Resumen completo de tu proyecto antes de entrenar el LoRA.
        </p>
      </div>

      {/* Score de calidad */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Score de Calidad</h3>
          <div className={`text-4xl font-bold ${
            qualityScore >= 80 ? 'text-green-400' :
            qualityScore >= 60 ? 'text-yellow-400' :
            qualityScore >= 40 ? 'text-orange-400' :
            'text-red-400'
          }`}>
            {qualityScore}/100
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              qualityScore >= 80 ? 'bg-green-500' :
              qualityScore >= 60 ? 'bg-yellow-500' :
              qualityScore >= 40 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {qualityScore >= 80 ? '✅ Excelente - Listo para entrenar' :
           qualityScore >= 60 ? '⚠️ Bueno - Revisa las advertencias' :
           qualityScore >= 40 ? '⚠️ Regular - Necesita mejoras' :
           '❌ Deficiente - Requiere trabajo adicional'}
        </p>
      </div>

      {/* Información del proyecto */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          Información del Proyecto
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Nombre</div>
            <div className="text-sm text-slate-200 font-medium">{activeSession.nombre_proyecto}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Trigger Word</div>
            <div className="text-sm text-cyan-300 font-mono">{activeSession.trigger_word}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Resolución</div>
            <div className="text-sm text-slate-200">{activeSession.resolucion_objetivo}px</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Estado</div>
            <div className="text-sm text-slate-200 capitalize">{activeSession.estado}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 mt-4">
          <div className="text-xs text-slate-500 mb-1">Concepto</div>
          <div className="text-sm text-slate-200">{activeSession.concepto_base}</div>
        </div>
      </div>

      {/* Estadísticas del dataset */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Estadísticas del Dataset
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatBox icon={<ImageIcon className="w-4 h-4" />} label="Imágenes" value={stats.totalImages} />
          <StatBox icon={<CheckCircle2 className="w-4 h-4" />} label="Validados" value={`${stats.validationRate}%`} />
          <StatBox icon={<Shield className="w-4 h-4" />} label="Metadata" value={`${stats.metadataCoverage}%`} />
          <StatBox icon={<FileText className="w-4 h-4" />} label="Long. Prom." value={`${stats.avgCaptionLength}`} />
          <StatBox icon={<Target className="w-4 h-4" />} label="Trigger" value={`${stats.triggerCoverage}%`} />
          <StatBox icon={<Calculator className="w-4 h-4" />} label="Palabras" value={stats.uniqueWords} />
        </div>
      </div>

      {/* Checklist final */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Checklist Final
          </h3>
          <span className="text-sm text-slate-400">
            {totalChecked}/{checklist.length} completados
          </span>
        </div>
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.checked
                  ? 'bg-green-900/20 border border-green-700/30'
                  : item.critical
                  ? 'bg-red-900/20 border border-red-700/30'
                  : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                  item.critical ? 'text-red-400' : 'text-yellow-400'
                }`} />
              )}
              <span className={`text-sm flex-1 ${
                item.checked ? 'text-green-300' :
                item.critical ? 'text-red-300' : 'text-slate-300'
              }`}>
                {item.label}
              </span>
              {item.critical && (
                <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">
                  CRÍTICO
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advertencias */}
      {validation && validation.warnings.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-yellow-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Advertencias ({validation.warnings.length})
          </h3>
          <ul className="space-y-2">
            {validation.warnings.slice(0, 5).map((warning, index) => (
              <li key={index} className="text-sm text-yellow-200 flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendación final */}
      <div className={`border rounded-xl p-6 ${
        allCriticalChecked
          ? 'bg-green-900/20 border-green-700/50'
          : 'bg-red-900/20 border-red-700/50'
      }`}>
        <div className="flex items-start gap-3">
          {allCriticalChecked ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-green-300 mb-2">
                  ¡Listo para Entrenar!
                </h4>
                <p className="text-sm text-green-200">
                  Tu dataset cumple con todos los requisitos críticos. Puedes proceder a exportar
                  la configuración y entrenar tu LoRA.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-red-300 mb-2">
                  Necesitas Corregir Problemas
                </h4>
                <p className="text-sm text-red-200 mb-2">
                  Hay {checklist.filter(c => c.critical && !c.checked).length} requisito(s) crítico(s) sin cumplir.
                </p>
                <p className="text-xs text-red-300/80">
                  Revisa el checklist y corrige los problemas antes de entrenar.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatBox({ icon, label, value }: StatBoxProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
        {icon}
      </div>
      <div className="text-lg font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
