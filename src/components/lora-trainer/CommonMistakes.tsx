/**
 * CommonMistakes - Errores comunes y cómo evitarlos
 * 
 * FAQ interactiva con los errores más típicos que cometen los principiantes
 * al preparar datasets y entrenar LoRAs.
 */

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
} from 'lucide-react';

type Severity = 'critical' | 'warning' | 'tip';
type Category = 'dataset' | 'captions' | 'training' | 'hardware' | 'results';

interface Mistake {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  problem: string;
  why: string;
  solution: string;
  example: {
    bad: string;
    good: string;
  };
}

const MISTAKES: Mistake[] = [
  {
    id: 'few-images',
    title: 'Muy pocas imágenes en el dataset',
    category: 'dataset',
    severity: 'critical',
    problem: 'Entrenar con menos de 10 imágenes rara vez da buenos resultados.',
    why: 'El modelo necesita ver suficientes variaciones de tu concepto para entenderlo de verdad. Con pocas imágenes, solo memoriza esas fotos exactas.',
    solution: 'Usa entre 15-50 imágenes. Si no tienes suficientes, genera algunas con IA usando prompts similares a tu concepto.',
    example: {
      bad: '3 fotos de tu perro → el LoRA solo genera esas 3 poses exactas',
      good: '25 fotos variadas → el LoRA genera tu perro en cualquier pose o situación',
    },
  },
  {
    id: 'same-angle',
    title: 'Todas las fotos desde el mismo ángulo',
    category: 'dataset',
    severity: 'warning',
    problem: 'Si todas tus fotos son de frente, el modelo no aprenderá a generar tu concepto de lado o de espaldas.',
    why: 'El modelo aprende de lo que ve. Si solo ve un ángulo, ese es el único que sabe generar.',
    solution: 'Incluye fotos de diferentes ángulos: frente, perfil, 3/4, arriba, abajo, cerca, lejos.',
    example: {
      bad: '20 selfies de frente → solo genera caras de frente',
      good: '20 fotos variadas (frente, perfil, cuerpo completo, detalle) → genera desde cualquier ángulo',
    },
  },
  {
    id: 'watermark',
    title: 'Imágenes con marcas de agua o texto',
    category: 'dataset',
    severity: 'critical',
    problem: 'Las marcas de agua, logos o textos en las imágenes se "aprenden" como parte del concepto.',
    why: 'El modelo no distingue entre tu concepto y el ruido visual. Si hay un logo en la esquina, aprenderá a poner logos.',
    solution: 'Usa solo imágenes limpias. Recorta o edita para eliminar marcas de agua antes de agregarlas al dataset.',
    example: {
      bad: 'Fotos con logo de Instagram en la esquina → genera imágenes con logos raros',
      good: 'Fotos limpias sin texto → genera imágenes limpias',
    },
  },
  {
    id: 'common-trigger',
    title: 'Trigger word demasiado común',
    category: 'captions',
    severity: 'critical',
    problem: 'Usar una palabra común como trigger (ej: "persona", "gato") causa conflictos con el conocimiento existente del modelo.',
    why: 'El modelo ya sabe qué es un "gato". Si usas "gato" como trigger, se confunde entre tu concepto específico y gatos en general.',
    solution: 'Usa palabras inventadas o muy raras: "sks", "ohwx", "tjrt", "miestiloxyz".',
    example: {
      bad: 'Trigger: "mujer" → conflicto con el concepto general de mujer que ya conoce',
      good: 'Trigger: "sks" → palabra única sin conflicto',
    },
  },
  {
    id: 'too-long-caption',
    title: 'Captions demasiado largos o detallados',
    category: 'captions',
    severity: 'warning',
    problem: 'Captions excesivamente largos diluyen la importancia del trigger word y el concepto principal.',
    why: 'El modelo presta más atención a las primeras palabras del caption. Si el trigger word está enterrado en un párrafo largo, pierde fuerza.',
    solution: 'Mantén los captions entre 20-75 tokens. Trigger word primero, luego lo esencial.',
    example: {
      bad: '"sks photo of a woman who is wearing a red dress and standing in a park on a sunny day with trees and flowers and a blue sky and..."',
      good: '"sks woman in red dress, park, sunny day"',
    },
  },
  {
    id: 'no-trigger-in-caption',
    title: 'Trigger word faltante en los captions',
    category: 'captions',
    severity: 'critical',
    problem: 'Si el trigger word no aparece en los captions, el modelo nunca aprende a asociarlo con tu concepto.',
    why: 'El trigger word debe estar en TODOS los captions para que el modelo haga la conexión: trigger → concepto.',
    solution: 'Siempre empieza cada caption con el trigger word. Verifica que esté en el 100% de los captions.',
    example: {
      bad: '"woman in red dress, park" → falta "sks" → el modelo no aprende el trigger',
      good: '"sks woman in red dress, park" → trigger presente → asociación correcta',
    },
  },
  {
    id: 'too-many-steps',
    title: 'Demasiados pasos de entrenamiento',
    category: 'training',
    severity: 'warning',
    problem: 'Entrenar demasiados pasos causa overfitting: el LoRA solo reproduce tus imágenes exactas sin variación.',
    why: 'Después de cierto punto, el modelo deja de "aprender el concepto" y empieza a "memorizar las imágenes".',
    solution: 'Para 15-30 imágenes: 1500-3000 steps. Para 30-50 imágenes: 1000-2000 steps. Menos es más.',
    example: {
      bad: '5000 steps con 20 imágenes → solo copia tus fotos, sin creatividad',
      good: '2000 steps con 20 imágenes → entiende tu concepto y lo aplica creativamente',
    },
  },
  {
    id: 'high-learning-rate',
    title: 'Learning rate demasiado alto',
    category: 'training',
    severity: 'warning',
    problem: 'Un learning rate muy alto hace que el modelo "aprenda" demasiado rápido, generando artefactos y colores quemados.',
    why: 'Es como intentar aprender algo nuevo en un día: la información no se procesa bien y quedan errores.',
    solution: 'Usa 1e-4 (0.0001) como punto de partida. Si ves artefactos, baja a 5e-5.',
    example: {
      bad: 'LR: 0.01 → imágenes con colores saturados, artefactos, ruido',
      good: 'LR: 0.0001 → imágenes limpias y naturales',
    },
  },
  {
    id: 'wrong-resolution',
    title: 'Entrenar a resolución incorrecta para tu GPU',
    category: 'hardware',
    severity: 'critical',
    problem: 'Intentar entrenar a 1024x1024 con 6GB de VRAM causa errores de memoria (OOM).',
    why: 'Cada píxel requiere memoria. A mayor resolución, más VRAM necesitas. Si te pasas, el programa se cierra.',
    solution: '6-8GB VRAM → máximo 512x512. 8-12GB → hasta 768x768. 12GB+ → hasta 1024x1024.',
    example: {
      bad: 'RTX 3060 6GB intentando 1024x1024 → Error: CUDA out of memory',
      good: 'RTX 3060 6GB entrenando a 512x512 → funciona perfectamente',
    },
  },
  {
    id: 'mixed-quality',
    title: 'Mezclar imágenes de muy diferente calidad',
    category: 'dataset',
    severity: 'warning',
    problem: 'Combinar fotos profesionales con imágenes pixeladas o borrosas confunde al modelo.',
    why: 'El modelo intenta aprender de todo a la vez. Las imágenes malas "contaminan" lo que aprende de las buenas.',
    solution: 'Mantén un nivel de calidad consistente. Si tienes algunas fotos malas, elimínalas. Es mejor 15 fotos buenas que 30 mixtas.',
    example: {
      bad: '5 fotos HD + 15 fotos borrosas de WhatsApp → resultados inconsistentes',
      good: '15 fotos todas en buena resolución → resultados consistentes y nítidos',
    },
  },
  {
    id: 'no-class-images',
    title: 'No usar class images (regularization)',
    category: 'training',
    severity: 'tip',
    problem: 'Sin class images, el modelo puede "olvidar" cómo generar la categoría general de tu concepto.',
    why: 'Si entrenas un LoRA de "tu perro raza golden" sin class images de golden genéricos, podrías perder la capacidad de generar goldens normales.',
    solution: 'Genera 100-200 class images genéricas de la categoría. Kohya_ss las usa para regularización.',
    example: {
      bad: 'Solo fotos de TU golden → al generar, solo sale tu perro, nunca un golden genérico',
      good: 'Fotos de tu golden + class images de goldens genéricos → genera ambos correctamente',
    },
  },
  {
    id: 'inconsistent-style',
    title: 'Dataset con estilos visuales inconsistentes',
    category: 'dataset',
    severity: 'warning',
    problem: 'Mezclar fotos reales, ilustraciones, 3D y anime en el mismo dataset confunde al modelo.',
    why: 'El modelo no sabe si debe aprender "realismo" o "estilo anime" o "3D". Intenta las tres cosas y no hace bien ninguna.',
    solution: 'Mantén un estilo consistente en todo el dataset. Si quieres un LoRA realista, usa solo fotos reales.',
    example: {
      bad: '10 fotos reales + 10 dibujos anime + 5 renders 3D → resultado confuso e inconsistente',
      good: '25 fotos reales con estilo similar → LoRA realista coherente',
    },
  },
  {
    id: 'no-test-prompts',
    title: 'No probar el LoRA durante el entrenamiento',
    category: 'results',
    severity: 'tip',
    problem: 'Entrenar todo el proceso sin verificar cómo va el resultado puede resultar en un LoRA inútil.',
    why: 'A veces el mejor resultado está en el epoch 5, no en el 20. Si no guardas checkpoints, no puedes volver atrás.',
    solution: 'Guarda checkpoints cada pocos epochs y prueba con prompts de test. Quédate con el que mejor funcione.',
    example: {
      bad: 'Entrenar 20 epochs sin checkpoints → el resultado final es overfit, pero el epoch 5 era perfecto',
      good: 'Checkpoint cada 2 epochs → pruebas el epoch 5 y es perfecto, lo usas',
    },
  },
  {
    id: 'wrong-base-model',
    title: 'Usar el modelo base incorrecto',
    category: 'training',
    severity: 'warning',
    problem: 'Entrenar un LoRA para SDXL usando imágenes generadas con SD 1.5 (o viceversa) da malos resultados.',
    why: 'Cada modelo base tiene una resolución y estilo nativo diferente. Las imágenes deben coincidir con el modelo base.',
    solution: 'SD 1.5 → imágenes ~512x512. SDXL → imágenes ~1024x1024. Flux → imágenes ~1024x1024.',
    example: {
      bad: 'Imágenes de 512px entrenadas para SDXL → resultados borrosos y con artefactos',
      good: 'Imágenes de 1024px entrenadas para SDXL → resultados nítidos y correctos',
    },
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  dataset: '📁 Dataset',
  captions: '📝 Captions',
  training: '⚙️ Entrenamiento',
  hardware: '🖥️ Hardware',
  results: '🎯 Resultados',
};

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', icon: <XCircle className="w-4 h-4" />, color: 'text-red-400 bg-red-900/30 border-red-700/30' },
  warning: { label: 'Importante', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30' },
  tip: { label: 'Consejo', icon: <HelpCircle className="w-4 h-4" />, color: 'text-blue-400 bg-blue-900/30 border-blue-700/30' },
};

export default function CommonMistakes() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | null>(null);

  const filtered = MISTAKES.filter((m) => {
    if (filterCategory && m.category !== filterCategory) return false;
    if (filterSeverity && m.severity !== filterSeverity) return false;
    return true;
  });

  const criticalCount = MISTAKES.filter((m) => m.severity === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold text-slate-100">Errores Comunes y Cómo Evitarlos</h2>
        </div>
        <p className="text-sm text-slate-400">
          Los {MISTAKES.length} errores más frecuentes que cometen los principiantes. 
          <span className="text-red-400 font-medium"> {criticalCount} son críticos</span> y pueden arruinar tu entrenamiento.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs text-slate-500">Filtrar:</span>
        
        {/* Category filter */}
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value ? e.target.value as Category : null)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Severity filter */}
        <select
          value={filterSeverity ?? ''}
          onChange={(e) => setFilterSeverity(e.target.value ? e.target.value as Severity : null)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">Todas las severidades</option>
          <option value="critical">🔴 Crítico</option>
          <option value="warning">🟡 Importante</option>
          <option value="tip">🔵 Consejo</option>
        </select>
      </div>

      {/* Mistakes list */}
      <div className="space-y-3">
        {filtered.map((mistake) => {
          const isExpanded = expandedId === mistake.id;
          const sevConfig = SEVERITY_CONFIG[mistake.severity];
          return (
            <div
              key={mistake.id}
              className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/50"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : mistake.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/30 transition-colors"
              >
                <span className={`text-xs px-2 py-0.5 rounded-md border flex items-center gap-1 ${sevConfig.color}`}>
                  {sevConfig.icon}
                  {sevConfig.label}
                </span>
                <span className="flex-1 font-medium text-slate-200 text-sm">{mistake.title}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">{CATEGORY_LABELS[mistake.category]}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-800">
                  {/* Problem */}
                  <div className="pt-3">
                    <p className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" /> El problema:
                    </p>
                    <p className="text-sm text-slate-300">{mistake.problem}</p>
                  </div>

                  {/* Why */}
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1 font-medium">¿Por qué pasa esto?</p>
                    <p className="text-sm text-slate-300">{mistake.why}</p>
                  </div>

                  {/* Solution */}
                  <div className="bg-green-900/20 border border-green-700/20 rounded-lg p-3">
                    <p className="text-xs text-green-400 mb-1 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Solución:
                    </p>
                    <p className="text-sm text-green-200/80">{mistake.solution}</p>
                  </div>

                  {/* Example comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-red-900/10 border border-red-700/20 rounded-lg p-3">
                      <p className="text-xs text-red-400 mb-1 font-medium">❌ Mal:</p>
                      <p className="text-xs text-red-200/70">{mistake.example.bad}</p>
                    </div>
                    <div className="bg-green-900/10 border border-green-700/20 rounded-lg p-3">
                      <p className="text-xs text-green-400 mb-1 font-medium">✅ Bien:</p>
                      <p className="text-xs text-green-200/70">{mistake.example.good}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
        {filtered.length} de {MISTAKES.length} errores mostrados
      </div>
    </div>
  );
}
