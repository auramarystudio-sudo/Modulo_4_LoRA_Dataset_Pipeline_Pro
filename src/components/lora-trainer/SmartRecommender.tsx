/**
 * SmartRecommender - Recomendador inteligente basado en el dataset
 * 
 * Analiza el dataset y proporciona sugerencias automáticas:
 * - Mejoras de captions
 * - Ajustes de configuración
 * - Optimizaciones de rendimiento
 * - Prevención de problemas comunes
 */

import { useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { validateDataset } from '../../utils/dataset-validator';

interface Recommendation {
  id: string;
  type: 'critical' | 'important' | 'suggestion';
  category: string;
  title: string;
  description: string;
  action?: string;
  impact: 'high' | 'medium' | 'low';
}

export default function SmartRecommender() {
  const {
    sessions,
    activeSessionId,
  } = useLoraTrainerStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const captions = activeSession?.captions_generados || [];

  // Validación del dataset
  const validation = useMemo(() => {
    if (!activeSession) return null;
    return validateDataset(captions, activeSession.trigger_word);
  }, [captions, activeSession]);

  // Generar recomendaciones
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    if (!activeSession || captions.length === 0) return recs;

    const totalImages = captions.length;
    const validatedCount = captions.filter(c => c.validated).length;
    const validationRate = Math.round((validatedCount / totalImages) * 100);
    const withMetadata = captions.filter(c => c.originalMetadata && Object.keys(c.originalMetadata).length > 0).length;
    const metadataCoverage = Math.round((withMetadata / totalImages) * 100);
    const avgCaptionLength = Math.round(captions.reduce((sum, c) => sum + c.caption.length, 0) / totalImages);
    const triggerCoverage = validation?.stats.triggerCoverage || 0;

    // Análisis de longitud de captions
    const shortCaptions = captions.filter(c => c.caption.length < 50);
    const longCaptions = captions.filter(c => c.caption.length > 250);

    // Análisis de diversidad
    const uniqueWords = new Set(captions.flatMap(c => c.caption.toLowerCase().split(/\s+/).filter(w => w.length > 2)));
    const diversityRatio = uniqueWords.size / totalImages;

    // Recomendaciones críticas
    if (totalImages < 15) {
      recs.push({
        id: 'low-image-count',
        type: 'critical',
        category: 'Dataset',
        title: 'Agrega más imágenes',
        description: `Tienes solo ${totalImages} imágenes. Se recomiendan mínimo 15-20 para un LoRA efectivo.`,
        action: 'Sube al menos 15 imágenes variadas de tu concepto',
        impact: 'high',
      });
    }

    if (triggerCoverage < 90) {
      recs.push({
        id: 'low-trigger-coverage',
        type: 'critical',
        category: 'Captions',
        title: 'Trigger word faltante en muchos captions',
        description: `Solo el ${triggerCoverage}% de los captions incluyen el trigger word. Debería ser >95%.`,
        action: 'Agrega el trigger word al inicio de todos los captions',
        impact: 'high',
      });
    }

    if (validationRate < 80) {
      recs.push({
        id: 'low-validation-rate',
        type: 'critical',
        category: 'Validación',
        title: 'Valida más captions',
        description: `Solo el ${validationRate}% están validados. Revisa y valida al menos el 80%.`,
        action: 'Ve a la pestaña "Captions" y valida los que estén correctos',
        impact: 'high',
      });
    }

    // Recomendaciones importantes
    if (avgCaptionLength < 60) {
      recs.push({
        id: 'short-captions',
        type: 'important',
        category: 'Captions',
        title: 'Captions muy cortos',
        description: `Longitud promedio: ${avgCaptionLength} caracteres. Agrega más detalles descriptivos.`,
        action: 'Edita los captions para incluir más información sobre la imagen',
        impact: 'medium',
      });
    }

    if (avgCaptionLength > 200) {
      recs.push({
        id: 'long-captions',
        type: 'important',
        category: 'Captions',
        title: 'Captions muy largos',
        description: `Longitud promedio: ${avgCaptionLength} caracteres. Simplifica para mejor entrenamiento.`,
        action: 'Acorta los captions manteniendo solo la información esencial',
        impact: 'medium',
      });
    }

    if (shortCaptions.length > totalImages * 0.3) {
      recs.push({
        id: 'many-short-captions',
        type: 'important',
        category: 'Captions',
        title: 'Muchos captions cortos',
        description: `${shortCaptions.length} captions tienen menos de 50 caracteres.`,
        action: 'Revisa y expande los captions más cortos',
        impact: 'medium',
      });
    }

    if (metadataCoverage < 50) {
      recs.push({
        id: 'low-metadata-coverage',
        type: 'suggestion',
        category: 'Metadata',
        title: 'Pocas imágenes con metadata',
        description: `Solo el ${metadataCoverage}% tienen metadatos PNG. No es crítico pero puede ayudar.`,
        action: 'Considera usar imágenes generadas con prompts guardados',
        impact: 'low',
      });
    }

    if (diversityRatio < 5) {
      recs.push({
        id: 'low-diversity',
        type: 'important',
        category: 'Diversidad',
        title: 'Baja diversidad de términos',
        description: `Solo ${diversityRatio.toFixed(1)} palabras únicas por imagen. Usa más variedad.`,
        action: 'Incluye más términos descriptivos variados en los captions',
        impact: 'medium',
      });
    }

    // Recomendaciones de configuración
    if (totalImages > 50 && !activeSession.pasos_recomendados) {
      recs.push({
        id: 'no-training-plan',
        type: 'suggestion',
        category: 'Entrenamiento',
        title: 'Planifica el entrenamiento',
        description: 'Tienes un dataset grande pero no has planificado el entrenamiento.',
        action: 'Ve a la pestaña "Planner" para calcular los pasos óptimos',
        impact: 'medium',
      });
    }

    if (totalImages >= 15 && totalImages <= 30 && validationRate >= 90 && triggerCoverage >= 95) {
      recs.push({
        id: 'ready-to-train',
        type: 'suggestion',
        category: 'Estado',
        title: '¡Listo para entrenar!',
        description: 'Tu dataset cumple con los requisitos básicos. Puedes proceder.',
        action: 'Exporta la configuración y entrena tu LoRA',
        impact: 'high',
      });
    }

    // Recomendaciones de optimización
    if (totalImages > 100) {
      recs.push({
        id: 'large-dataset',
        type: 'suggestion',
        category: 'Optimización',
        title: 'Dataset grande detectado',
        description: `Tienes ${totalImages} imágenes. Considera usar menos epochs para evitar overfitting.`,
        action: 'Usa 5-10 epochs en lugar de 15-20',
        impact: 'medium',
      });
    }

    if (activeSession.resolucion_objetivo === '1024' && totalImages < 30) {
      recs.push({
        id: 'high-res-small-dataset',
        type: 'suggestion',
        category: 'Configuración',
        title: 'Alta resolución con dataset pequeño',
        description: 'Estás usando 1024px con pocas imágenes. Considera 768px para mejor resultado.',
        action: 'Cambia a 768px en la configuración',
        impact: 'low',
      });
    }

    return recs;
  }, [captions, activeSession, validation]);

  // Estadísticas
  const stats = useMemo(() => {
    const critical = recommendations.filter(r => r.type === 'critical').length;
    const important = recommendations.filter(r => r.type === 'important').length;
    const suggestions = recommendations.filter(r => r.type === 'suggestion').length;

    return { critical, important, suggestions, total: recommendations.length };
  }, [recommendations]);

  // Color por tipo
  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-900/20 border-red-700/50 text-red-300';
      case 'important': return 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300';
      case 'suggestion': return 'bg-blue-900/20 border-blue-700/50 text-blue-300';
    }
  };

  // Icono por tipo
  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'important': return <TrendingUp className="w-5 h-5 text-yellow-400" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  if (!activeSession || captions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-200 mb-2">Sin datos para analizar</h3>
        <p className="text-slate-400">Crea una sesión y genera captions para recibir recomendaciones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Recomendaciones Inteligentes</h2>
        </div>
        <p className="text-sm text-slate-400">
          Análisis automático de tu dataset con sugerencias personalizadas para mejorar los resultados.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
          <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-300">{stats.critical}</div>
          <div className="text-xs text-slate-400">Críticas</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-300">{stats.important}</div>
          <div className="text-xs text-slate-400">Importantes</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 text-center">
          <Lightbulb className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-300">{stats.suggestions}</div>
          <div className="text-xs text-slate-400">Sugerencias</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-cyan-300">{stats.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
      </div>

      {/* Lista de recomendaciones */}
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border rounded-xl p-4 ${getTypeColor(rec.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800/50">
                      {rec.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      rec.impact === 'high' ? 'bg-red-900/50 text-red-300' :
                      rec.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-blue-900/50 text-blue-300'
                    }`}>
                      Impacto: {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Medio' : 'Bajo'}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium mb-1">{rec.title}</h4>
                  <p className="text-xs opacity-90 mb-2">{rec.description}</p>
                  {rec.action && (
                    <p className="text-xs font-medium opacity-80 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {rec.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-300 mb-2">
            ¡Excelente trabajo!
          </h3>
          <p className="text-sm text-green-400/80">
            No hay recomendaciones. Tu dataset está optimizado para entrenar.
          </p>
        </div>
      )}

      {/* Tips generales */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Consejos generales:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              <li>Prioriza las recomendaciones críticas sobre las sugerencias</li>
              <li>Un dataset pequeño pero diverso es mejor que uno grande con duplicados</li>
              <li>Valida manualmente al menos el 80% de los captions</li>
              <li>Usa el trigger word consistentemente al inicio de cada caption</li>
              <li>Prueba diferentes configuraciones de entrenamiento para encontrar la óptima</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
