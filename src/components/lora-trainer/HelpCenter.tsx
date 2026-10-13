/**
 * HelpCenter - Centro de ayuda con glosario y recursos para principiantes
 * 
 * Incluye:
 * - Glosario de términos técnicos con explicaciones simples
 * - FAQ con preguntas frecuentes
 * - Recursos externos (videos, artículos)
 * - Ejemplos prácticos
 * - Búsqueda de términos
 */

import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  HelpCircle,
  ExternalLink,
  Lightbulb,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  analogy?: string;
  category: 'basic' | 'training' | 'technical';
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'tool';
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'LoRA',
    definition: 'Low-Rank Adaptation. Es una técnica para entrenar modelos de IA de forma eficiente. En lugar de reentrenar todo el modelo (que es enorme), solo entrenas una pequeña parte.',
    example: 'Es como agregar un módulo especializado a un robot existente en lugar de construir un robot nuevo desde cero.',
    analogy: 'Imagina que tienes un chef experto en comida italiana. Con LoRA, le enseñas a hacer sushi sin que olvide la pasta.',
    category: 'basic',
  },
  {
    term: 'Trigger Word',
    definition: 'Una palabra única que activa tu LoRA. Cuando usas esta palabra en un prompt, la IA sabe que debe aplicar lo que aprendió.',
    example: 'Si entrenaste un LoRA de tu gato "Michi", el trigger podría ser "michigato". Al escribir "michigato jugando", la IA generará imágenes de TU gato.',
    analogy: 'Es como el nombre de tu mascota. Cuando lo llamas, sabe que te refieres a él.',
    category: 'basic',
  },
  {
    term: 'Dataset',
    definition: 'Un conjunto de imágenes (y sus descripciones) que usas para entrenar tu LoRA. Es el "material de estudio" de la IA.',
    example: 'Si quieres entrenar un LoRA de tu estilo artístico, tu dataset serían 20-50 imágenes de tus dibujos/pinturas.',
    analogy: 'Es como el libro de texto que le das a un estudiante. Cuanto mejor sea el libro, mejor aprenderá.',
    category: 'basic',
  },
  {
    term: 'Caption',
    definition: 'Una descripción textual de una imagen. Le dice a la IA qué hay en la imagen y cómo es.',
    example: 'Para una foto de un gato naranja sentado, el caption podría ser: "michigato, gato naranja, sentado en sofá, iluminación natural, fondo difuso"',
    analogy: 'Es como describirle una foto a alguien por teléfono. Cuanto más detallada sea tu descripción, mejor lo imaginará.',
    category: 'basic',
  },
  {
    term: 'Epoch',
    definition: 'Una pasada completa por todo tu dataset durante el entrenamiento. Si tienes 100 imágenes y 1 epoch, la IA verá cada imagen 1 vez.',
    example: 'Con 10 epochs, la IA verá cada una de tus 100 imágenes 10 veces (1000 imágenes en total).',
    analogy: 'Es como leer un libro. 1 epoch = leer el libro una vez. 10 epochs = leerlo 10 veces para memorizarlo mejor.',
    category: 'training',
  },
  {
    term: 'Steps (Pasos)',
    definition: 'Cada actualización que hace la IA durante el entrenamiento. Más pasos = más aprendizaje, pero también más tiempo.',
    example: 'Si tienes 100 imágenes, 5 repeats, 10 epochs y batch size 1: tendrás 5000 pasos de entrenamiento.',
    analogy: 'Es como las repeticiones en el gimnasio. Más repeticiones = más fuerte, pero también más cansancio.',
    category: 'training',
  },
  {
    term: 'Learning Rate (Tasa de Aprendizaje)',
    definition: 'Qué tan rápido aprende la IA. Muy alto = aprende rápido pero puede cometer errores. Muy bajo = aprende lento pero más preciso.',
    example: 'Un learning rate de 1e-4 es común para LoRAs. Es como decir "aprende a este ritmo".',
    analogy: 'Es como la velocidad a la que conduces. Muy rápido = peligroso. Muy lento = tardas mucho. El punto medio es ideal.',
    category: 'training',
  },
  {
    term: 'Batch Size',
    definition: 'Cuántas imágenes procesa la IA a la vez. Más grande = más rápido, pero requiere más memoria VRAM.',
    example: 'Batch size 1 = procesa 1 imagen a la vez. Batch size 4 = procesa 4 imágenes simultáneamente.',
    analogy: 'Es como cargar el lavaplatos. Puedes lavar 1 plato a la vez (lento) o llenarlo completo (rápido pero necesitas un lavaplatos grande).',
    category: 'training',
  },
  {
    term: 'VRAM',
    definition: 'Video RAM. La memoria de tu tarjeta gráfica. Determina qué tan grande puede ser tu modelo y batch size.',
    example: '8GB VRAM = puedes entrenar LoRAs SDXL con batch size 1. 24GB VRAM = batch size 4-8.',
    analogy: 'Es como la memoria de tu computadora. Más RAM = puedes tener más programas abiertos al mismo tiempo.',
    category: 'technical',
  },
  {
    term: 'Network Dim (Dimensión de Red)',
    definition: 'Qué tan "grande" es tu LoRA. Más grande = puede aprender más detalles, pero también más propenso a overfitting.',
    example: 'Dim 32 es un buen punto de partida. Dim 128 es para conceptos muy complejos.',
    analogy: 'Es como el tamaño del cerebro de la IA. Más grande = puede recordar más cosas, pero también puede confundirse.',
    category: 'technical',
  },
  {
    term: 'Network Alpha',
    definition: 'Un valor que escala la influencia de tu LoRA. Generalmente es la mitad del Network Dim.',
    example: 'Si Network Dim es 32, Network Alpha suele ser 16.',
    analogy: 'Es como el volumen de la voz de tu LoRA. Más alto = más influyente, pero puede dominar demasiado.',
    category: 'technical',
  },
  {
    term: 'Overfitting',
    definition: 'Cuando tu LoRA memoriza demasiado el dataset y no puede generalizar. Genera imágenes muy similares a las de entrenamiento.',
    example: 'Si entrenas con 10 fotos de tu gato en el sofá, el LoRA solo generará gatos en sofás, no en otros lugares.',
    analogy: 'Es como un estudiante que memoriza las respuestas del examen pero no entiende el concepto. En preguntas diferentes, falla.',
    category: 'training',
  },
  {
    term: 'Class Images',
    definition: 'Imágenes de la categoría general que ayudan a prevenir overfitting. Le recuerdan a la IA el concepto original.',
    example: 'Si entrenas un LoRA de TU gato, las class images serían fotos de gatos en general (no el tuyo).',
    analogy: 'Es como mostrarle a alguien fotos de "perros en general" mientras le enseñas sobre tu perro específico, para que no olvide qué es un perro.',
    category: 'training',
  },
  {
    term: 'PNG Info / Metadata',
    definition: 'Información oculta en archivos PNG que incluye el prompt original, parámetros de generación, modelo usado, etc.',
    example: 'Si generaste una imagen con Stable Diffusion, el PNG guarda el prompt exacto que usaste.',
    analogy: 'Es como las notas al margen de un libro. Información útil que alguien dejó ahí.',
    category: 'technical',
  },
  {
    term: 'Kohya_ss',
    definition: 'La herramienta más popular para entrenar LoRAs. Es un script de Python con interfaz gráfica.',
    example: 'Después de preparar tu dataset aquí, exportas la configuración y la usas en Kohya_ss para entrenar.',
    analogy: 'Es como el horno donde cocinas el pastel. Aquí preparas los ingredientes (dataset), en Kohya_ss los horneas (entrenas).',
    category: 'technical',
  },
];

const FAQ: FAQ[] = [
  {
    question: '¿Cuántas imágenes necesito para entrenar un LoRA?',
    answer: 'Para un LoRA básico, necesitas entre 15-50 imágenes. Para conceptos simples (un objeto, un estilo), 15-20 imágenes pueden ser suficientes. Para personas o conceptos complejos, 30-50 imágenes es ideal. Más de 100 imágenes puede ser excesivo a menos que sea un concepto muy diverso.',
    category: 'Cantidad',
  },
  {
    question: '¿Qué resolución deben tener las imágenes?',
    answer: 'Depende del modelo base que uses:\n- SD 1.5: 512x512 píxeles\n- SDXL: 1024x1024 píxeles\n- Flux: 1024x1024 píxeles\n\nLas imágenes no necesitan ser exactamente esa resolución, pero deben ser al menos de ese tamaño. El pipeline las redimensionará automáticamente.',
    category: 'Imágenes',
  },
  {
    question: '¿Cuánto tiempo toma entrenar un LoRA?',
    answer: 'Depende de varios factores:\n- Cantidad de imágenes\n- Número de pasos\n- Tu tarjeta gráfica (GPU)\n\nEn general:\n- Con una RTX 3060: 10-30 minutos\n- Con una RTX 4090: 5-15 minutos\n- Con una RTX 2060: 30-60 minutos\n\nEl Planner te dará una estimación más precisa basada en tu configuración.',
    category: 'Tiempo',
  },
  {
    question: '¿Qué tarjeta gráfica (GPU) necesito?',
    answer: 'Mínimo recomendado:\n- 8GB VRAM: Puedes entrenar LoRAs SDXL con batch size 1\n- 12GB VRAM: Batch size 2-4, entrenamiento más rápido\n- 24GB VRAM (RTX 4090): Batch size 4-8, entrenamiento muy rápido\n\nTarjetas compatibles: NVIDIA RTX 2060 o superior. AMD GPUs no son compatibles actualmente.',
    category: 'Hardware',
  },
  {
    question: '¿Puedo entrenar un LoRA sin GPU?',
    answer: 'Técnicamente sí, pero sería extremadamente lento (horas o días). No es práctico. Necesitas al menos una GPU NVIDIA con 8GB VRAM para entrenamiento razonable.',
    category: 'Hardware',
  },
  {
    question: '¿Qué es mejor: muchas imágenes o pocas imágenes con más epochs?',
    answer: 'Depende:\n- Pocas imágenes (15-30) + más epochs (10-20): Bueno para conceptos simples\n- Muchas imágenes (50-100) + menos epochs (5-10): Mejor para conceptos complejos\n\nLa regla general: si tienes menos de 30 imágenes, usa más epochs. Si tienes más de 50, usa menos epochs.',
    category: 'Entrenamiento',
  },
  {
    question: '¿Por qué mi LoRA genera imágenes muy similares a las de entrenamiento?',
    answer: 'Esto es overfitting. Soluciones:\n1. Agrega más variedad a tu dataset (diferentes ángulos, fondos, poses)\n2. Reduce los epochs o pasos de entrenamiento\n3. Agrega class images para regularización\n4. Reduce el Network Dim (ej: de 32 a 16)\n5. Aumenta el Network Alpha',
    category: 'Problemas',
  },
  {
    question: '¿Por qué mi LoRA no se parece a lo que entrené?',
    answer: 'Posibles causas:\n1. No estás usando el trigger word en el prompt\n2. El trigger word está mal escrito\n3. No cargaste el archivo .safetensors del LoRA\n4. El LoRA no se entrenó suficiente (aumenta epochs/pasos)\n5. El dataset era muy pequeño o de baja calidad',
    category: 'Problemas',
  },
  {
    question: '¿Puedo combinar varios LoRAs?',
    answer: 'Sí, puedes usar múltiples LoRAs al mismo tiempo. Por ejemplo, un LoRA de estilo + un LoRA de personaje. Solo asegúrate de usar ambos trigger words en el prompt.',
    category: 'Avanzado',
  },
  {
    question: '¿Qué formato debe tener el dataset?',
    answer: 'Para Kohya_ss:\n- Carpeta con las imágenes (PNG, JPG, WEBP)\n- Para cada imagen, un archivo .txt con el mismo nombre que contiene el caption\n- Ejemplo: imagen001.png + imagen001.txt\n\nEl Pipeline se encarga de generar los archivos .txt automáticamente.',
    category: 'Dataset',
  },
];

const RESOURCES: Resource[] = [
  {
    title: '¿Qué es un LoRA? (Video explicativo)',
    description: 'Video de 10 minutos que explica qué es LoRA y cómo funciona de forma visual.',
    url: 'https://www.youtube.com/results?search_query=what+is+lora+stable+diffusion',
    type: 'video',
  },
  {
    title: 'Guía completa de entrenamiento LoRA',
    description: 'Artículo detallado paso a paso para entrenar tu primer LoRA.',
    url: 'https://civitai.com/articles',
    type: 'article',
  },
  {
    title: 'Kohya_ss GUI - Herramienta de entrenamiento',
    description: 'La herramienta que usarás para entrenar tu LoRA después de preparar el dataset.',
    url: 'https://github.com/bmaltais/kohya_ss',
    type: 'tool',
  },
  {
    title: 'CivitAI - Modelos y LoRAs',
    description: 'Comunidad donde puedes descargar LoRAs entrenados por otros y ver ejemplos.',
    url: 'https://civitai.com',
    type: 'tool',
  },
  {
    title: 'Tutorial: Preparar dataset perfecto',
    description: 'Video sobre cómo seleccionar y preparar imágenes para tu dataset.',
    url: 'https://www.youtube.com/results?search_query=lora+dataset+preparation',
    type: 'video',
  },
  {
    title: 'Stable Diffusion WebUI (A1111)',
    description: 'Interfaz para usar tus LoRAs entrenados y generar imágenes.',
    url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    type: 'tool',
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'glossary' | 'faq' | 'resources'>('glossary');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'training' | 'technical'>('all');

  // Filtrar términos del glosario
  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY;
    
    if (selectedCategory !== 'all') {
      terms = terms.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query)
      );
    }
    
    return terms;
  }, [searchQuery, selectedCategory]);

  // Filtrar FAQ
  const filteredFaq = useMemo(() => {
    if (!searchQuery) return FAQ;
    const query = searchQuery.toLowerCase();
    return FAQ.filter(f =>
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Centro de Ayuda</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Todo lo que necesitas saber sobre LoRA training, explicado de forma simple.
        </p>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar términos, preguntas..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs de sección */}
      <div className="flex gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSection('glossary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeSection === 'glossary'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Glosario
        </button>
        <button
          onClick={() => setActiveSection('faq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeSection === 'faq'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          FAQ
        </button>
        <button
          onClick={() => setActiveSection('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeSection === 'resources'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Recursos
        </button>
      </div>

      {/* GLOSARIO */}
      {activeSection === 'glossary' && (
        <div className="space-y-4">
          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos', count: GLOSSARY.length },
              { id: 'basic', label: 'Básico', count: GLOSSARY.filter(t => t.category === 'basic').length },
              { id: 'training', label: 'Entrenamiento', count: GLOSSARY.filter(t => t.category === 'training').length },
              { id: 'technical', label: 'Técnico', count: GLOSSARY.filter(t => t.category === 'technical').length },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Lista de términos */}
          <div className="space-y-3">
            {filteredTerms.map((term) => (
              <div
                key={term.term}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      term.category === 'basic' ? 'bg-green-900/30 text-green-300' :
                      term.category === 'training' ? 'bg-blue-900/30 text-blue-300' :
                      'bg-purple-900/30 text-purple-300'
                    }`}>
                      {term.category === 'basic' ? 'Básico' :
                       term.category === 'training' ? 'Entrenamiento' : 'Técnico'}
                    </span>
                    <span className="text-lg font-bold text-slate-100">{term.term}</span>
                  </div>
                  {expandedTerm === term.term ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedTerm === term.term && (
                  <div className="border-t border-slate-800 p-4 space-y-3">
                    {/* Definición */}
                    <div>
                      <p className="text-sm text-slate-300 leading-relaxed">{term.definition}</p>
                    </div>

                    {/* Ejemplo */}
                    {term.example && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs font-medium text-yellow-300">Ejemplo:</span>
                        </div>
                        <p className="text-sm text-slate-300">{term.example}</p>
                      </div>
                    )}

                    {/* Analogía */}
                    {term.analogy && (
                      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💡</span>
                          <span className="text-xs font-medium text-cyan-300">Analogía simple:</span>
                        </div>
                        <p className="text-sm text-cyan-200">{term.analogy}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No se encontraron términos con "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeSection === 'faq' && (
        <div className="space-y-3">
          {filteredFaq.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-4 flex items-start justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-slate-200">{faq.question}</p>
                    <span className="text-xs text-slate-500 mt-1">{faq.category}</span>
                  </div>
                </div>
                {expandedFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {expandedFaq === index && (
                <div className="border-t border-slate-800 p-4">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}

          {filteredFaq.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No se encontraron preguntas con "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Recursos */}
      {activeSection === 'resources' && (
        <div className="space-y-3">
          {RESOURCES.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  resource.type === 'video' ? 'bg-red-900/30' :
                  resource.type === 'article' ? 'bg-blue-900/30' :
                  'bg-green-900/30'
                }`}>
                  {resource.type === 'video' ? <Video className="w-5 h-5 text-red-400" /> :
                   resource.type === 'article' ? <FileText className="w-5 h-5 text-blue-400" /> :
                   <ExternalLink className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-200">{resource.title}</h4>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-400">{resource.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
