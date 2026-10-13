/**
 * PhotoGuide - Guía de fotografía para datasets
 * 
 * Guía visual y práctica para novatos sobre cómo tomar
 * buenas fotos para entrenar un LoRA.
 */

import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sun,
  Maximize2,
  Eye,
  Layers,
  ArrowRight,
  AlertTriangle,
  Star,
} from 'lucide-react';

interface PhotoTip {
  id: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
  icon: React.ReactNode;
  example: string;
}

const PHOTO_TIPS: PhotoTip[] = [
  {
    id: 'variety',
    title: 'Variedad de ángulos',
    description: 'Tu concepto debe verse desde múltiples perspectivas para que el modelo lo aprenda en 3D.',
    dos: [
      'Frente directo (mirando a cámara)',
      'Perfil izquierdo y derecho',
      'Tres cuartos (45 grados)',
      'Vista desde arriba y abajo',
      'Primer plano y plano completo',
    ],
    donts: [
      'Todas las fotos desde el mismo ángulo',
      'Solo selfies de frente',
      'Siempre la misma distancia',
    ],
    icon: <Eye className="w-5 h-5" />,
    example: 'Para un LoRA de tu cara: 5 fotos de frente, 5 de perfil, 5 de 3/4, 3 desde arriba, 2 cuerpo completo.',
  },
  {
    id: 'lighting',
    title: 'Iluminación variada',
    description: 'Diferentes condiciones de luz ayudan al modelo a entender tu concepto sin depender de una iluminación específica.',
    dos: [
      'Luz natural (día soleado, nublado)',
      'Luz artificial interior',
      'Luz lateral (dramática)',
      'Luz frontal suave',
      'Golden hour (atardecer)',
    ],
    donts: [
      'Todas con flash directo',
      'Todas en oscuridad',
      'Sombras muy duras en la cara',
      'Contraluz extremo',
    ],
    icon: <Sun className="w-5 h-5" />,
    example: 'Si todas tus fotos son con flash, el modelo aprenderá a poner "flash" en todo lo que genere.',
  },
  {
    id: 'background',
    title: 'Fondos variados',
    description: 'Fondos diferentes evitan que el modelo asocie tu concepto con un lugar específico.',
    dos: [
      'Interior (casa, oficina, estudio)',
      'Exterior (parque, calle, naturaleza)',
      'Fondos neutros (pared blanca, gris)',
      'Fondos con textura',
      'Algunos fondos desenfocados (bokeh)',
    ],
    donts: [
      'Siempre el mismo fondo',
      'Fondos muy recargados que distraigan',
      'Fondos con texto o logos',
    ],
    icon: <Layers className="w-5 h-5" />,
    example: 'Si todas tus fotos son en tu sala, el LoRA generará tu concepto SIEMPRE en una sala.',
  },
  {
    id: 'resolution',
    title: 'Resolución adecuada',
    description: 'Las imágenes deben tener suficiente resolución para que el modelo capture los detalles.',
    dos: [
      'Mínimo 512x512 píxeles',
      'Ideal: 1024x1024 o más',
      'Imágenes nítidas y enfocadas',
      'Formato PNG o JPG de alta calidad',
      'Proporción variada (cuadrada, vertical, horizontal)',
    ],
    donts: [
      'Imágenes pixeladas o borrosas',
      'Fotos muy pequeñas (< 256px)',
      'Imágenes muy comprimidas (artefactos JPG)',
      'Capturas de pantalla de baja calidad',
    ],
    icon: <Maximize2 className="w-5 h-5" />,
    example: 'Una foto de 200x200px de WhatsApp no sirve. Necesitas al menos 512x512, idealmente 1024x1024.',
  },
  {
    id: 'clean',
    title: 'Imágenes limpias',
    description: 'Las imágenes deben estar libres de elementos que puedan confundir al modelo.',
    dos: [
      'Fotos sin marcas de agua',
      'Sin textos superpuestos',
      'Sin logos o firmas',
      'Sin bordes decorativos',
      'Sin filtros extremos',
    ],
    donts: [
      'Imágenes con logo de Instagram/TikTok',
      'Fotos con fecha/hora impresa',
      'Imágenes con marcos o stickers',
      'Fotos muy editadas con filtros pesados',
    ],
    icon: <Camera className="w-5 h-5" />,
    example: 'Si tus fotos tienen un logo de "Canon" en la esquina, el modelo aprenderá a poner logos en todo.',
  },
  {
    id: 'consistency',
    title: 'Consistencia del sujeto',
    description: 'Todas las fotos deben ser del MISMO concepto. No mezcles cosas diferentes.',
    dos: [
      'Todas las fotos del mismo sujeto/estilo',
      'Misma persona (si es un LoRA de persona)',
      'Mismo objeto desde diferentes ángulos',
      'Mismo estilo artístico consistente',
    ],
    donts: [
      'Mezclar fotos de diferentes personas',
      'Combinar estilos (realista + anime + 3D)',
      'Incluir fotos que no son del concepto',
      'Fotos de "antes y después" juntas',
    ],
    icon: <Star className="w-5 h-5" />,
    example: 'Si entrenas un LoRA de TU cara, NO incluyas fotos de otras personas, aunque se parezcan.',
  },
];

export default function PhotoGuide() {
  const [activeTip, setActiveTip] = useState<string>('variety');

  const currentTip = PHOTO_TIPS.find((t) => t.id === activeTip)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Camera className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-slate-100">Guía de Fotografía para tu Dataset</h2>
        </div>
        <p className="text-sm text-slate-400">
          Cómo tomar las mejores fotos para entrenar tu LoRA. 
          <span className="text-amber-400"> La calidad de tus fotos determina la calidad de tu resultado.</span>
        </p>
      </div>

      {/* Quick summary */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Regla de oro: 20-40 fotos variadas y de buena calidad
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl mb-1">📐</div>
            <div className="text-xs text-slate-400">Mínimo 512x512</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-xs text-slate-400">Varios ángulos</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl mb-1">💡</div>
            <div className="text-xs text-slate-400">Luz variada</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-2xl mb-1">🧹</div>
            <div className="text-xs text-slate-400">Sin marcas de agua</div>
          </div>
        </div>
      </div>

      {/* Tip navigation */}
      <div className="flex flex-wrap gap-2">
        {PHOTO_TIPS.map((tip) => (
          <button
            key={tip.id}
            onClick={() => setActiveTip(tip.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTip === tip.id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tip.icon}
            <span className="hidden sm:inline">{tip.title}</span>
          </button>
        ))}
      </div>

      {/* Active tip detail */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-900/30 p-2 rounded-lg">
            {currentTip.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{currentTip.title}</h3>
            <p className="text-sm text-slate-400">{currentTip.description}</p>
          </div>
        </div>

        {/* Dos and Don'ts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dos */}
          <div className="bg-green-900/10 border border-green-700/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-green-400 flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-4 h-4" /> Lo que SÍ debes hacer
            </h4>
            <ul className="space-y-2">
              {currentTip.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-green-200/80">
                  <ArrowRight className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-900/10 border border-red-700/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-red-400 flex items-center gap-1.5 mb-3">
              <XCircle className="w-4 h-4" /> Lo que NO debes hacer
            </h4>
            <ul className="space-y-2">
              {currentTip.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-200/80">
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Example */}
        <div className="bg-cyan-900/10 border border-cyan-700/20 rounded-lg p-3 flex gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-200/80">{currentTip.example}</p>
        </div>
      </div>

      {/* Checklist rápido */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-200 mb-4">✅ Checklist antes de subir tus fotos</h3>
        <div className="space-y-2">
          {[
            '¿Tengo entre 15 y 50 fotos?',
            '¿Son de diferentes ángulos?',
            '¿Tienen diferente iluminación?',
            '¿Tienen diferentes fondos?',
            '¿Son todas del mismo sujeto/concepto?',
            '¿Tienen buena resolución (mín. 512x512)?',
            '¿Están libres de marcas de agua y texto?',
            '¿Están enfocadas y nítidas?',
            '¿Eliminé las fotos malas/borrosas?',
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pro tips */}
      <div className="bg-purple-900/10 border border-purple-700/20 rounded-xl p-4">
        <h3 className="text-sm font-medium text-purple-300 mb-3">🎓 Tips Pro</h3>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Si no tienes suficientes fotos reales, genera algunas con IA (usando prompts similares) y mézclalas.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Para LoRAs de estilo artístico: usa 30-50 imágenes del artista/estilo en diferentes obras.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Para LoRAs de persona: incluye fotos con diferentes expresiones (sonriendo, seria, hablando).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>Para LoRAs de objeto: muestra el objeto en diferentes contextos y con diferentes acompañantes.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
