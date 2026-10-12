/**
 * TriggerManager - CRUD validador de trigger words
 * 
 * Funcionalidades:
 * - Input con debounce 500ms
 * - Validación contra lista local de 50+ triggers comunes
 * - Resultados: ✅ Válido / ⚠️ Posible conflicto / ❌ Conflicto directo
 * - Sugerencias automáticas de alternativas únicas
 * - Botón "Aplicar a Sesión Activa"
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Hash,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';
import { COMMON_TRIGGERS } from '../../data/lora-defaults';
import type { TriggerValidation, TriggerStatus } from '../../types/lora-trainer';

export default function TriggerManager() {
  const { activeSessionId, sessions, updateSession } = useLoraTrainerStore();
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const [inputValue, setInputValue] = useState(activeSession?.trigger_word || '');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isApplied, setIsApplied] = useState(false);

  // Debounce 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue.trim().toLowerCase());
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Validación del trigger
  const validation: TriggerValidation | null = useMemo(() => {
    if (!debouncedValue || debouncedValue.length < 2) {
      return null;
    }

    // Buscar conflicto directo (match exacto)
    const directConflict = COMMON_TRIGGERS.find(
      t => t.word.toLowerCase() === debouncedValue
    );

    if (directConflict) {
      return {
        word: debouncedValue,
        status: 'direct_conflict' as TriggerStatus,
        message: `Conflicto directo con trigger de "${directConflict.modelo}" (${directConflict.categoria})`,
        modeloAsociado: directConflict.modelo,
        alternatives: generateAlternatives(debouncedValue),
      };
    }

    // Buscar conflicto parcial (substring)
    const partialConflicts = COMMON_TRIGGERS.filter(
      t => t.word.toLowerCase().includes(debouncedValue) || debouncedValue.includes(t.word.toLowerCase())
    );

    if (partialConflicts.length > 0) {
      return {
        word: debouncedValue,
        status: 'conflict' as TriggerStatus,
        message: `Posible conflicto con ${partialConflicts.length} trigger(s) existente(s): ${partialConflicts.map(t => t.word).join(', ')}`,
        alternatives: generateAlternatives(debouncedValue),
      };
    }

    // Validar formato
    if (!/^[a-z0-9_-]+$/.test(debouncedValue)) {
      return {
        word: debouncedValue,
        status: 'conflict' as TriggerStatus,
        message: 'Usa solo letras minúsculas, números, guiones y guiones bajos',
        alternatives: [debouncedValue.replace(/[^a-z0-9_-]/g, '').toLowerCase()],
      };
    }

    if (debouncedValue.length < 3) {
      return {
        word: debouncedValue,
        status: 'conflict' as TriggerStatus,
        message: 'Mínimo 3 caracteres para un trigger efectivo',
        alternatives: generateAlternatives(debouncedValue),
      };
    }

    // Válido
    return {
      word: debouncedValue,
      status: 'valid' as TriggerStatus,
      message: '✅ Trigger único y válido. Sin conflictos detectados.',
      alternatives: [],
    };
  }, [debouncedValue]);

  // Generar alternativas únicas
  function generateAlternatives(base: string): string[] {
    const clean = base.replace(/[^a-z0-9]/g, '').slice(0, 6);
    const suffixes = ['x', 'z', 'q', 'v', 'k'];
    return suffixes.map(s => `${clean}${s}`).filter(alt => 
      !COMMON_TRIGGERS.some(t => t.word === alt)
    );
  }

  // Aplicar trigger a sesión activa
  const handleApply = useCallback(() => {
    if (!activeSessionId || !validation || validation.status !== 'valid') return;
    
    updateSession(activeSessionId, { trigger_word: debouncedValue });
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2000);
  }, [activeSessionId, validation, debouncedValue, updateSession]);

  // Seleccionar sugerencia
  const handleSelectAlternative = (alt: string) => {
    setInputValue(alt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Gestor de Trigger Words</h2>
        </div>

        {/* Input principal */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Trigger Word
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsApplied(false);
              }}
              placeholder="Escribe un trigger word único (ej: mychr, artstyle1)"
              className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-slate-200 font-mono text-lg focus:outline-none transition-colors ${
                validation?.status === 'valid'
                  ? 'border-emerald-500 focus:border-emerald-400'
                  : validation?.status === 'direct_conflict'
                  ? 'border-red-500 focus:border-red-400'
                  : validation?.status === 'conflict'
                  ? 'border-yellow-500 focus:border-yellow-400'
                  : 'border-slate-700 focus:border-cyan-500'
              }`}
            />
            {validation && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {validation.status === 'conflict' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                {validation.status === 'direct_conflict' && <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            )}
          </div>
        </div>

        {/* Resultado de validación */}
        {validation && (
          <div className={`p-4 rounded-lg mb-4 border ${
            validation.status === 'valid'
              ? 'bg-emerald-900/20 border-emerald-700/50'
              : validation.status === 'direct_conflict'
              ? 'bg-red-900/20 border-red-700/50'
              : 'bg-yellow-900/20 border-yellow-700/50'
          }`}>
            <div className="flex items-start gap-2">
              {validation.status === 'valid' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : validation.status === 'direct_conflict' ? (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  validation.status === 'valid' ? 'text-emerald-300' :
                  validation.status === 'direct_conflict' ? 'text-red-300' :
                  'text-yellow-300'
                }`}>
                  {validation.message}
                </p>
                {validation.modeloAsociado && (
                  <p className="text-xs text-slate-400 mt-1">
                    Modelo en conflicto: <span className="text-slate-300">{validation.modeloAsociado}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sugerencias */}
        {validation && validation.status !== 'valid' && validation.alternatives && validation.alternatives.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Alternativas sugeridas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {validation.alternatives.map(alt => (
                <button
                  key={alt}
                  onClick={() => handleSelectAlternative(alt)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-600 text-slate-200 font-mono text-sm px-3 py-1.5 rounded-lg transition-all"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón aplicar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleApply}
            disabled={!validation || validation.status !== 'valid' || !activeSession}
            className={`flex items-center gap-2 font-medium px-6 py-2.5 rounded-lg transition-colors ${
              validation?.status === 'valid' && activeSession
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            {isApplied ? '¡Aplicado!' : 'Aplicar a Sesión Activa'}
          </button>

          {activeSession && (
            <span className="text-sm text-slate-400">
              Sesión actual: <span className="text-cyan-300 font-mono">{activeSession.trigger_word}</span>
            </span>
          )}
        </div>
      </div>

      {/* Lista de triggers comunes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">
          Triggers Comunes (evitar conflictos)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {COMMON_TRIGGERS.slice(0, 30).map(trigger => (
            <div
              key={trigger.word}
              className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
            >
              <span className="font-mono text-sm text-slate-200">{trigger.word}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{trigger.categoria}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(trigger.popularidad, 5) }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Mostrando 30 de {COMMON_TRIGGERS.length} triggers registrados. Popularidad indica frecuencia de uso en la comunidad.
        </p>
      </div>
    </div>
  );
}
