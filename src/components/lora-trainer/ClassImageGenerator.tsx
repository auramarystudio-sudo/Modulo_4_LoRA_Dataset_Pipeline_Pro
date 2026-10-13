/**
 * ClassImageGenerator - Genera prompts para class images (regularización)
 * 
 * Las class images son esenciales en entrenamiento LoRA para evitar:
 * - Language drift (el modelo olvida el concepto original)
 * - Overfitting (el modelo solo genera tu concepto específico)
 * 
 * Genera prompts variados basados en la categoría del concepto.
 */

import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Copy,
  Check,
  Trash2,
  Download,
  Sparkles,
  User,
  Palette,
  Box,
  TreePine,
  Building2,
  PawPrint,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { CLASS_IMAGE_TEMPLATES } from '../../data/lora-defaults';

type ConceptCategory = 'persona' | 'estilo' | 'objeto' | 'animal' | 'arquitectura' | 'paisaje';

interface GeneratedPrompt {
  id: string;
  prompt: string;
  category: ConceptCategory;
  selected: boolean;
}

export default function ClassImageGenerator() {
  const { activeSessionId, sessions, updateSession } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const [category, setCategory] = useState<ConceptCategory>('persona');
  const [subject, setSubject] = useState('');
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generar prompts basados en categoría
  const handleGenerate = () => {
    const templates = CLASS_IMAGE_TEMPLATES[category] || CLASS_IMAGE_TEMPLATES['persona'];
    const subjectText = subject || getDefaultSubject(category);
    
    const prompts: GeneratedPrompt[] = templates.map((template, index) => {
      // Reemplazar variables en el template
      let prompt = template.replace(`{${category}}`, subjectText);
      
      // Agregar variaciones
      const variations = [
        'high quality, detailed',
        'professional photography, sharp focus',
        'natural lighting, realistic',
        'studio lighting, clean background',
        'artistic composition, vibrant colors',
      ];
      
      prompt = `${prompt}, ${variations[index % variations.length]}`;
      
      return {
        id: `prompt_${Date.now()}_${index}`,
        prompt,
        category,
        selected: true,
      };
    });

    setGeneratedPrompts(prev => [...prev, ...prompts]);
  };

  // Toggle selección
  const togglePrompt = (id: string) => {
    setGeneratedPrompts(prev =>
      prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p)
    );
  };

  // Eliminar prompt
  const removePrompt = (id: string) => {
    setGeneratedPrompts(prev => prev.filter(p => p.id !== id));
  };

  // Copiar prompt
  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Guardar en sesión
  const saveToSession = () => {
    if (!activeSessionId) return;
    const selectedPrompts = generatedPrompts.filter(p => p.selected).map(p => p.prompt);
    updateSession(activeSessionId, {
      class_images_prompts: selectedPrompts,
    });
  };

  // Exportar prompts
  const exportPrompts = () => {
    const selectedPrompts = generatedPrompts.filter(p => p.selected);
    const content = selectedPrompts.map((p, i) => `${i + 1}. ${p.prompt}`).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class_images_prompts_${category}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Estadísticas
  const stats = useMemo(() => {
    const total = generatedPrompts.length;
    const selected = generatedPrompts.filter(p => p.selected).length;
    return { total, selected };
  }, [generatedPrompts]);

  if (!activeSession) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">No hay sesión activa</h3>
        <p className="text-slate-400">Crea una sesión para generar class images prompts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Generador de Class Images</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Las class images son esenciales para regularización. Genera prompts variados para crear imágenes de la categoría general.
        </p>
        
        {/* Info box */}
        <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-200">
              <p className="font-medium mb-1">¿Qué son las class images?</p>
              <p className="text-xs text-cyan-300/80">
                Son imágenes de la categoría general (ej: "person", "dog", "car") que ayudan al modelo
                a no olvidar el concepto original. Se usan en entrenamiento con regularización.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generador */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Configuración</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Categoría */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Categoría del concepto</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'persona', icon: <User className="w-4 h-4" />, label: 'Persona' },
                { id: 'estilo', icon: <Palette className="w-4 h-4" />, label: 'Estilo' },
                { id: 'objeto', icon: <Box className="w-4 h-4" />, label: 'Objeto' },
                { id: 'animal', icon: <PawPrint className="w-4 h-4" />, label: 'Animal' },
                { id: 'arquitectura', icon: <Building2 className="w-4 h-4" />, label: 'Arquitectura' },
                { id: 'paisaje', icon: <TreePine className="w-4 h-4" />, label: 'Paisaje' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as ConceptCategory)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    category === cat.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sujeto específico */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Sujeto específico (opcional)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={getDefaultSubject(category)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Deja vacío para usar el valor por defecto de la categoría
            </p>
          </div>
        </div>

        {/* Botón generar */}
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Generar Prompts
        </button>
      </div>

      {/* Prompts generados */}
      {generatedPrompts.length > 0 && (
        <>
          {/* Stats y acciones */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">
                  <span className="text-cyan-300 font-medium">{stats.selected}</span>/{stats.total} seleccionados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveToSession}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Check className="w-4 h-4" />
                  Guardar en Sesión
                </button>
                <button
                  onClick={exportPrompts}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de prompts */}
          <div className="space-y-3">
            {generatedPrompts.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  item.selected ? 'border-cyan-700/50' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => togglePrompt(item.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                      item.selected
                        ? 'bg-cyan-600 border-cyan-500'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {item.selected && <Check className="w-3 h-3 text-white mx-auto" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 mb-2">{item.prompt}</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded text-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyPrompt(item.id, item.prompt)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Copiar"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removePrompt(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Info sobre cantidad recomendada */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Cantidad recomendada de class images</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400 mb-1">100-200</div>
            <div className="text-xs text-slate-400">Para conceptos simples (objetos, estilos)</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400 mb-1">200-500</div>
            <div className="text-xs text-slate-400">Para personas o animales específicos</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400 mb-1">500-1000</div>
            <div className="text-xs text-slate-400">Para conceptos muy específicos o raros</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getDefaultSubject(category: ConceptCategory): string {
  const defaults: Record<ConceptCategory, string> = {
    persona: 'person',
    estilo: 'artwork',
    objeto: 'object',
    animal: 'animal',
    arquitectura: 'building',
    paisaje: 'landscape',
  };
  return defaults[category];
}
