/**
 * KeyboardShortcuts - Sistema de atajos de teclado
 * 
 * Provee atajos para acciones comunes:
 * - Navegación entre tabs
 * - Validación rápida de captions
 * - Operaciones en lote
 * - Exportar dataset
 */

import { useEffect, useState } from 'react';
import {
  Keyboard,
  X,
} from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: string;
}

interface KeyboardShortcutsProps {
  onNavigate: (tab: string) => void;
  onValidateAll?: () => void;
  onExport?: () => void;
}

const SHORTCUTS: Shortcut[] = [
  // Navegación
  { key: '1', ctrl: true, description: 'Ir a Dashboard', action: 'dashboard' },
  { key: '2', ctrl: true, description: 'Ir a Sesiones', action: 'sessions' },
  { key: '3', ctrl: true, description: 'Ir a Pipeline', action: 'pipeline' },
  { key: '4', ctrl: true, description: 'Ir a Captions', action: 'captions' },
  { key: '5', ctrl: true, description: 'Ir a Plantillas', action: 'templates' },
  { key: '6', ctrl: true, description: 'Ir a Metadata', action: 'metadata' },
  { key: '7', ctrl: true, description: 'Ir a Planner', action: 'planner' },
  { key: '8', ctrl: true, description: 'Ir a Trigger', action: 'trigger' },
  { key: '9', ctrl: true, description: 'Ir a Exportar', action: 'export' },
  
  // Acciones
  { key: 'v', ctrl: true, shift: true, description: 'Validar todos los captions', action: 'validateAll' },
  { key: 'e', ctrl: true, shift: true, description: 'Exportar dataset', action: 'export' },
  
  // Ayuda
  { key: '?', shift: true, description: 'Mostrar atajos de teclado', action: 'showHelp' },
];

export default function KeyboardShortcuts({ onNavigate, onValidateAll, onExport }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está en un input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Buscar shortcut que coincida
      const shortcut = SHORTCUTS.find(s => {
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = s.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();

        return ctrlMatch && shiftMatch && altMatch && keyMatch;
      });

      if (shortcut) {
        e.preventDefault();
        
        if (shortcut.action === 'showHelp') {
          setShowHelp(prev => !prev);
        } else if (shortcut.action === 'validateAll' && onValidateAll) {
          onValidateAll();
        } else if (shortcut.action === 'export' && onExport) {
          onExport();
        } else if (['dashboard', 'sessions', 'pipeline', 'captions', 'templates', 'metadata', 'planner', 'trigger', 'export'].includes(shortcut.action)) {
          onNavigate(shortcut.action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onValidateAll, onExport]);

  // Formatear atajo para display
  const formatShortcut = (shortcut: Shortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  if (!showHelp) {
    return (
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-full shadow-lg transition-colors z-40"
        title="Atajos de teclado (Shift + ?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setShowHelp(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">Atajos de Teclado</h2>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de atajos */}
          <div className="space-y-6">
            {/* Navegación */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Navegación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SHORTCUTS.filter(s => s.ctrl && !s.shift && !s.alt && s.key >= '1' && s.key <= '9').map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-slate-300">{shortcut.description}</span>
                    <kbd className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Acciones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SHORTCUTS.filter(s => s.ctrl && s.shift && !s.alt).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-slate-300">{shortcut.description}</span>
                    <kbd className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Ayuda */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Ayuda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SHORTCUTS.filter(s => !s.ctrl && s.shift && !s.alt).map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-slate-300">{shortcut.description}</span>
                    <kbd className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Presiona <kbd className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono">Shift + ?</kbd> para mostrar/ocultar este panel
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
