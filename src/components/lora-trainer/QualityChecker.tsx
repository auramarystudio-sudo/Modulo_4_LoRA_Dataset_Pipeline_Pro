/**
 * QualityChecker - Validador de calidad de imágenes y captions
 * 
 * Analiza el dataset para detectar:
 * - Captions muy cortos o muy largos
 * - Imágenes sin metadatos
 * - Trigger word faltante
 * - Baja diversidad de términos
 * - Posibles problemas de calidad
 */

import { useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { validateDataset } from '../../utils/dataset-validator';

interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  affectedCount: number;
  suggestion: string;
}

export default function QualityChecker() {
  const { activeSessionId, sessions } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  // Validación completa del dataset
  const validation = useMemo(() => {
    if (!activeSession) return null;
    return validateDataset(captions, activeSession.trigger_word);
  }, [captions, activeSession]);

  // Análisis de calidad detallado
  const qualityIssues = useMemo((): QualityIssue[] => {
    const issues: QualityIssue[] = [];

    if (captions.length === 0) return issues;

    // 1. Longitud de captions
    const shortCaptions = captions.filter(c => c.caption.length < 30);
    const longCaptions = captions.filter(c => c.caption.length > 300);
    const avgLength = captions.reduce((sum, c) => sum + c.caption.length, 0) / captions.length;

    if (shortCaptions.length > 0) {
      issues.push({
        severity: shortCaptions.length > captions.length * 0.3 ? 'error' : 'warning',
        category: 'Longitud',
        message: `${shortCaptions.length} captions muy cortos (< 30 caracteres)`,
        affectedCount: shortCaptions.length,
        suggestion: 'Agrega más detalles descriptivos a los captions cortos',
      });
    }

    if (longCaptions.length > 0) {
      issues.push({
        severity: 'warning',
        category: 'Longitud',
        message: `${longCaptions.length} captions muy largos (> 300 caracteres)`,
        affectedCount: longCaptions.length,
        suggestion: 'Considera acortar los captions excesivamente largos',
      });
    }

    if (avgLength < 50) {
      issues.push({
        severity: 'warning',
        category: 'Longitud',
        message: `Promedio de longitud bajo: ${avgLength.toFixed(0)} caracteres`,
        affectedCount: captions.length,
        suggestion: 'Los captions deberían tener entre 80-200 caracteres para mejor entrenamiento',
      });
    }

    // 2. Trigger word
    const missingTrigger = captions.filter(c => 
      !c.caption.toLowerCase().includes(activeSession?.trigger_word.toLowerCase() || '')
    );

    if (missingTrigger.length > 0) {
      issues.push({
        severity: 'error',
        category: 'Trigger Word',
        message: `${missingTrigger.length} captions sin trigger word "${activeSession?.trigger_word}"`,
        affectedCount: missingTrigger.length,
        suggestion: 'Asegúrate de que TODOS los captions incluyan el trigger word',
      });
    }

    // 3. Metadatos
    const noMetadata = captions.filter(c => 
      !c.originalMetadata || Object.keys(c.originalMetadata).length === 0
    );

    if (noMetadata.length > captions.length * 0.5) {
      issues.push({
        severity: 'info',
        category: 'Metadatos',
        message: `${noMetadata.length} imágenes sin metadatos PNG`,
        affectedCount: noMetadata.length,
        suggestion: 'No es crítico, pero los metadatos pueden enriquecer los captions',
      });
    }

    // 4. Validación
    const unvalidated = captions.filter(c => !c.validated);
    if (unvalidated.length > 0) {
      issues.push({
        severity: unvalidated.length > captions.length * 0.5 ? 'warning' : 'info',
        category: 'Validación',
        message: `${unvalidated.length} captions sin validar`,
        affectedCount: unvalidated.length,
        suggestion: 'Revisa y valida los captions antes de exportar',
      });
    }

    // 5. Diversidad
    const uniqueWords = new Set<string>();
    captions.forEach(c => {
      c.caption.toLowerCase().split(/\s+/).forEach(word => {
        if (word.length > 3) uniqueWords.add(word);
      });
    });

    const diversityRatio = uniqueWords.size / captions.length;
    if (diversityRatio < 5) {
      issues.push({
        severity: 'warning',
        category: 'Diversidad',
        message: `Baja diversidad de términos: ${diversityRatio.toFixed(1)} palabras únicas por caption`,
        affectedCount: captions.length,
        suggestion: 'Usa más variedad de términos descriptivos en los captions',
      });
    }

    // 6. Cantidad de imágenes
    if (captions.length < 15) {
      issues.push({
        severity: 'warning',
        category: 'Cantidad',
        message: `Dataset pequeño: solo ${captions.length} imágenes`,
        affectedCount: captions.length,
        suggestion: 'Se recomiendan mínimo 15-20 imágenes para un LoRA efectivo',
      });
    } else if (captions.length > 200) {
      issues.push({
        severity: 'info',
        category: 'Cantidad',
        message: `Dataset grande: ${captions.length} imágenes`,
        affectedCount: captions.length,
        suggestion: 'Considera usar repeats más bajos para datasets grandes',
      });
    }

    return issues;
  }, [captions, activeSession]);

  // Calcular score de calidad (0-100)
  const qualityScore = useMemo(() => {
    if (captions.length === 0) return 0;

    let score = 100;

    // Penalizaciones
    qualityIssues.forEach(issue => {
      if (issue.severity === 'error') score -= 15;
      else if (issue.severity === 'warning') score -= 8;
      else if (issue.severity === 'info') score -= 3;
    });

    // Bonus por validación completa
    const validatedRatio = captions.filter(c => c.validated).length / captions.length;
    score += validatedRatio * 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [qualityIssues, captions]);

  // Color del score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Necesita mejoras';
  };

  if (captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin captions para analizar</h3>
        <p className="text-slate-400">Genera captions primero para verificar la calidad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">Control de Calidad</h2>
          </div>
          
          {/* Score circular */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(qualityScore)}`}>
                {qualityScore}
              </div>
              <div className="text-xs text-slate-400">{getScoreLabel(qualityScore)}</div>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-800"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(qualityScore / 100) * 220} 220`}
                  className={getScoreColor(qualityScore)}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400">
          Análisis completo de calidad del dataset. Score basado en longitud, trigger word, validación y diversidad.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <ImageIcon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-100">{captions.length}</div>
          <div className="text-xs text-slate-400">Imágenes</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-100">
            {captions.filter(c => c.validated).length}
          </div>
          <div className="text-xs text-slate-400">Validados</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <FileText className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-100">
            {(captions.reduce((sum, c) => sum + c.caption.length, 0) / captions.length).toFixed(0)}
          </div>
          <div className="text-xs text-slate-400">Longitud promedio</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <Tag className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-100">
            {validation?.stats.triggerCoverage || 0}%
          </div>
          <div className="text-xs text-slate-400">Trigger coverage</div>
        </div>
      </div>

      {/* Lista de problemas */}
      {qualityIssues.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">
            Problemas Detectados ({qualityIssues.length})
          </h3>
          <div className="space-y-3">
            {qualityIssues.map((issue, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  issue.severity === 'error'
                    ? 'bg-red-900/20 border-red-700/50'
                    : issue.severity === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-700/50'
                    : 'bg-blue-900/20 border-blue-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {issue.severity === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          issue.severity === 'error'
                            ? 'bg-red-900/50 text-red-300'
                            : issue.severity === 'warning'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-blue-900/50 text-blue-300'
                        }`}>
                          {issue.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          {issue.affectedCount} afectado{issue.affectedCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium mb-1 ${
                      issue.severity === 'error'
                        ? 'text-red-300'
                        : issue.severity === 'warning'
                        ? 'text-yellow-300'
                        : 'text-blue-300'
                    }`}>
                      {issue.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      💡 {issue.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-300 mb-2">
            ¡Dataset de alta calidad!
          </h3>
          <p className="text-sm text-green-400/80">
            No se detectaron problemas. Tu dataset está listo para entrenar.
          </p>
        </div>
      )}

      {/* Checklist de buenas prácticas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Checklist de Calidad</h3>
        <div className="space-y-2">
          {[
            { check: captions.length >= 15, label: 'Mínimo 15 imágenes' },
            { check: captions.every(c => c.validated), label: 'Todos los captions validados' },
            { check: (validation?.stats.triggerCoverage || 0) >= 90, label: 'Trigger coverage ≥ 90%' },
            { check: captions.every(c => c.caption.length >= 30), label: 'Todos los captions ≥ 30 caracteres' },
            { check: captions.every(c => c.caption.length <= 300), label: 'Ningún caption > 300 caracteres' },
            { check: qualityScore >= 80, label: 'Score de calidad ≥ 80' },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                item.check ? 'bg-green-900/20' : 'bg-slate-800/30'
              }`}
            >
              {item.check ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.check ? 'text-green-300' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
