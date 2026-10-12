/**
 * CaptionTemplates - Plantillas de captions por categorías + editor manual
 * 
 * Funcionalidades:
 * - Plantillas predefinidas organizadas por categorías
 * - Variables dinámicas {trigger}, {subject}, {style}, etc.
 * - Editor manual para captions personalizados
 * - Preview en tiempo real con variables reemplazadas
 * - Aplicar a imágenes seleccionadas o a todo el dataset
 * - Guardar plantillas personalizadas del usuario
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Edit3,
  Copy,
  Check,
  Trash2,
  Tag,
  Sparkles,
  User,
  Palette,
  Box,
  TreePine,
  Building2,
  Utensils,
  Shirt,
  PawPrint,
  Wand2,
  Save,
  X,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

// ============================================================
// PLANTILLAS PREDEFINIDAS POR CATEGORÍA
// ============================================================

interface CaptionTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  description: string;
}

interface CaptionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  templates: CaptionTemplate[];
}

const CAPTION_CATEGORIES: CaptionCategory[] = [
  {
    id: 'persona',
    name: 'Persona',
    icon: <User className="w-4 h-4" />,
    color: 'text-blue-400',
    templates: [
      {
        id: 'persona-retrato',
        name: 'Retrato profesional',
        template: '{trigger}, professional portrait, natural lighting, sharp focus, clean background, high quality',
        variables: ['trigger'],
        description: 'Retrato estándar con iluminación natural',
      },
      {
        id: 'persona-fullbody',
        name: 'Cuerpo completo',
        template: '{trigger}, full body shot, standing pose, {style} clothing, detailed, professional photography',
        variables: ['trigger', 'style'],
        description: 'Foto de cuerpo completo con estilo personalizable',
      },
      {
        id: 'persona-closeup',
        name: 'Primer plano',
        template: '{trigger}, close-up portrait, detailed facial features, soft lighting, {mood} expression',
        variables: ['trigger', 'mood'],
        description: 'Primer plano con expresión específica',
      },
      {
        id: 'persona-action',
        name: 'Pose dinámica',
        template: '{trigger}, dynamic action pose, {activity}, energetic movement, motion blur background',
        variables: ['trigger', 'activity'],
        description: 'Pose en movimiento con actividad específica',
      },
    ],
  },
  {
    id: 'estilo',
    name: 'Estilo Artístico',
    icon: <Palette className="w-4 h-4" />,
    color: 'text-purple-400',
    templates: [
      {
        id: 'estilo-pintura',
        name: 'Pintura al óleo',
        template: '{trigger}, oil painting style, {subject}, rich colors, textured brushstrokes, classical art',
        variables: ['trigger', 'subject'],
        description: 'Estilo de pintura al óleo clásica',
      },
      {
        id: 'estilo-anime',
        name: 'Anime/Manga',
        template: '{trigger}, anime style, {subject}, vibrant colors, detailed linework, cel shading',
        variables: ['trigger', 'subject'],
        description: 'Estilo anime con colores vibrantes',
      },
      {
        id: 'estilo-fotorrealista',
        name: 'Fotorrealista',
        template: '{trigger}, photorealistic, {subject}, ultra detailed, 8k, professional photography, sharp focus',
        variables: ['trigger', 'subject'],
        description: 'Estilo fotorrealista de alta calidad',
      },
      {
        id: 'estilo-acuarela',
        name: 'Acuarela',
        template: '{trigger}, watercolor painting, {subject}, soft edges, flowing colors, artistic, delicate',
        variables: ['trigger', 'subject'],
        description: 'Estilo acuarela con bordes suaves',
      },
    ],
  },
  {
    id: 'objeto',
    name: 'Objeto',
    icon: <Box className="w-4 h-4" />,
    color: 'text-yellow-400',
    templates: [
      {
        id: 'objeto-producto',
        name: 'Producto',
        template: '{trigger}, {product}, product photography, white background, studio lighting, sharp focus, high detail',
        variables: ['trigger', 'product'],
        description: 'Foto de producto profesional',
      },
      {
        id: 'objeto-lifestyle',
        name: 'Lifestyle',
        template: '{trigger}, {product} in use, lifestyle photography, natural setting, contextual, detailed',
        variables: ['trigger', 'product'],
        description: 'Producto en contexto de uso',
      },
      {
        id: 'objeto-closeup',
        name: 'Detalle',
        template: '{trigger}, close-up of {product}, macro photography, extreme detail, texture visible',
        variables: ['trigger', 'product'],
        description: 'Primer plano con detalles extremos',
      },
    ],
  },
  {
    id: 'paisaje',
    name: 'Paisaje',
    icon: <TreePine className="w-4 h-4" />,
    color: 'text-green-400',
    templates: [
      {
        id: 'paisaje-natural',
        name: 'Natural',
        template: '{trigger}, {landscape}, natural landscape, golden hour, atmospheric, wide angle, cinematic',
        variables: ['trigger', 'landscape'],
        description: 'Paisaje natural con iluminación dorada',
      },
      {
        id: 'paisaje-urbano',
        name: 'Urbano',
        template: '{trigger}, {cityscape}, urban landscape, {time}, detailed architecture, atmospheric perspective',
        variables: ['trigger', 'cityscape', 'time'],
        description: 'Paisaje urbano con tiempo del día',
      },
      {
        id: 'paisaje-fantasia',
        name: 'Fantasía',
        template: '{trigger}, fantasy landscape, {environment}, magical atmosphere, volumetric lighting, epic scale',
        variables: ['trigger', 'environment'],
        description: 'Paisaje de fantasía épico',
      },
    ],
  },
  {
    id: 'arquitectura',
    name: 'Arquitectura',
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-orange-400',
    templates: [
      {
        id: 'arquitectura-exterior',
        name: 'Exterior',
        template: '{trigger}, {building} exterior, architectural photography, {style} style, dramatic lighting',
        variables: ['trigger', 'building', 'style'],
        description: 'Vista exterior de edificio',
      },
      {
        id: 'arquitectura-interior',
        name: 'Interior',
        template: '{trigger}, {room} interior, {style} design, natural lighting, detailed, spacious',
        variables: ['trigger', 'room', 'style'],
        description: 'Vista interior con diseño específico',
      },
    ],
  },
  {
    id: 'comida',
    name: 'Comida',
    icon: <Utensils className="w-4 h-4" />,
    color: 'text-red-400',
    templates: [
      {
        id: 'comida-plato',
        name: 'Plato principal',
        template: '{trigger}, {dish}, food photography, top view, professional lighting, appetizing, detailed',
        variables: ['trigger', 'dish'],
        description: 'Foto de plato desde arriba',
      },
      {
        id: 'comida-closeup',
        name: 'Detalle comida',
        template: '{trigger}, close-up of {dish}, macro food photography, texture visible, steam, fresh',
        variables: ['trigger', 'dish'],
        description: 'Primer plano de comida',
      },
    ],
  },
  {
    id: 'moda',
    name: 'Moda',
    icon: <Shirt className="w-4 h-4" />,
    color: 'text-pink-400',
    templates: [
      {
        id: 'moda-outfit',
        name: 'Outfit completo',
        template: '{trigger}, wearing {outfit}, fashion photography, full body, {style} style, editorial',
        variables: ['trigger', 'outfit', 'style'],
        description: 'Foto de moda con outfit completo',
      },
      {
        id: 'moda-detalle',
        name: 'Detalle de prenda',
        template: '{trigger}, {garment} detail, fashion close-up, texture visible, high quality fabric',
        variables: ['trigger', 'garment'],
        description: 'Detalle de prenda específica',
      },
    ],
  },
  {
    id: 'animal',
    name: 'Animal',
    icon: <PawPrint className="w-4 h-4" />,
    color: 'text-amber-400',
    templates: [
      {
        id: 'animal-retrato',
        name: 'Retrato animal',
        template: '{trigger}, {animal}, animal portrait, sharp focus, {setting}, natural lighting, detailed fur/feathers',
        variables: ['trigger', 'animal', 'setting'],
        description: 'Retrato de animal con entorno',
      },
      {
        id: 'animal-action',
        name: 'Animal en acción',
        template: '{trigger}, {animal} {action}, wildlife photography, dynamic, motion, natural habitat',
        variables: ['trigger', 'animal', 'action'],
        description: 'Animal en movimiento',
      },
    ],
  },
];

// ============================================================
// VARIABLES DISPONIBLES
// ============================================================

const AVAILABLE_VARIABLES = [
  { id: 'trigger', name: '{trigger}', description: 'Trigger word de la sesión', example: 'mychar' },
  { id: 'subject', name: '{subject}', description: 'Sujeto principal', example: 'woman, dragon, castle' },
  { id: 'style', name: '{style}', description: 'Estilo artístico', example: 'cyberpunk, medieval, modern' },
  { id: 'mood', name: '{mood}', description: 'Estado de ánimo', example: 'happy, serious, mysterious' },
  { id: 'activity', name: '{activity}', description: 'Actividad', example: 'running, dancing, fighting' },
  { id: 'product', name: '{product}', description: 'Nombre del producto', example: 'watch, bottle, shoe' },
  { id: 'landscape', name: '{landscape}', description: 'Tipo de paisaje', example: 'mountain, beach, forest' },
  { id: 'cityscape', name: '{cityscape}', description: 'Tipo de ciudad', example: 'tokyo, new york, futuristic' },
  { id: 'time', name: '{time}', description: 'Tiempo del día', example: 'sunset, night, morning' },
  { id: 'environment', name: '{environment}', description: 'Entorno fantástico', example: 'floating islands, crystal cave' },
  { id: 'building', name: '{building}', description: 'Tipo de edificio', example: 'cathedral, skyscraper, house' },
  { id: 'room', name: '{room}', description: 'Tipo de habitación', example: 'living room, kitchen, bedroom' },
  { id: 'dish', name: '{dish}', description: 'Nombre del plato', example: 'sushi, pasta, cake' },
  { id: 'outfit', name: '{outfit}', description: 'Conjunto de ropa', example: 'suit, dress, casual wear' },
  { id: 'garment', name: '{garment}', description: 'Prenda específica', example: 'jacket, shoes, hat' },
  { id: 'animal', name: '{animal}', description: 'Tipo de animal', example: 'cat, dog, bird' },
  { id: 'setting', name: '{setting}', description: 'Entorno del animal', example: 'forest, home, studio' },
  { id: 'action', name: '{action}', description: 'Acción del animal', example: 'running, jumping, playing' },
];

export default function CaptionTemplates() {
  const {
    activeSessionId,
    sessions,
    addCaptionsToSession,
  } = useLoraTrainerStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const [selectedCategory, setSelectedCategory] = useState<string>('persona');
  const [selectedTemplate, setSelectedTemplate] = useState<CaptionTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [customCaptions, setCustomCaptions] = useState<string[]>([]);
  const [newCustomCaption, setNewCustomCaption] = useState('');
  const [showVariables, setShowVariables] = useState(false);

  // Categoría actual
  const currentCategory = useMemo(() => {
    return CAPTION_CATEGORIES.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  // Preview del caption con variables reemplazadas
  const previewCaption = useMemo(() => {
    if (!selectedTemplate) return '';
    
    let caption = selectedTemplate.template;
    
    // Reemplazar {trigger}
    if (activeSession) {
      caption = caption.replace('{trigger}', activeSession.trigger_word);
    }
    
    // Reemplazar otras variables
    Object.entries(variableValues).forEach(([key, value]) => {
      if (value && key !== 'trigger') {
        caption = caption.replace(`{${key}}`, value);
      }
    });
    
    return caption;
  }, [selectedTemplate, variableValues, activeSession]);

  // Aplicar plantilla a sesión
  const handleApplyTemplate = () => {
    if (!activeSessionId || !previewCaption || !activeSession) return;

    // Generar variaciones (en producción real, esto crearía múltiples captions)
    const captions = [
      {
        filename: `${activeSession.trigger_word}_template_001.png`,
        imagePath: '(plantilla)',
        caption: previewCaption,
        variacion: 0,
        validated: false,
      },
    ];

    addCaptionsToSession(activeSessionId, captions);
    setSelectedTemplate(null);
    setVariableValues({});
  };

  // Agregar caption personalizado
  const handleAddCustomCaption = () => {
    if (!newCustomCaption.trim() || !activeSessionId || !activeSession) return;

    const caption = {
      filename: `${activeSession.trigger_word}_custom_${String(customCaptions.length + 1).padStart(3, '0')}.png`,
      imagePath: '(manual)',
      caption: newCustomCaption.trim(),
      variacion: 0,
      validated: false,
    };

    addCaptionsToSession(activeSessionId, [caption]);
    setCustomCaptions([...customCaptions, newCustomCaption.trim()]);
    setNewCustomCaption('');
  };

  // Eliminar caption personalizado
  const handleRemoveCustomCaption = (index: number) => {
    setCustomCaptions(customCaptions.filter((_, i) => i !== index));
  };

  // Seleccionar plantilla
  const handleSelectTemplate = (template: CaptionTemplate) => {
    setSelectedTemplate(template);
    setVariableValues({});
  };

  if (!activeSession) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">No hay sesión activa</h3>
        <p className="text-slate-400">Crea una sesión para usar plantillas de captions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Plantillas de Captions</h2>
        </div>
        <p className="text-sm text-slate-400">
          Usa plantillas predefinidas o crea captions personalizados. Las variables como <code className="text-cyan-300">{'{trigger}'}</code> se reemplazan automáticamente.
        </p>
      </div>

      {/* Selector de categorías */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Categorías</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {CAPTION_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedTemplate(null);
                setVariableValues({});
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-cyan-600/20 border-2 border-cyan-500'
                  : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800'
              }`}
            >
              <div className={category.color}>{category.icon}</div>
              <span className="text-xs text-slate-200 text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plantillas de la categoría */}
      {currentCategory && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={currentCategory.color}>{currentCategory.icon}</div>
            <h3 className="text-sm font-medium text-slate-300">
              Plantillas de {currentCategory.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentCategory.templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'bg-cyan-900/20 border-cyan-500'
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-200">{template.name}</h4>
                  {selectedTemplate?.id === template.id && (
                    <Check className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-2">{template.description}</p>
                <p className="text-xs font-mono text-slate-500 line-clamp-2">
                  {template.template}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.variables.map(v => (
                    <span key={v} className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs">
                      {'{' + v + '}'}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor de variables */}
      {selectedTemplate && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              Personalizar Caption
            </h3>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showVariables ? 'Ocultar' : 'Mostrar'} variables disponibles
            </button>
          </div>

          {/* Variables del template */}
          <div className="space-y-3 mb-4">
            {selectedTemplate.variables.filter(v => v !== 'trigger').map(varName => {
              const varInfo = AVAILABLE_VARIABLES.find(v => v.id === varName);
              return (
                <div key={varName}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    <Tag className="w-3 h-3 inline mr-1" />
                    {varInfo?.name || '{' + varName + '}'}
                    <span className="text-slate-500 ml-2">{varInfo?.description}</span>
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] || ''}
                    onChange={(e) => setVariableValues({ ...variableValues, [varName]: e.target.value })}
                    placeholder={`Ej: ${varInfo?.example || 'valor'}`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700">
            <div className="text-xs text-slate-400 mb-2">Preview:</div>
            <p className="text-sm text-slate-200 font-mono">
              {previewCaption || <span className="text-slate-500 italic">Completa las variables para ver el preview</span>}
            </p>
          </div>

          {/* Botón aplicar */}
          <button
            onClick={handleApplyTemplate}
            disabled={!previewCaption || previewCaption.includes('{')}
            className={`flex items-center gap-2 font-medium px-6 py-2.5 rounded-lg transition-colors ${
              previewCaption && !previewCaption.includes('{')
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Copy className="w-4 h-4" />
            Aplicar a la Sesión
          </button>

          {/* Variables disponibles */}
          {showVariables && (
            <div className="mt-4 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <h4 className="text-xs font-medium text-slate-300 mb-3">Variables Disponibles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_VARIABLES.map(v => (
                  <div key={v.id} className="flex items-start gap-2 text-xs">
                    <code className="text-cyan-300 font-mono bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">
                      {v.name}
                    </code>
                    <span className="text-slate-400">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor manual */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          Caption Personalizado
        </h3>

        <div className="space-y-3 mb-4">
          <textarea
            value={newCustomCaption}
            onChange={(e) => setNewCustomCaption(e.target.value)}
            placeholder={`Escribe tu caption aquí. Usa ${activeSession.trigger_word} al inicio...`}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 text-sm resize-none focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {newCustomCaption.length} caracteres
            </span>
            <button
              onClick={handleAddCustomCaption}
              disabled={!newCustomCaption.trim()}
              className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-colors text-sm ${
                newCustomCaption.trim()
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Agregar Caption
            </button>
          </div>
        </div>

        {/* Lista de captions personalizados */}
        {customCaptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-400">Captions Agregados:</h4>
            {customCaptions.map((caption, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-slate-800/50 rounded-lg p-3 border border-slate-700"
              >
                <FileText className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-slate-300 font-mono">{caption}</p>
                <button
                  onClick={() => handleRemoveCustomCaption(index)}
                  className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Consejos para buenos captions:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              <li>Siempre incluye el trigger word al inicio</li>
              <li>Sé específico y descriptivo</li>
              <li>Incluye detalles sobre iluminación, estilo y composición</li>
              <li>Mantén consistencia en longitud y formato</li>
              <li>Usa comas para separar conceptos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
