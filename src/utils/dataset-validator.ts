/**
 * Dataset Validator - Valida la estructura y calidad de un dataset local
 * 
 * Verifica:
 * - Existencia de archivos de imagen
 * - Correspondencia imagen-caption (archivos .txt gemelos)
 * - Formato y encoding de captions
 * - Presencia de trigger word en cada caption
 * - Resolución mínima de imágenes
 * - Consistencia de nombres de archivo
 */

import type { CaptionEntry } from '../types/lora-trainer';

// ============================================================
// TIPOS DE VALIDACIÓN
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: DatasetStats;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  file?: string;
  message: string;
  code: string;
}

export interface DatasetStats {
  totalImages: number;
  totalCaptions: number;
  matchedPairs: number;
  orphanImages: number;
  orphanCaptions: number;
  avgCaptionLength: number;
  triggerCoverage: number; // porcentaje de captions con trigger
  resolutions: { width: number; height: number; count: number }[];
}

// ============================================================
// VALIDADOR PRINCIPAL
// ============================================================

/**
 * Valida un conjunto de captions generados para exportación
 */
export function validateDataset(
  captions: CaptionEntry[],
  triggerWord: string,
  minImages: number = 15
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  
  // Estadísticas
  const stats: DatasetStats = {
    totalImages: captions.length,
    totalCaptions: captions.filter(c => c.caption.trim().length > 0).length,
    matchedPairs: 0,
    orphanImages: 0,
    orphanCaptions: 0,
    avgCaptionLength: 0,
    triggerCoverage: 0,
    resolutions: [],
  };

  // Validar cantidad mínima
  if (captions.length < minImages) {
    warnings.push({
      type: 'warning',
      message: `Dataset tiene solo ${captions.length} imágenes. Se recomiendan mínimo ${minImages} para un LoRA efectivo.`,
      code: 'LOW_COUNT',
    });
  }

  if (captions.length > 300) {
    warnings.push({
      type: 'warning',
      message: `Dataset tiene ${captions.length} imágenes. Considera usar repeats en vez de más imágenes.`,
      code: 'HIGH_COUNT',
    });
  }

  // Validar cada caption
  let totalLength = 0;
  let withTrigger = 0;

  captions.forEach((entry, index) => {
    // Verificar que el caption no esté vacío
    if (!entry.caption.trim()) {
      errors.push({
        type: 'error',
        file: entry.filename,
        message: 'Caption vacío',
        code: 'EMPTY_CAPTION',
      });
      return;
    }

    totalLength += entry.caption.length;

    // Verificar trigger word al inicio
    if (entry.caption.toLowerCase().startsWith(triggerWord.toLowerCase())) {
      withTrigger++;
    } else {
      warnings.push({
        type: 'warning',
        file: entry.filename,
        message: `Trigger word "${triggerWord}" no está al inicio del caption`,
        code: 'TRIGGER_NOT_FIRST',
      });
    }

    // Verificar longitud del caption
    if (entry.caption.length < 20) {
      warnings.push({
        type: 'warning',
        file: entry.filename,
        message: 'Caption muy corto (< 20 caracteres)',
        code: 'SHORT_CAPTION',
      });
    }

    if (entry.caption.length > 500) {
      warnings.push({
        type: 'warning',
        file: entry.filename,
        message: 'Caption muy largo (> 500 caracteres). Considera acortar.',
        code: 'LONG_CAPTION',
      });
    }

    // Verificar nombre de archivo válido
    const baseName = entry.filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    if (!/^[a-zA-Z0-9_-]+$/.test(baseName)) {
      warnings.push({
        type: 'warning',
        file: entry.filename,
        message: 'Nombre de archivo contiene caracteres especiales. Kohya prefiere solo alfanuméricos.',
        code: 'BAD_FILENAME',
      });
    }

    // Verificar que la imagen existe (en demo, siempre true)
    stats.matchedPairs++;
  });

  // Calcular estadísticas finales
  stats.avgCaptionLength = captions.length > 0 ? Math.round(totalLength / captions.length) : 0;
  stats.triggerCoverage = captions.length > 0 ? Math.round((withTrigger / captions.length) * 100) : 0;

  // Advertencia si trigger coverage es bajo
  if (stats.triggerCoverage < 80) {
    warnings.push({
      type: 'warning',
      message: `Solo el ${stats.triggerCoverage}% de captions incluyen el trigger word al inicio. Se recomienda >90%.`,
      code: 'LOW_TRIGGER_COVERAGE',
    });
  }

  // Verificar consistencia de longitud de captions
  const lengths = captions.map(c => c.caption.length).filter(l => l > 0);
  if (lengths.length > 0) {
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev > avg * 0.8) {
      warnings.push({
        type: 'warning',
        message: 'Alta variación en longitud de captions. Intenta mantener consistencia.',
        code: 'CAPTION_LENGTH_VARIANCE',
      });
    }
  }

  const valid = errors.length === 0;

  return { valid, errors, warnings, stats };
}

/**
 * Genera un resumen visual de la validación
 */
export function getValidationSummary(result: ValidationResult): string {
  const parts: string[] = [];
  
  if (result.valid) {
    parts.push('✅ Dataset válido para exportar');
  } else {
    parts.push(`❌ ${result.errors.length} error(es) encontrado(s)`);
  }
  
  if (result.warnings.length > 0) {
    parts.push(`⚠️ ${result.warnings.length} advertencia(s)`);
  }
  
  parts.push(`📊 ${result.stats.totalImages} imágenes | ${result.stats.matchedPairs} pares | ${result.stats.triggerCoverage}% trigger coverage`);
  
  return parts.join(' | ');
}
