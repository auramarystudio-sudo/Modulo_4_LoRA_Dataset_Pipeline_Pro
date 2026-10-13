/**
 * KohyaConfigExporter - Genera archivos de configuración para Kohya_ss
 * 
 * Exporta:
 * - config.yaml para entrenamiento LoRA
 * - Script de entrenamiento (.sh / .bat)
 * - Archivo de metadata del dataset
 * - Configuración optimizada según resolución y VRAM
 */

import { useState, useMemo } from 'react';
import {
  Download,
  FileCode2,
  Settings,
  Copy,
  Check,
  Zap,
  Monitor,
  Cpu,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { TRAINING_FORMULAS } from '../../data/lora-defaults';

export default function KohyaConfigExporter() {
  const { activeSessionId, sessions, trainingConfig } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const [copied, setCopied] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'yaml' | 'script' | 'toml'>('yaml');

  // Configuración de entrenamiento
  const [config, setConfig] = useState({
    // Básico
    pretrainedModelNameOrPath: 'stabilityai/stable-diffusion-xl-base-1.0',
    outputName: activeSession?.trigger_word || 'my_lora',
    outputDir: './output',
    trainDataDir: './train_data',
    
    // Entrenamiento
    trainBatchSize: 1,
    maxTrainEpochs: 10,
    numRepeatedPerEpoch: 5,
    learningRate: '1e-4',
    textEncoderLr: '5e-5',
    unetLr: '1e-4',
    lrScheduler: 'cosine_with_restarts',
    lrWarmupSteps: 100,
    optimizer: 'AdamW8bit',
    
    // LoRA
    networkDim: 32,
    networkAlpha: 16,
    networkModule: 'networks.lora',
    
    // Resolución
    resolution: activeSession?.resolucion_objetivo || '1024',
    
    // Precision
    mixedPrecision: 'bf16',
    savePrecision: 'fp16',
    
    // Opciones avanzadas
    seed: 42,
    clipSkip: 2,
    maxTokenLength: 225,
    cacheLatents: true,
    bucketResoSteps: 64,
    enableBucket: true,
    minBucketReso: 256,
    maxBucketReso: 2048,
    
    // Guardado
    saveEveryNEpochs: 1,
    saveModelAs: 'safetensors',
  });

  // Calcular pasos totales
  const totalSteps = useMemo(() => {
    const { trainBatchSize, maxTrainEpochs, numRepeatedPerEpoch } = config;
    const numImages = activeSession?.captions_generados.length || 30;
    const formula = TRAINING_FORMULAS[config.resolution as '512' | '768' | '1024'] || TRAINING_FORMULAS['1024'];
    const steps = Math.round(((numImages * numRepeatedPerEpoch * maxTrainEpochs) / trainBatchSize) * formula.multiplicador);
    return Math.max(steps, formula.minPasos);
  }, [config, activeSession]);

  // Generar YAML
  const yamlContent = useMemo(() => {
    return `# ============================================================
# Kohya_ss LoRA Training Configuration
# Generado por LoRA Dataset Pipeline Pro
# ============================================================
# Sesión: ${activeSession?.nombre_proyecto || 'N/A'}
# Trigger: ${activeSession?.trigger_word || 'N/A'}
# Concepto: ${activeSession?.concepto_base || 'N/A'}
# ============================================================

# --- Modelo Base ---
pretrained_model_name_or_path: "${config.pretrainedModelNameOrPath}"
v2: false  # true para SD 2.x

# --- Output ---
output_name: "${config.outputName}"
output_dir: "${config.outputDir}"
train_data_dir: "${config.trainDataDir}"

# --- Entrenamiento ---
train_batch_size: ${config.trainBatchSize}
max_train_epochs: ${config.maxTrainEpochs}
num_repeats: ${config.numRepeatedPerEpoch}

# --- Learning Rate ---
learning_rate: ${config.learningRate}
text_encoder_lr: ${config.textEncoderLr}
unet_lr: ${config.unetLr}
lr_scheduler: "${config.lrScheduler}"
lr_scheduler_num_cycles: 3  # para cosine_with_restarts
lr_warmup_steps: ${config.lrWarmupSteps}

# --- Optimizer ---
optimizer_type: "${config.optimizer}"

# --- LoRA Config ---
network_module: "${config.networkModule}"
network_dim: ${config.networkDim}
network_alpha: ${config.networkAlpha}

# --- Resolución ---
resolution: "${config.resolution},${config.resolution}"

# --- Precision ---
mixed_precision: "${config.mixedPrecision}"
save_precision: "${config.savePrecision}"
full_bf16: false

# --- Opciones Avanzadas ---
seed: ${config.seed}
clip_skip: ${config.clipSkip}
max_token_length: ${config.maxTokenLength}
cache_latents: ${config.cacheLatents}
cache_latents_to_disk: true

# --- Aspect Ratio Bucket ---
enable_bucket: ${config.enableBucket}
bucket_reso_steps: ${config.bucketResoSteps}
min_bucket_reso: ${config.minBucketReso}
max_bucket_reso: ${config.maxBucketReso}

# --- Guardado ---
save_every_n_epochs: ${config.saveEveryNEpochs}
save_model_as: "${config.saveModelAs}"
save_state: false

# --- Logging ---
logging_dir: "./logs"
log_prefix: "${config.outputName}"
log_with: "tensorboard"

# --- Performance ---
xformers: true
max_data_loader_n_workers: 4
persistent_data_loader_workers: true

# --- Metadata ---
# Trigger word: ${activeSession?.trigger_word || 'N/A'}
# Total steps estimated: ${totalSteps}
# Images: ${activeSession?.captions_generados.length || 0}
# ============================================================
`;
  }, [config, activeSession, totalSteps]);

  // Generar script de entrenamiento
  const scriptContent = useMemo(() => {
    return `#!/bin/bash
# ============================================================
# Script de entrenamiento LoRA
# Generado por LoRA Dataset Pipeline Pro
# ============================================================

# Activar entorno virtual (descomenta si es necesario)
# source ./venv/bin/activate

# Ejecutar entrenamiento
accelerate launch --num_cpu_threads_per_process=8 \\
  sdxl_train_network.py \\
  --config_dir="${config.outputDir}/config.yaml" \\
  --pretrained_model_name_or_path="${config.pretrainedModelNameOrPath}" \\
  --train_data_dir="${config.trainDataDir}" \\
  --output_dir="${config.outputDir}" \\
  --output_name="${config.outputName}" \\
  --network_module="${config.networkModule}" \\
  --network_dim=${config.networkDim} \\
  --network_alpha=${config.networkAlpha} \\
  --resolution="${config.resolution},${config.resolution}" \\
  --train_batch_size=${config.trainBatchSize} \\
  --max_train_epochs=${config.maxTrainEpochs} \\
  --learning_rate=${config.learningRate} \\
  --text_encoder_lr=${config.textEncoderLr} \\
  --unet_lr=${config.unetLr} \\
  --lr_scheduler="${config.lrScheduler}" \\
  --lr_warmup_steps=${config.lrWarmupSteps} \\
  --optimizer_type="${config.optimizer}" \\
  --mixed_precision="${config.mixedPrecision}" \\
  --save_precision="${config.savePrecision}" \\
  --seed=${config.seed} \\
  --clip_skip=${config.clipSkip} \\
  --max_token_length=${config.maxTokenLength} \\
  --cache_latents \\
  --cache_latents_to_disk \\
  --enable_bucket \\
  --bucket_reso_steps=${config.bucketResoSteps} \\
  --min_bucket_reso=${config.minBucketReso} \\
  --max_bucket_reso=${config.maxBucketReso} \\
  --save_every_n_epochs=${config.saveEveryNEpochs} \\
  --save_model_as="${config.saveModelAs}" \\
  --xformers \\
  --max_data_loader_n_workers=4 \\
  --persistent_data_loader_workers \\
  --logging_dir="./logs" \\
  --log_prefix="${config.outputName}"

echo "✅ Entrenamiento completado!"
echo "Modelo guardado en: ${config.outputDir}/${config.outputName}.safetensors"
`;
  }, [config]);

  // Copiar al portapapeles
  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Descargar archivo
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeSession) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Settings className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">No hay sesión activa</h3>
        <p className="text-slate-400">Crea una sesión para generar configuración de entrenamiento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCode2 className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Exportar Configuración Kohya_ss</h2>
        </div>
        <p className="text-sm text-slate-400">
          Genera archivos de configuración listos para entrenar tu LoRA con Kohya_ss.
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Resumen de Configuración</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-100">{totalSteps.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Pasos totales</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Monitor className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-100">{config.resolution}px</div>
            <div className="text-xs text-slate-400">Resolución</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-100">{config.networkDim}/{config.networkAlpha}</div>
            <div className="text-xs text-slate-400">Dim/Alpha</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <Settings className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-slate-100">{config.maxTrainEpochs}×{config.numRepeatedPerEpoch}</div>
            <div className="text-xs text-slate-400">Epochs×Repeats</div>
          </div>
        </div>
      </div>

      {/* Configuración editable */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Configuración</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Modelo base */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs text-slate-400 mb-1">Modelo base</label>
            <input
              type="text"
              value={config.pretrainedModelNameOrPath}
              onChange={(e) => setConfig({ ...config, pretrainedModelNameOrPath: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Output name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre del LoRA</label>
            <input
              type="text"
              value={config.outputName}
              onChange={(e) => setConfig({ ...config, outputName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Network dim */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Network Dim</label>
            <input
              type="number"
              value={config.networkDim}
              onChange={(e) => setConfig({ ...config, networkDim: parseInt(e.target.value) || 32 })}
              min={8}
              max={256}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Network alpha */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Network Alpha</label>
            <input
              type="number"
              value={config.networkAlpha}
              onChange={(e) => setConfig({ ...config, networkAlpha: parseInt(e.target.value) || 16 })}
              min={1}
              max={256}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Learning rate */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Learning Rate</label>
            <input
              type="text"
              value={config.learningRate}
              onChange={(e) => setConfig({ ...config, learningRate: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Epochs */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Epochs</label>
            <input
              type="number"
              value={config.maxTrainEpochs}
              onChange={(e) => setConfig({ ...config, maxTrainEpochs: parseInt(e.target.value) || 10 })}
              min={1}
              max={200}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Repeats */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Repeats por epoch</label>
            <input
              type="number"
              value={config.numRepeatedPerEpoch}
              onChange={(e) => setConfig({ ...config, numRepeatedPerEpoch: parseInt(e.target.value) || 5 })}
              min={1}
              max={100}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Batch size */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Batch Size</label>
            <input
              type="number"
              value={config.trainBatchSize}
              onChange={(e) => setConfig({ ...config, trainBatchSize: parseInt(e.target.value) || 1 })}
              min={1}
              max={16}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* LR Scheduler */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">LR Scheduler</label>
            <select
              value={config.lrScheduler}
              onChange={(e) => setConfig({ ...config, lrScheduler: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="cosine_with_restarts">Cosine with Restarts</option>
              <option value="cosine">Cosine</option>
              <option value="constant">Constant</option>
              <option value="constant_with_warmup">Constant with Warmup</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          {/* Optimizer */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Optimizer</label>
            <select
              value={config.optimizer}
              onChange={(e) => setConfig({ ...config, optimizer: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="AdamW8bit">AdamW 8-bit</option>
              <option value="AdamW">AdamW</option>
              <option value="Lion8bit">Lion 8-bit</option>
              <option value="Lion">Lion</option>
              <option value="Prodigy">Prodigy</option>
            </select>
          </div>

          {/* Mixed precision */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Mixed Precision</label>
            <select
              value={config.mixedPrecision}
              onChange={(e) => setConfig({ ...config, mixedPrecision: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="bf16">bfloat16</option>
              <option value="fp16">float16</option>
              <option value="no">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Exportar</h3>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setExportFormat('yaml')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === 'yaml' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            config.yaml
          </button>
          <button
            onClick={() => setExportFormat('script')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === 'script' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            train.sh
          </button>
        </div>

        {/* Preview */}
        <div className="bg-slate-950 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 border border-slate-800">
          <pre className="whitespace-pre-wrap">
            {exportFormat === 'yaml' ? yamlContent : scriptContent}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleCopy(exportFormat === 'yaml' ? yamlContent : scriptContent, exportFormat)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors text-sm"
          >
            {copied === exportFormat ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied === exportFormat ? '¡Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={() => handleDownload(
              exportFormat === 'yaml' ? yamlContent : scriptContent,
              exportFormat === 'yaml' ? 'config.yaml' : 'train.sh'
            )}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar {exportFormat === 'yaml' ? 'config.yaml' : 'train.sh'}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Consejos de entrenamiento:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              <li>Para SDXL, usa dim=32, alpha=16 como punto de partida</li>
              <li>AdamW8bit reduce VRAM significativamente</li>
              <li>Cosine with Restarts funciona bien para la mayoría de casos</li>
              <li>Empieza con 1500-3000 pasos y ajusta según resultados</li>
              <li>Usa bf16 si tu GPU lo soporta (RTX 30xx/40xx)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
