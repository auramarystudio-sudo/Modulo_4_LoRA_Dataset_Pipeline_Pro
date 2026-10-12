/**
 * Zustand Store para LoRA Dataset Pipeline Pro
 * 
 * Gestiona el estado global de:
 * - Sesiones de entrenamiento (persistidas en localStorage)
 * - Pipeline en ejecución
 * - Configuración activa
 * - Integración con PocketBase (cuando está disponible)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TrainingSession,
  CaptionEntry,
  PipelineState,
  PipelineConfig,
  TrainingConfig,
  SessionEstado,
  ResolucionObjetivo,
} from '../types/lora-trainer';
import { DEFAULT_PIPELINE_CONFIG } from '../data/lora-defaults';

// ============================================================
// INTERFAZ DEL STORE
// ============================================================

interface LoraTrainerStore {
  // Sesiones
  sessions: TrainingSession[];
  activeSessionId: string | null;
  
  // Pipeline
  pipelineState: PipelineState;
  pipelineConfig: PipelineConfig;
  
  // Training config
  trainingConfig: TrainingConfig;
  
  // PocketBase
  pocketbaseUrl: string;
  pocketbaseConnected: boolean;
  
  // Acciones - Sesiones
  createSession: (nombre: string, triggerWord: string, conceptoBase: string) => string;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  updateSessionEstado: (id: string, estado: SessionEstado) => void;
  addCaptionsToSession: (sessionId: string, captions: CaptionEntry[]) => void;
  updateCaption: (sessionId: string, filename: string, caption: string) => void;
  validateCaption: (sessionId: string, filename: string, validated: boolean) => void;
  
  // Acciones - Pipeline
  setPipelineState: (state: Partial<PipelineState>) => void;
  resetPipeline: () => void;
  setPipelineConfig: (config: Partial<PipelineConfig>) => void;
  
  // Acciones - Training
  setTrainingConfig: (config: Partial<TrainingConfig>) => void;
  
  // Acciones - PocketBase
  setPocketbaseUrl: (url: string) => void;
  setPocketbaseConnected: (connected: boolean) => void;
  
  // Acciones - Integración Módulo 3
  loadFromGenerator: (prompt: string, triggerWord: string) => string;
}

// ============================================================
// STORE IMPLEMENTACIÓN
// ============================================================

export const useLoraTrainerStore = create<LoraTrainerStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sessions: [],
      activeSessionId: null,
      pipelineState: {
        running: false,
        progress: 0,
        logs: [],
      },
      pipelineConfig: { ...DEFAULT_PIPELINE_CONFIG },
      trainingConfig: {
        resolucion: '1024',
        numImagenes: 0,
        repeats: 5,
        epochs: 10,
        batchSize: 1,
        pasosTotales: 0,
        vramEstimadaGB: 8,
        buckets: [],
        tiempoEstimadoMin: 0,
      },
      pocketbaseUrl: 'http://127.0.0.1:8090',
      pocketbaseConnected: false,

      // === SESIONES ===
      
      createSession: (nombre, triggerWord, conceptoBase) => {
        const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newSession: TrainingSession = {
          id,
          nombre_proyecto: nombre,
          trigger_word: triggerWord,
          concepto_base: conceptoBase,
          captions_generados: [],
          resolucion_objetivo: '1024',
          class_images_prompts: [],
          estado: 'planificacion',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession],
          activeSessionId: id,
        }));
        
        return id;
      },

      deleteSession: (id) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== id),
          activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
        }));
      },

      setActiveSession: (id) => {
        set({ activeSessionId: id });
      },

      updateSession: (id, updates) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
          ),
        }));
      },

      updateSessionEstado: (id, estado) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === id ? { ...s, estado, updated_at: new Date().toISOString() } : s
          ),
        }));
      },

      addCaptionsToSession: (sessionId, captions) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? { ...s, captions_generados: [...s.captions_generados, ...captions], updated_at: new Date().toISOString() }
              : s
          ),
        }));
      },

      updateCaption: (sessionId, filename, caption) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  captions_generados: s.captions_generados.map(c =>
                    c.filename === filename ? { ...c, caption } : c
                  ),
                  updated_at: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      validateCaption: (sessionId, filename, validated) => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  captions_generados: s.captions_generados.map(c =>
                    c.filename === filename ? { ...c, validated } : c
                  ),
                  updated_at: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      // === PIPELINE ===
      
      setPipelineState: (pipelineUpdate) => {
        set(state => ({
          pipelineState: { ...state.pipelineState, ...pipelineUpdate },
        }));
      },

      resetPipeline: () => {
        set({
          pipelineState: {
            running: false,
            progress: 0,
            logs: [],
          },
        });
      },

      setPipelineConfig: (config) => {
        set(state => ({
          pipelineConfig: { ...state.pipelineConfig, ...config },
        }));
      },

      // === TRAINING CONFIG ===
      
      setTrainingConfig: (config) => {
        set(state => ({
          trainingConfig: { ...state.trainingConfig, ...config },
        }));
      },

      // === POCKETBASE ===
      
      setPocketbaseUrl: (url) => {
        set({ pocketbaseUrl: url });
      },

      setPocketbaseConnected: (connected) => {
        set({ pocketbaseConnected: connected });
      },

      // === INTEGRACIÓN MÓDULO 3 ===
      
      loadFromGenerator: (prompt, triggerWord) => {
        const id = get().createSession(
          `Generado: ${prompt.slice(0, 30)}...`,
          triggerWord,
          prompt
        );
        return id;
      },
    }),
    {
      name: 'lora-trainer-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        pipelineConfig: state.pipelineConfig,
        trainingConfig: state.trainingConfig,
        pocketbaseUrl: state.pocketbaseUrl,
      }),
    }
  )
);
