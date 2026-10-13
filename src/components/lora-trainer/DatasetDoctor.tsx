/**
 * DatasetDoctor - Diagnóstico del dataset
 * 
 * Analiza el dataset actual y da recomendaciones específicas
 * para mejorarlo antes de entrenar.
 */

import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Image,
  FileText,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

interface Diagnostic {
  id: string;
  title: string;
  status: 'good' | 'warning' | 'bad';
  message: string;
  recommendation: string;
  icon: React.ReactNode;
}

export default function DatasetDoctor() {
  const { sessions, activeSessionId, droppedImages } = useLoraTrainerStore();
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const numImages = activeSession?.captions_generados.length ?? droppedImages.length ?? 0;
  const numValidated = activeSession?.captions_generados.filter((c) => c.validated).length ?? 0;
  const triggerWord = activeSession?.trigger_word ?? '';
  const captions = activeSession?.captions_generados ?? [];

  // Diagnósticos
  const diagnostics: Diagnostic[] = [];

  // 1. Cantidad de imágenes
  if (numImages === 0) {
    diagnostics.push({
      id: 'count',
      title: 'Cantidad de imágenes',
      status: 'bad',
      message: 'No hay imágenes en tu dataset todavía.',
      recommendation: 'Agrega al menos 15 imágenes para empezar. Lo ideal son 20-40 imágenes variadas.',
      icon: <Image className="w-4 h-4" />,
    });
  } else if (numImages < 10) {
    diagnostics.push({
      id: 'count',
      title: 'Cantidad de imágenes',
      status: 'bad',
      message: `Solo tienes ${numImages} imágenes. Es muy poco para un buen entrenamiento.`,
      recommendation: 'Agrega al menos 15-20 imágenes más. Cuantas más variaciones, mejor aprenderá el modelo tu concepto.',
      icon: <Image className="w-4 h-4" />,
    });
  } else if (numImages < 15) {
    diagnostics.push({
      id: 'count',
      title: 'Cantidad de imágenes',
      status: 'warning',
      message: `Tienes ${numImages} imágenes. Es aceptable, pero podrías mejorar con más variaciones.`,
      recommendation: 'Intenta llegar a 20-30 imágenes. Más variedad = mejor resultado. Diferentes ángulos, iluminación y fondos.',
      icon: <Image className="w-4 h-4" />,
    });
  } else if (numImages <= 50) {
    diagnostics.push({
      id: 'count',
      title: 'Cantidad de imágenes',
      status: 'good',
      message: `¡Perfecto! Tienes ${numImages} imágenes. Es una cantidad ideal.`,
      recommendation: 'Esta cantidad es excelente para un LoRA. Asegúrate de que sean variadas.',
      icon: <Image className="w-4 h-4" />,
    });
  } else {
    diagnostics.push({
      id: 'count',
      title: 'Cantidad de imágenes',
      status: 'warning',
      message: `Tienes ${numImages} imágenes. Bastantes, pero ten cuidado con la consistencia.`,
      recommendation: 'Muchas imágenes pueden ser buenas, pero asegúrate de que todas sean de calidad consistente. Demasiadas imágenes malas pueden perjudicar más que ayudar.',
      icon: <Image className="w-4 h-4" />,
    });
  }

  // 2. Trigger word
  if (!triggerWord) {
    diagnostics.push({
      id: 'trigger',
      title: 'Trigger Word',
      status: 'bad',
      message: 'No has definido un trigger word.',
      recommendation: 'Crea una sesión y define un trigger word único (ej: "sks", "ohwx"). Es esencial para que el modelo aprenda tu concepto.',
      icon: <FileText className="w-4 h-4" />,
    });
  } else if (triggerWord.length < 3) {
    diagnostics.push({
      id: 'trigger',
      title: 'Trigger Word',
      status: 'warning',
      message: `Tu trigger word "${triggerWord}" es muy corto.`,
      recommendation: 'Usa un trigger word de al menos 3-4 caracteres. Las palabras muy cortas pueden causar conflictos con tokens existentes del modelo.',
      icon: <FileText className="w-4 h-4" />,
    });
  } else {
    // Check if trigger word is a common word
    const commonWords = ['person', 'man', 'woman', 'dog', 'cat', 'house', 'car', 'photo', 'image', 'art', 'style'];
    const isCommon = commonWords.some((w) => triggerWord.toLowerCase() === w);
    if (isCommon) {
      diagnostics.push({
        id: 'trigger',
        title: 'Trigger Word',
        status: 'warning',
        message: `"${triggerWord}" es una palabra común. Puede causar conflictos.`,
        recommendation: 'Usa una palabra inventada o muy rara. Ejemplos buenos: "sks", "ohwx", "tjrt", "miestilopersonal".',
        icon: <FileText className="w-4 h-4" />,
      });
    } else {
      diagnostics.push({
        id: 'trigger',
        title: 'Trigger Word',
        status: 'good',
        message: `Tu trigger word "${triggerWord}" parece único. ¡Bien!`,
        recommendation: 'Asegúrate de que esté al inicio de cada caption. Ejemplo: "sks woman in park, sunny day".',
        icon: <FileText className="w-4 h-4" />,
      });
    }
  }

  // 3. Captions
  if (captions.length === 0 && numImages > 0) {
    diagnostics.push({
      id: 'captions',
      title: 'Captions',
      status: 'bad',
      message: 'Tus imágenes no tienen captions todavía.',
      recommendation: 'Ejecuta el pipeline para generar captions automáticamente, o escríbelos manualmente. Cada imagen necesita una descripción.',
      icon: <FileText className="w-4 h-4" />,
    });
  } else if (captions.length > 0) {
    // Check if trigger word is in captions
    const captionsWithTrigger = captions.filter((c) =>
      c.caption.toLowerCase().includes(triggerWord.toLowerCase())
    );
    const triggerPercentage = Math.round((captionsWithTrigger.length / captions.length) * 100);

    if (triggerPercentage < 100) {
      diagnostics.push({
        id: 'captions',
        title: 'Trigger en Captions',
        status: triggerPercentage < 50 ? 'bad' : 'warning',
        message: `Solo el ${triggerPercentage}% de los captions incluyen el trigger word "${triggerWord}".`,
        recommendation: 'El trigger word DEBE estar en el 100% de los captions. Edita los que faltan en la pestaña Captions.',
        icon: <FileText className="w-4 h-4" />,
      });
    } else {
      diagnostics.push({
        id: 'captions',
        title: 'Trigger en Captions',
        status: 'good',
        message: '¡Perfecto! Todos los captions incluyen el trigger word.',
        recommendation: 'El modelo podrá asociar correctamente tu trigger word con el concepto.',
        icon: <FileText className="w-4 h-4" />,
      });
    }

    // Caption validation
    if (numValidated === 0) {
      diagnostics.push({
        id: 'validation',
        title: 'Validación de Captions',
        status: 'warning',
        message: 'Ningún caption ha sido validado todavía.',
        recommendation: 'Revisa cada caption y marca los que estén correctos. Un caption mal escrito puede confundir al modelo.',
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    } else if (numValidated < captions.length) {
      diagnostics.push({
        id: 'validation',
        title: 'Validación de Captions',
        status: 'warning',
        message: `${numValidated} de ${captions.length} captions validados.`,
        recommendation: `Te faltan ${captions.length - numValidated} captions por revisar. Tómate tu tiempo para verificar cada uno.`,
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    } else {
      diagnostics.push({
        id: 'validation',
        title: 'Validación de Captions',
        status: 'good',
        message: 'Todos los captions han sido validados. ¡Excelente!',
        recommendation: 'Tu dataset está bien revisado. Puedes proceder al entrenamiento.',
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    }

    // Caption length check
    const avgLength = captions.reduce((sum, c) => sum + c.caption.length, 0) / captions.length;
    if (avgLength > 200) {
      diagnostics.push({
        id: 'length',
        title: 'Longitud de Captions',
        status: 'warning',
        message: `Tus captions son muy largos en promedio (${Math.round(avgLength)} caracteres).`,
        recommendation: 'Intenta mantener los captions entre 50-150 caracteres. Captions muy largos diluyen la importancia del trigger word.',
        icon: <FileText className="w-4 h-4" />,
      });
    } else if (avgLength < 20) {
      diagnostics.push({
        id: 'length',
        title: 'Longitud de Captions',
        status: 'warning',
        message: `Tus captions son muy cortos en promedio (${Math.round(avgLength)} caracteres).`,
        recommendation: 'Agrega más detalle a tus captions. Incluye: sujeto, acción, entorno, iluminación. Entre 50-150 caracteres es ideal.',
        icon: <FileText className="w-4 h-4" />,
      });
    } else {
      diagnostics.push({
        id: 'length',
        title: 'Longitud de Captions',
        status: 'good',
        message: `Longitud promedio de captions: ${Math.round(avgLength)} caracteres. Perfecto.`,
        recommendation: 'Ni muy largos ni muy cortos. Buen equilibrio.',
        icon: <FileText className="w-4 h-4" />,
      });
    }
  }

  // 4. Overall score
  const goodCount = diagnostics.filter((d) => d.status === 'good').length;
  const warningCount = diagnostics.filter((d) => d.status === 'warning').length;
  const badCount = diagnostics.filter((d) => d.status === 'bad').length;
  const totalScore = Math.round((goodCount / diagnostics.length) * 100);

  const statusConfig = {
    good: { color: 'text-green-400', bg: 'bg-green-900/20 border-green-700/30', icon: <CheckCircle2 className="w-5 h-5 text-green-400" /> },
    warning: { color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700/30', icon: <AlertTriangle className="w-5 h-5 text-yellow-400" /> },
    bad: { color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/30', icon: <XCircle className="w-5 h-5 text-red-400" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header con score */}
      <div className={`border rounded-2xl p-6 ${
        totalScore >= 70 ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700/30' :
        totalScore >= 40 ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/30' :
        'bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-700/30'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <Stethoscope className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Diagnóstico del Dataset</h2>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="text-4xl font-bold text-slate-100">{totalScore}%</div>
          <div>
            <p className="text-sm text-slate-300">
              {totalScore >= 70 && '¡Tu dataset está en buena forma!'}
              {totalScore >= 40 && totalScore < 70 && 'Tu dataset necesita algunas mejoras.'}
              {totalScore < 40 && 'Tu dataset necesita trabajo antes de entrenar.'}
            </p>
            <div className="flex gap-3 mt-1 text-xs">
              <span className="text-green-400">✅ {goodCount} bien</span>
              <span className="text-yellow-400">⚠️ {warningCount} avisos</span>
              <span className="text-red-400">❌ {badCount} errores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="space-y-3">
        {diagnostics.map((diag) => {
          const config = statusConfig[diag.status];
          return (
            <div
              key={diag.id}
              className={`border rounded-xl p-4 ${config.bg}`}
            >
              <div className="flex items-start gap-3">
                {config.icon}
                <div className="flex-1">
                  <h3 className={`font-medium text-sm ${config.color}`}>{diag.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{diag.message}</p>
                  <div className="mt-2 flex items-start gap-2 bg-slate-900/50 rounded-lg p-2.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">{diag.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips section */}
      <div className="bg-cyan-900/10 border border-cyan-700/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-medium text-cyan-300">Consejos para mejorar tu score</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            Usa entre 20-40 imágenes variadas (diferentes ángulos, iluminación y fondos)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            Asegúrate de que el trigger word esté al inicio de TODOS los captions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            Mantén los captions entre 50-150 caracteres, descriptivos pero concisos
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            Valida cada caption manualmente para asegurar calidad
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            Elimina imágenes con marcas de agua, texto o baja calidad
          </li>
        </ul>
      </div>
    </div>
  );
}
