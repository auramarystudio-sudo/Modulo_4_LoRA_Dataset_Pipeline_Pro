/**
 * InteractiveGlossary - Glosario interactivo para novatos
 * 
 * Explica todos los términos técnicos de forma simple y amigable.
 * Incluye búsqueda y categorías.
 */

import { useState } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Image,
  FileText,
  Settings,
  Brain,
  Folder,
} from 'lucide-react';

interface GlossaryEntry {
  term: string;
  definition: string;
  example?: string;
  analogy?: string;
  category: 'concepto' | 'archivo' | 'configuracion' | 'hardware' | 'proceso';
  relatedTerms?: string[];
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'LoRA',
    definition: 'Low-Rank Adaptation. Es una técnica que te permite "enseñar" cosas nuevas a un modelo de IA sin tener que reentrenarlo completo. Es como darle un "mini curso" al modelo.',
    example: 'Entrenar un LoRA con fotos de tu perro para que la IA aprenda a generar imágenes de tu perro.',
    analogy: 'Imagina que el modelo base es un artista que sabe dibujar de todo. El LoRA es como darle un cuaderno de referencias de algo específico (tu perro) para que lo dibuje perfecto.',
    category: 'concepto',
  },
  {
    term: 'Trigger Word',
    definition: 'Una palabra única e inventada que representa tu concepto en los captions. La IA aprende a asociar esa palabra con tu concepto.',
    example: '"sks", "ohwx", "miestilo" - palabras raras que no existen en el idioma normal.',
    analogy: 'Es como ponerle un apodo especial a tu concepto. Cuando dices el apodo, la IA sabe exactamente de qué hablas.',
    category: 'concepto',
    relatedTerms: ['Caption', 'Dataset'],
  },
  {
    term: 'Dataset',
    definition: 'El conjunto de imágenes + captions que usas para entrenar. Es el "material de estudio" del modelo.',
    example: '30 fotos de tu perro + 30 archivos de texto describiendo cada foto = tu dataset.',
    analogy: 'Es como el libro de texto que le das a un estudiante. Cuanto mejor sea el libro, mejor aprenderá.',
    category: 'concepto',
    relatedTerms: ['Caption', 'Trigger Word'],
  },
  {
    term: 'Caption',
    definition: 'La descripción textual de una imagen. Le dice al modelo qué hay en cada foto.',
    example: '"sks photo of a golden retriever playing in the park, sunny day, green grass"',
    analogy: 'Es como la etiqueta que le pones a una foto en un álbum. Describe lo que ves para que alguien que no la vio pueda imaginarla.',
    category: 'archivo',
    relatedTerms: ['Trigger Word', 'Dataset'],
  },
  {
    term: 'Checkpoint',
    definition: 'Una "foto" del estado del modelo en un momento del entrenamiento. Se guarda periódicamente por si algo sale mal.',
    example: 'checkpoint-500.safetensors = el modelo como estaba en el paso 500 del entrenamiento.',
    analogy: 'Es como guardar un videojuego. Si mueres, puedes volver al último punto guardado en vez de empezar desde cero.',
    category: 'archivo',
  },
  {
    term: 'Epoch',
    definition: 'Una pasada completa por todo tu dataset. Si tienes 100 imágenes y 1 epoch, el modelo vio las 100 imágenes una vez.',
    example: '10 epochs = el modelo vio tu dataset completo 10 veces.',
    analogy: 'Es como leer un libro. 1 epoch = lo leíste una vez. 10 epochs = lo leíste 10 veces (aprendes más, pero cuidado con memorizarlo demasiado).',
    category: 'configuracion',
    relatedTerms: ['Steps', 'Repeats'],
  },
  {
    term: 'Steps (Pasos)',
    definition: 'Cada vez que el modelo actualiza sus "conocimientos" basándose en una imagen. Es la unidad más pequeña de aprendizaje.',
    example: '1000 steps = el modelo aprendió de 1000 imágenes individuales.',
    analogy: 'Si un epoch es leer un libro completo, cada step es leer una palabra. Más steps = más práctica, pero también más tiempo.',
    category: 'configuracion',
    relatedTerms: ['Epoch', 'Repeats'],
  },
  {
    term: 'Repeats',
    definition: 'Cuántas veces se "repite" cada imagen dentro de un epoch. Si tienes 10 imágenes y 10 repeats, es como si tuvieras 100 imágenes.',
    example: '20 imágenes × 10 repeats = 200 imágenes virtuales por epoch.',
    analogy: 'Es como estudiar una flashcard 10 veces antes de pasar a la siguiente. Más repeats = más énfasis en cada imagen.',
    category: 'configuracion',
    relatedTerms: ['Epoch', 'Steps'],
  },
  {
    term: 'Learning Rate (Tasa de Aprendizaje)',
    definition: 'Qué tan "rápido" aprende el modelo. Muy alto = aprende rápido pero comete errores. Muy bajo = aprende lento pero es más preciso.',
    example: '0.0001 es un learning rate típico para LoRA. Ni muy alto ni muy bajo.',
    analogy: 'Es como la velocidad a la que conduces. Muy rápido = puedes chocar. Muy lento = tardas mucho. Lo ideal es una velocidad moderada.',
    category: 'configuracion',
  },
  {
    term: 'VRAM',
    definition: 'Memoria de video de tu GPU. Determina qué tan grande puede ser el modelo que entrenas y a qué resolución.',
    example: '8GB VRAM = puedes entrenar LoRAs a 512x512. 12GB+ = puedes llegar a 1024x1024.',
    analogy: 'Es como el espacio de trabajo en tu escritorio. Más grande = puedes tener más cosas a la vez. Si es muy pequeño, tienes que trabajar más lento.',
    category: 'hardware',
  },
  {
    term: 'GPU',
    definition: 'Graphics Processing Unit. La tarjeta gráfica de tu PC. Es el "cerebro" que hace todo el trabajo pesado del entrenamiento.',
    example: 'NVIDIA RTX 3060 12GB, RTX 4090 24GB, etc.',
    analogy: 'Es el motor del coche. Un motor más potente te lleva más rápido a tu destino.',
    category: 'hardware',
    relatedTerms: ['VRAM'],
  },
  {
    term: 'Kohya_ss',
    definition: 'El programa que realmente ejecuta el entrenamiento. Es una interfaz gráfica que usa los scripts de entrenamiento de Stable Diffusion.',
    example: 'Abres Kohya_ss, cargas tu dataset, configuras parámetros y le das a "Start Training".',
    analogy: 'Es como el horno. Tú preparas la masa (dataset), configuras la temperatura (parámetros), y Kohya_ss es el horno que lo cocina.',
    category: 'proceso',
  },
  {
    term: 'Modelo Base',
    definition: 'El modelo de IA "original" sobre el cual entrenas tu LoRA. Es el punto de partida.',
    example: 'SD 1.5, SDXL, Flux - son modelos base diferentes. Cada uno tiene sus ventajas.',
    analogy: 'Es como elegir en qué idioma escribe tu estudiante. Si el modelo base "habla inglés", tu LoRA le enseñará cosas nuevas en inglés.',
    category: 'concepto',
  },
  {
    term: 'Class Images (Imágenes de Clase)',
    definition: 'Imágenes genéricas del "tipo" de cosa que entrenas. Ayudan al modelo a no olvidar cómo dibujar cosas en general.',
    example: 'Si entrenas un LoRA de "tu perro", las class images serían fotos genéricas de perros.',
    analogy: 'Es como cuando aprendes a dibujar un tipo específico de árbol, pero sigues practicando árboles en general para no olvidar cómo se dibuja un árbol.',
    category: 'proceso',
    relatedTerms: ['Regularization'],
  },
  {
    term: 'Regularization',
    definition: 'Técnica para evitar que el modelo "olvide" lo que ya sabía. Usa class images para mantener el equilibrio.',
    example: 'Sin regularización, al entrenar un LoRA de "gato naranja" podrías perder la capacidad de generar gatos normales.',
    analogy: 'Es como cuando aprendes un instrumento nuevo pero sigues practicando los antiguos para no perder la habilidad.',
    category: 'proceso',
    relatedTerms: ['Class Images'],
  },
  {
    term: 'Bucket de Resolución',
    definition: 'Grupo de imágenes con dimensiones similares. El entrenamiento organiza las imágenes en "cubos" según su tamaño.',
    example: 'Bucket 512x768 = todas las imágenes verticales de esa proporción van juntas.',
    analogy: 'Es como organizar fotos en álbumes por tamaño. Las cuadradas van en un álbum, las verticales en otro.',
    category: 'proceso',
  },
  {
    term: 'Safetensors',
    definition: 'Formato de archivo seguro para guardar modelos. Es el estándar actual, más seguro y rápido que los antiguos .ckpt.',
    example: 'mi_lora_v1.safetensors - tu modelo entrenado guardado en este formato.',
    analogy: 'Es como el formato MP4 para video. Es el estándar moderno que todo el mundo usa porque es mejor.',
    category: 'archivo',
  },
  {
    term: 'Overfitting (Sobreajuste)',
    definition: 'Cuando el modelo memoriza tus imágenes en vez de aprender el concepto. Genera solo copias de tus fotos, no cosas nuevas.',
    example: 'Si entrenas demasiados pasos, el LoRA solo podrá generar exactamente lo que le mostraste, sin variación.',
    analogy: 'Es como un estudiante que memoriza las respuestas del examen pero no entiende el tema. En el examen le va bien, pero si le preguntan algo diferente, no sabe responder.',
    category: 'concepto',
    relatedTerms: ['Steps', 'Epoch'],
  },
  {
    term: 'Underfitting (Subajuste)',
    definition: 'Cuando el modelo no aprendió suficiente. No reconoce bien tu concepto porque entrenaste muy poco.',
    example: 'Si entrenas muy pocos pasos, el LoRA no se parece a tu concepto en absoluto.',
    analogy: 'Es como estudiar 5 minutos para un examen. No es suficiente para aprender nada.',
    category: 'concepto',
    relatedTerms: ['Steps', 'Epoch'],
  },
  {
    term: 'Network Dimension (Dim/Alpha)',
    definition: 'Qué tan "grande" es tu LoRA. Más dim = puede aprender más cosas pero necesita más datos y más tiempo.',
    example: 'Dim 32 / Alpha 16 es un buen punto de partida para la mayoría de casos.',
    analogy: 'Es como el tamaño de la mochila del estudiante. Más grande = puede llevar más libros, pero también pesa más.',
    category: 'configuracion',
  },
];

const CATEGORY_CONFIG = {
  concepto: { label: 'Conceptos Básicos', icon: <Brain className="w-4 h-4" />, color: 'text-purple-400 bg-purple-900/30 border-purple-700/30' },
  archivo: { label: 'Archivos y Formatos', icon: <FileText className="w-4 h-4" />, color: 'text-blue-400 bg-blue-900/30 border-blue-700/30' },
  configuracion: { label: 'Configuración', icon: <Settings className="w-4 h-4" />, color: 'text-green-400 bg-green-900/30 border-green-700/30' },
  hardware: { label: 'Hardware', icon: <Cpu className="w-4 h-4" />, color: 'text-orange-400 bg-orange-900/30 border-orange-700/30' },
  proceso: { label: 'Proceso de Entrenamiento', icon: <Folder className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-900/30 border-cyan-700/30' },
};

export default function InteractiveGlossary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filtered = GLOSSARY.filter((entry) => {
    const matchesSearch =
      entry.term.toLowerCase().includes(search.toLowerCase()) ||
      entry.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(CATEGORY_CONFIG);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-slate-100">Glosario para Principiantes</h2>
        </div>
        <p className="text-sm text-slate-400">
          Todos los términos explicados de forma simple, con analogías y ejemplos. ¡Haz clic en cualquier término para ver más detalles!
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar término... (ej: epoch, trigger, VRAM)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !selectedCategory
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Todos
        </button>
        {categories.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              selectedCategory === key
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {config.icon}
            {config.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No se encontraron términos. Prueba con otra búsqueda.</p>
          </div>
        )}
        {filtered.map((entry) => {
          const isExpanded = expandedTerm === entry.term;
          const catConfig = CATEGORY_CONFIG[entry.category];
          return (
            <div
              key={entry.term}
              className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/50"
            >
              <button
                onClick={() => setExpandedTerm(isExpanded ? null : entry.term)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/30 transition-colors"
              >
                <span className={`text-xs px-2 py-0.5 rounded-md border ${catConfig.color}`}>
                  {catConfig.label}
                </span>
                <span className="flex-1 font-medium text-slate-200">{entry.term}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-800">
                  {/* Definition */}
                  <div className="pt-3">
                    <p className="text-sm text-slate-300 leading-relaxed">{entry.definition}</p>
                  </div>

                  {/* Example */}
                  {entry.example && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1 font-medium uppercase">Ejemplo:</p>
                      <p className="text-sm text-cyan-300">{entry.example}</p>
                    </div>
                  )}

                  {/* Analogy */}
                  {entry.analogy && (
                    <div className="bg-purple-900/20 border border-purple-700/20 rounded-lg p-3">
                      <p className="text-xs text-purple-400 mb-1 font-medium">💡 Analogía simple:</p>
                      <p className="text-sm text-purple-200/80">{entry.analogy}</p>
                    </div>
                  )}

                  {/* Related terms */}
                  {entry.relatedTerms && entry.relatedTerms.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">Relacionado:</span>
                      {entry.relatedTerms.map((related) => (
                        <button
                          key={related}
                          onClick={() => {
                            setExpandedTerm(related);
                            setSearch('');
                          }}
                          className="text-xs bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1"
                        >
                          {related}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
        {GLOSSARY.length} términos disponibles • {categories.length} categorías
      </div>
    </div>
  );
}
