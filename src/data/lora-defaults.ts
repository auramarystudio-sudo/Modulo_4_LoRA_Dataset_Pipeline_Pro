/**
 * Datos por defecto para el LoRA Dataset Pipeline Pro
 * Incluye triggers comunes, buckets de resolución, fórmulas de cálculo
 * y plantillas de class images.
 */

import type { TriggerInfo, ResolutionBucket } from '../types/lora-trainer';

// ============================================================
// 50+ TRIGGER WORDS COMUNES CON MODELOS ASOCIADOS
// ============================================================

export const COMMON_TRIGGERS: TriggerInfo[] = [
  // Personas y estilos
  { word: 'ohwx', modelo: 'SDXL Base', categoria: 'persona', popularidad: 9 },
  { word: 'sks', modelo: 'SD 1.5', categoria: 'persona', popularidad: 10 },
  { word: 'tok', modelo: 'SD 1.5', categoria: 'persona', popularidad: 8 },
  { word: 'p3rs0n', modelo: 'SDXL Base', categoria: 'persona', popularidad: 7 },
  { word: 'chrsm', modelo: 'SDXL Base', categoria: 'persona', popularidad: 6 },
  // Arte y estilos
  { word: 'ghibli', modelo: 'Studio Ghibli LoRA', categoria: 'estilo', popularidad: 10 },
  { word: 'pixar', modelo: 'Pixar Style LoRA', categoria: 'estilo', popularidad: 9 },
  { word: 'disney', modelo: 'Disney Style LoRA', categoria: 'estilo', popularidad: 8 },
  { word: 'vanGogh', modelo: 'Van Gogh Style LoRA', categoria: 'estilo', popularidad: 7 },
  { word: 'ukiyo', modelo: 'Ukiyo-e LoRA', categoria: 'estilo', popularidad: 6 },
  { word: 'cybrpnk', modelo: 'Cyberpunk LoRA', categoria: 'estilo', popularidad: 8 },
  { word: 'steampnk', modelo: 'Steampunk LoRA', categoria: 'estilo', popularidad: 7 },
  { word: 'watercolr', modelo: 'Watercolor LoRA', categoria: 'estilo', popularidad: 6 },
  { word: 'oilpaint', modelo: 'Oil Painting LoRA', categoria: 'estilo', popularidad: 5 },
  { word: 'papercut', modelo: 'Paper Cut LoRA', categoria: 'estilo', popularidad: 5 },
  // Objetos y conceptos
  { word: 'briecase', modelo: 'Object LoRA', categoria: 'objeto', popularidad: 4 },
  { word: 'chrchair', modelo: 'Furniture LoRA', categoria: 'objeto', popularidad: 5 },
  { word: 'spcecraft', modelo: 'Vehicle LoRA', categoria: 'objeto', popularidad: 6 },
  { word: 'mechbot', modelo: 'Robot LoRA', categoria: 'objeto', popularidad: 7 },
  { word: 'crystal', modelo: 'Material LoRA', categoria: 'objeto', popularidad: 5 },
  // Animales
  { word: 'catbreed', modelo: 'Animal LoRA', categoria: 'animal', popularidad: 7 },
  { word: 'dogbreed', modelo: 'Animal LoRA', categoria: 'animal', popularidad: 7 },
  { word: 'fantbeast', modelo: 'Creature LoRA', categoria: 'animal', popularidad: 6 },
  { word: 'dragonsc', modelo: 'Dragon LoRA', categoria: 'animal', popularidad: 8 },
  { word: 'unicorn', modelo: 'Fantasy LoRA', categoria: 'animal', popularidad: 6 },
  // Arquitectura
  { word: 'artdeco', modelo: 'Architecture LoRA', categoria: 'arquitectura', popularidad: 6 },
  { word: 'brutalst', modelo: 'Architecture LoRA', categoria: 'arquitectura', popularidad: 5 },
  { word: 'gothic', modelo: 'Architecture LoRA', categoria: 'arquitectura', popularidad: 7 },
  { word: 'japanese', modelo: 'Architecture LoRA', categoria: 'arquitectura', popularidad: 6 },
  { word: 'futurist', modelo: 'Architecture LoRA', categoria: 'arquitectura', popularidad: 5 },
  // Comida
  { word: 'sushiset', modelo: 'Food LoRA', categoria: 'comida', popularidad: 4 },
  { word: 'pastry', modelo: 'Food LoRA', categoria: 'comida', popularidad: 5 },
  { word: 'cocktail', modelo: 'Food LoRA', categoria: 'comida', popularidad: 4 },
  // Ropa y moda
  { word: 'cybrsuit', modelo: 'Fashion LoRA', categoria: 'moda', popularidad: 6 },
  { word: 'medieval', modelo: 'Fashion LoRA', categoria: 'moda', popularidad: 7 },
  { word: 'kimono', modelo: 'Fashion LoRA', categoria: 'moda', popularidad: 5 },
  { word: 'cosplay', modelo: 'Fashion LoRA', categoria: 'moda', popularidad: 8 },
  { word: 'streetwear', modelo: 'Fashion LoRA', categoria: 'moda', popularidad: 6 },
  // Paisajes
  { word: 'scifienv', modelo: 'Environment LoRA', categoria: 'paisaje', popularidad: 7 },
  { word: 'fantland', modelo: 'Environment LoRA', categoria: 'paisaje', popularidad: 6 },
  { word: 'underwtr', modelo: 'Environment LoRA', categoria: 'paisaje', popularidad: 5 },
  { word: 'spacestn', modelo: 'Environment LoRA', categoria: 'paisaje', popularidad: 6 },
  { word: 'enchforst', modelo: 'Environment LoRA', categoria: 'paisaje', popularidad: 7 },
  // Conceptos abstractos
  { word: 'glitch', modelo: 'Effect LoRA', categoria: 'abstracto', popularidad: 7 },
  { word: 'hologram', modelo: 'Effect LoRA', categoria: 'abstracto', popularidad: 6 },
  { word: 'neonlite', modelo: 'Effect LoRA', categoria: 'abstracto', popularidad: 7 },
  { word: 'vaporwav', modelo: 'Effect LoRA', categoria: 'abstracto', popularidad: 8 },
  { word: 'darkfant', modelo: 'Mood LoRA', categoria: 'abstracto', popularidad: 6 },
  { word: 'dreamscpe', modelo: 'Mood LoRA', categoria: 'abstracto', popularidad: 5 },
  // Personajes específicos
  { word: 'chracter1', modelo: 'Character LoRA', categoria: 'personaje', popularidad: 5 },
  { word: 'herochar', modelo: 'Character LoRA', categoria: 'personaje', popularidad: 6 },
  { word: 'villain', modelo: 'Character LoRA', categoria: 'personaje', popularidad: 5 },
  { word: 'npcchar', modelo: 'Character LoRA', categoria: 'personaje', popularidad: 4 },
  // Técnicas
  { word: 'inpaint', modelo: 'Technique LoRA', categoria: 'tecnica', popularidad: 6 },
  { word: 'controlnt', modelo: 'Technique LoRA', categoria: 'tecnica', popularidad: 7 },
  { word: 'depthmap', modelo: 'Technique LoRA', categoria: 'tecnica', popularidad: 5 },
];

// ============================================================
// BUCKETS DE RESOLUCIÓN POR ARQUITECTURA
// ============================================================

export const RESOLUTION_BUCKETS: Record<string, ResolutionBucket[]> = {
  '512': [
    { width: 512, height: 512, ratio: '1:1', imagenesRecomendadas: 50, vramEstimadaGB: 4 },
    { width: 512, height: 640, ratio: '4:5', imagenesRecomendadas: 40, vramEstimadaGB: 4.5 },
    { width: 640, height: 512, ratio: '5:4', imagenesRecomendadas: 40, vramEstimadaGB: 4.5 },
    { width: 512, height: 768, ratio: '2:3', imagenesRecomendadas: 35, vramEstimadaGB: 5 },
    { width: 768, height: 512, ratio: '3:2', imagenesRecomendadas: 35, vramEstimadaGB: 5 },
    { width: 512, height: 896, ratio: '9:16', imagenesRecomendadas: 30, vramEstimadaGB: 5.5 },
    { width: 896, height: 512, ratio: '16:9', imagenesRecomendadas: 30, vramEstimadaGB: 5.5 },
  ],
  '768': [
    { width: 768, height: 768, ratio: '1:1', imagenesRecomendadas: 40, vramEstimadaGB: 6 },
    { width: 768, height: 960, ratio: '4:5', imagenesRecomendadas: 35, vramEstimadaGB: 7 },
    { width: 960, height: 768, ratio: '5:4', imagenesRecomendadas: 35, vramEstimadaGB: 7 },
    { width: 768, height: 1152, ratio: '2:3', imagenesRecomendadas: 30, vramEstimadaGB: 8 },
    { width: 1152, height: 768, ratio: '3:2', imagenesRecomendadas: 30, vramEstimadaGB: 8 },
    { width: 768, height: 1344, ratio: '9:16', imagenesRecomendadas: 25, vramEstimadaGB: 9 },
    { width: 1344, height: 768, ratio: '16:9', imagenesRecomendadas: 25, vramEstimadaGB: 9 },
  ],
  '1024': [
    { width: 1024, height: 1024, ratio: '1:1', imagenesRecomendadas: 30, vramEstimadaGB: 8 },
    { width: 1024, height: 1280, ratio: '4:5', imagenesRecomendadas: 25, vramEstimadaGB: 10 },
    { width: 1280, height: 1024, ratio: '5:4', imagenesRecomendadas: 25, vramEstimadaGB: 10 },
    { width: 1024, height: 1536, ratio: '2:3', imagenesRecomendadas: 20, vramEstimadaGB: 12 },
    { width: 1536, height: 1024, ratio: '3:2', imagenesRecomendadas: 20, vramEstimadaGB: 12 },
    { width: 1024, height: 1792, ratio: '9:16', imagenesRecomendadas: 15, vramEstimadaGB: 14 },
    { width: 1792, height: 1024, ratio: '16:9', imagenesRecomendadas: 15, vramEstimadaGB: 14 },
  ],
};

// ============================================================
// FÓRMULAS DE CÁLCULO DE PASOS POR ARQUITECTURA
// ============================================================

/**
 * Fórmula base: pasos_totales = (num_imagenes * repeats * epochs) / batch_size
 * 
 * Ajustes por arquitectura:
 * - SD 1.5: Multiplicador 1.0, mínimo 1500 pasos
 * - SDXL: Multiplicador 1.5, mínimo 2000 pasos  
 * - Flux: Multiplicador 2.0, mínimo 3000 pasos
 */
export const TRAINING_FORMULAS = {
  '512': { multiplicador: 1.0, minPasos: 1500, maxPasos: 10000, lrBase: 1e-4 },
  '768': { multiplicador: 1.3, minPasos: 2000, maxPasos: 15000, lrBase: 5e-5 },
  '1024': { multiplicador: 1.5, minPasos: 2500, maxPasos: 20000, lrBase: 1e-5 },
};

// ============================================================
// PLANTILLAS DE CLASS IMAGES POR CATEGORÍA
// ============================================================

export const CLASS_IMAGE_TEMPLATES: Record<string, string[]> = {
  persona: [
    'a photo of a person, natural lighting, studio background',
    'a portrait of a person, soft lighting, neutral background',
    'a candid shot of a person, outdoor setting',
    'a professional headshot of a person, clean background',
  ],
  estilo: [
    'a painting in {estilo} style, vibrant colors',
    'artwork in {estilo} style, detailed composition',
    'a {estilo} style illustration, high quality',
    'digital art in {estilo} style, professional',
  ],
  objeto: [
    'a photo of a {objeto}, product photography, white background',
    'a {objeto} on a table, natural lighting, detailed',
    'close-up of a {objeto}, studio lighting, sharp focus',
    'a {objeto} in use, lifestyle photography',
  ],
  animal: [
    'a photo of a {animal}, natural habitat, sharp focus',
    'a {animal} in the wild, wildlife photography',
    'close-up portrait of a {animal}, detailed fur/feathers',
    'a {animal} resting, soft lighting, peaceful',
  ],
  arquitectura: [
    'a photo of {arquitectura} building, architectural photography',
    '{arquitectura} architecture, dramatic lighting, detailed',
    'interior of {arquitectura} style, wide angle, detailed',
    'exterior of {arquitectura} building, golden hour',
  ],
  paisaje: [
    'a {paisaje} landscape, cinematic lighting, wide angle',
    'panoramic view of {paisaje}, atmospheric, detailed',
    'a {paisaje} environment, concept art style',
    'environmental shot of {paisaje}, volumetric lighting',
  ],
};

// ============================================================
// MODELOS DE OLLAMA SOPORTADOS PARA CAPTIONING
// ============================================================

export const OLLAMA_MODELS = [
  'llava:7b',
  'llava:13b',
  'llava-llama3:8b',
  'bakllava:7b',
  'moondream:1.8b',
];

// ============================================================
// CONFIGURACIÓN POR DEFECTO DEL PIPELINE
// ============================================================

export const DEFAULT_PIPELINE_CONFIG = {
  inputDir: '',
  outputDir: '',
  triggerWord: '',
  method: 'florence2' as const,
  model: 'microsoft/Florence-2-base',
  dryRun: false,
  ollamaEndpoint: 'http://localhost:11434',
};
