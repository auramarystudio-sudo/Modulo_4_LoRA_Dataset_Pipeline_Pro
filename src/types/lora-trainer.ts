/**
 * Tipos TypeScript para el Módulo 4: LoRA Dataset Pipeline Pro
 * Define todas las interfaces para sesiones de entrenamiento, captions,
 * buckets de resolución y resultados del pipeline Python.
 */

// ============================================================
// SESIÓN DE ENTRENAMIENTO
// ============================================================

/** Estado del ciclo de vida de una sesión de entrenamiento LoRA */
export type SessionEstado = 'planificacion' | 'procesando' | 'completado' | 'error';

/** Resolución objetivo para el entrenamiento */
export type ResolucionObjetivo = '512' | '768' | '1024';

/** Interfaz principal de una sesión de entrenamiento */
export interface TrainingSession {
  id: string;
  nombre_proyecto: string;
  trigger_word: string;
  concepto_base: string;
  captions_generados: CaptionEntry[];
  resolucion_objetivo: ResolucionObjetivo;
  pasos_recomendados?: number;
  class_images_prompts: string[];
  estado: SessionEstado;
  python_output_log?: string;
  usuario?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// CAPTIONS Y METADATOS
// ============================================================

/** Entrada individual de caption para una imagen del dataset */
export interface CaptionEntry {
  filename: string;
  imagePath: string;
  caption: string;
  originalMetadata?: Record<string, string>;
  variacion: number; // 0-1 nivel de variación aplicada
  validated: boolean;
}

/** Metadatos extraídos de PNG Info (A1111/ComfyUI) */
export interface PNGMetadata {
  prompt?: string;
  negative_prompt?: string;
  steps?: string;
  sampler?: string;
  cfg_scale?: string;
  seed?: string;
  size?: string;
  model?: string;
  model_hash?: string;
  [key: string]: string | undefined;
}

// ============================================================
// PLANIFICACIÓN DE ENTRENAMIENTO
// ============================================================

/** Bucket de resolución para entrenamiento con VRAM estimada */
export interface ResolutionBucket {
  width: number;
  height: number;
  ratio: string;
  imagenesRecomendadas: number;
  vramEstimadaGB: number;
}

/** Configuración de entrenamiento calculada */
export interface TrainingConfig {
  resolucion: ResolucionObjetivo;
  numImagenes: number;
  repeats: number;
  epochs: number;
  batchSize: number;
  pasosTotales: number;
  vramEstimadaGB: number;
  buckets: ResolutionBucket[];
  tiempoEstimadoMin: number;
}

// ============================================================
// PIPELINE PYTHON
// ============================================================

/** Resultado del proceso Python */
export interface PythonProcessResult {
  success: boolean;
  output: string;
  error?: string;
  processedCount: number;
  durationSeconds: number;
  captions: CaptionEntry[];
}

/** Método de captioning soportado */
export type CaptionMethod = 'florence2' | 'ollama';

/** Configuración del pipeline */
export interface PipelineConfig {
  inputDir: string;
  outputDir: string;
  triggerWord: string;
  method: CaptionMethod;
  model?: string;
  dryRun: boolean;
  ollamaEndpoint?: string;
}

// ============================================================
// TRIGGER WORDS
// ============================================================

/** Estado de validación de un trigger word */
export type TriggerStatus = 'valid' | 'conflict' | 'direct_conflict';

/** Resultado de validación de trigger */
export interface TriggerValidation {
  word: string;
  status: TriggerStatus;
  message: string;
  alternatives?: string[];
  modeloAsociado?: string;
}

/** Trigger word con información de modelo asociado */
export interface TriggerInfo {
  word: string;
  modelo: string;
  categoria: string;
  popularidad: number; // 1-10
}

// ============================================================
// LOG Y PROGRESO
// ============================================================

/** Línea de log del pipeline */
export interface PipelineLogLine {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  progress?: number; // 0-100
}

/** Estado del pipeline en ejecución */
export interface PipelineState {
  running: boolean;
  progress: number;
  currentFile?: string;
  logs: PipelineLogLine[];
  result?: PythonProcessResult;
}
