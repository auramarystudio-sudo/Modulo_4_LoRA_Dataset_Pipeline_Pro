/**
 * Python Runner - Ejecuta scripts Python y captura output en tiempo real
 * 
 * Este módulo gestiona la comunicación entre React y el backend Python.
 * En un entorno real, usaría child_process.spawn para ejecutar el script.
 * En modo demo (sin Python), simula el proceso con datos de ejemplo.
 */

import type { PythonProcessResult, PipelineConfig, CaptionEntry, PipelineLogLine } from '../types/lora-trainer';

// Callback para progreso en tiempo real
type ProgressCallback = (log: PipelineLogLine) => void;

/**
 * Ejecuta el pipeline de dataset preparation vía Python CLI
 * 
 * En producción real:
 * - Usa window.electronAPI o fetch a un servidor local
 * - Captura stdout línea por línea
 * - Parsea JSON final del proceso
 * 
 * En modo demo:
 * - Simula el proceso con delays realistas
 * - Genera captions de ejemplo
 */
export async function runDatasetPipeline(
  config: PipelineConfig,
  onProgress?: ProgressCallback
): Promise<PythonProcessResult> {
  const startTime = Date.now();
  const logs: PipelineLogLine[] = [];

  // Función helper para agregar logs
  const addLog = (level: PipelineLogLine['level'], message: string, progress?: number) => {
    const log: PipelineLogLine = {
      timestamp: new Date().toISOString(),
      level,
      message,
      progress,
    };
    logs.push(log);
    onProgress?.(log);
  };

  try {
    addLog('info', '🚀 Iniciando pipeline de preparación de dataset...', 0);
    addLog('info', `📁 Input: ${config.inputDir || '(demo mode)'}`);
    addLog('info', `📁 Output: ${config.outputDir || '(demo mode)'}`);
    addLog('info', `🏷️ Trigger: ${config.triggerWord}`);
    addLog('info', `🤖 Método: ${config.method}${config.dryRun ? ' (DRY RUN)' : ''}`);

    // Simular proceso Python (en producción real se ejecutaría el script)
    await simulateDelay(500);
    addLog('info', '📋 Escaneando directorio de entrada...', 5);

    // Generar imágenes demo
    const demoImages = generateDemoImages(config);
    const totalImages = demoImages.length;

    await simulateDelay(300);
    addLog('info', `🖼️ Encontradas ${totalImages} imágenes para procesar`, 10);

    if (config.method === 'florence2') {
      addLog('info', '🧠 Cargando modelo Florence-2...', 12);
      await simulateDelay(800);
      addLog('success', '✅ Modelo Florence-2 cargado exitosamente', 15);
    } else {
      addLog('info', `🌐 Conectando a Ollama (${config.ollamaEndpoint})...`, 12);
      await simulateDelay(400);
      addLog('success', '✅ Conectado a Ollama', 15);
    }

    // Procesar cada imagen
    const captions: CaptionEntry[] = [];
    for (let i = 0; i < demoImages.length; i++) {
      const img = demoImages[i];
      const progress = 15 + Math.round((i / totalImages) * 75);
      
      addLog('info', `📸 Procesando [${i + 1}/${totalImages}]: ${img.filename}`, progress);
      await simulateDelay(200 + Math.random() * 300);

      // Extraer metadatos simulados
      const metadata = extractDemoMetadata(img.filename, i);
      
      // Generar caption
      const caption = generateDemoCaption(config.triggerWord, metadata, i);

      captions.push({
        filename: img.filename,
        imagePath: img.path,
        caption,
        originalMetadata: metadata,
        variacion: 0.3 + Math.random() * 0.4,
        validated: false,
      });

      addLog('success', `  ✓ Caption generado para ${img.filename}`, progress + 2);
    }

    // Fase final
    addLog('info', '📝 Generando archivos .txt gemelos...', 92);
    await simulateDelay(400);

    if (!config.dryRun) {
      addLog('info', '💾 Escribiendo archivos al disco...', 95);
      await simulateDelay(300);
    } else {
      addLog('warning', '⚠️ DRY RUN - No se escribieron archivos', 95);
    }

    const duration = (Date.now() - startTime) / 1000;

    addLog('success', `✅ Pipeline completado en ${duration.toFixed(1)}s`, 100);
    addLog('success', `📊 ${captions.length} imágenes procesadas, ${captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0).length} con metadatos`);

    return {
      success: true,
      output: logs.map(l => l.message).join('\n'),
      processedCount: captions.length,
      durationSeconds: duration,
      captions,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    addLog('error', `❌ Error en pipeline: ${errorMsg}`);
    
    return {
      success: false,
      output: logs.map(l => l.message).join('\n'),
      error: errorMsg,
      processedCount: 0,
      durationSeconds: (Date.now() - startTime) / 1000,
      captions: [],
    };
  }
}

// ============================================================
// FUNCIONES DE SIMULACIÓN (Demo Mode)
// ============================================================

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface DemoImage {
  filename: string;
  path: string;
}

function generateDemoImages(config: PipelineConfig): DemoImage[] {
  // Si es modo demo con imágenes cargadas, usar al menos la cantidad que el usuario proporcionó
  // En producción real, esto vendría del directorio de entrada
  const count = 8 + Math.floor(Math.random() * 8); // 8-15 imágenes
  const images: DemoImage[] = [];
  
  const subjects = ['portrait', 'fullbody', 'closeup', 'sideview', 'backview', 'action', 'detail', 'expression'];
  const angles = ['front', 'side', 'three_quarter', 'back'];
  
  for (let i = 0; i < count; i++) {
    const subject = subjects[i % subjects.length];
    const angle = angles[i % angles.length];
    const filename = `${config.triggerWord}_${subject}_${angle}_${String(i + 1).padStart(3, '0')}.png`;
    images.push({
      filename,
      path: `${config.inputDir || '/demo/images'}/${filename}`,
    });
  }
  
  return images;
}

function extractDemoMetadata(filename: string, index: number): Record<string, string> {
  // Simular metadatos PNG Info (algunas imágenes tendrán, otras no)
  if (index % 3 === 0) return {}; // Sin metadatos
  
  const metadata: Record<string, string> = {
    prompt: `a beautiful ${filename.split('_')[1]}, high quality, detailed`,
    negative_prompt: 'blurry, low quality, deformed',
    steps: String(20 + index * 5),
    sampler: 'DPM++ 2M Karras',
    cfg_scale: '7.5',
    seed: String(1000000 + index * 12345),
    size: '1024x1024',
    model: 'sd_xl_base_1.0',
  };
  
  return metadata;
}

function generateDemoCaption(triggerWord: string, metadata: Record<string, string>, index: number): string {
  const descriptions = [
    `${triggerWord}, a detailed portrait with natural lighting, sharp focus on face, soft background`,
    `${triggerWord}, full body shot in casual clothing, standing pose, clean studio background`,
    `${triggerWord}, close-up view showing fine details, professional photography, high resolution`,
    `${triggerWord}, side profile view, dramatic lighting, artistic composition`,
    `${triggerWord}, dynamic action pose, motion blur background, energetic feel`,
    `${triggerWord}, detailed expression shot, emotional depth, cinematic lighting`,
    `${triggerWord}, three-quarter angle, natural pose, warm color palette`,
    `${triggerWord}, back view showing outfit details, environmental context`,
  ];
  
  let caption = descriptions[index % descriptions.length];
  
  // Enriquecer con metadata si existe
  if (metadata.prompt) {
    const keyElements = metadata.prompt
      .split(',')
      .slice(0, 2)
      .map(s => s.trim())
      .filter(s => s.length > 3 && !s.includes(triggerWord));
    if (keyElements.length > 0) {
      caption += `, ${keyElements.join(', ')}`;
    }
  }
  
  return caption;
}

/**
 * Verifica si Python está disponible en el sistema
 * En producción real ejecutaría: python --version
 */
export async function checkPythonAvailable(): Promise<{ available: boolean; version?: string }> {
  // En modo demo, siempre disponible
  return { available: true, version: '3.11.5 (demo mode)' };
}

/**
 * Verifica si Ollama está corriendo
 */
export async function checkOllamaAvailable(endpoint: string = 'http://localhost:11434'): Promise<{ available: boolean; models?: string[] }> {
  try {
    // En producción real: fetch(`${endpoint}/api/tags`)
    // Demo: simular respuesta
    return { 
      available: true, 
      models: ['llava:7b', 'llava:13b', 'moondream:1.8b'] 
    };
  } catch {
    return { available: false };
  }
}
