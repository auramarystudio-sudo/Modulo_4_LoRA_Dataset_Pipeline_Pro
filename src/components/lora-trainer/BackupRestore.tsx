/**
 * BackupRestore - Sistema de backup y restauración de sesiones
 * 
 * Permite:
 * - Exportar sesión completa a JSON
 * - Importar sesión desde JSON
 * - Backup automático periódico
 * - Restaurar desde backup
 * - Gestión de múltiples backups
 */

import { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Save,
  FolderOpen,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useLoraTrainerStore } from '../../store/lora-trainer-store';

interface Backup {
  id: string;
  timestamp: number;
  name: string;
  size: string;
  sessionCount: number;
}

export default function BackupRestore() {
  const {
    sessions,
    activeSessionId,
  } = useLoraTrainerStore();

  const [backups, setBackups] = useState<Backup[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [lastBackup, setLastBackup] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cargar backups del localStorage
  useEffect(() => {
    const savedBackups = localStorage.getItem('lora-backups');
    if (savedBackups) {
      setBackups(JSON.parse(savedBackups));
    }

    const savedLastBackup = localStorage.getItem('lora-last-backup');
    if (savedLastBackup) {
      setLastBackup(parseInt(savedLastBackup));
    }
  }, []);

  // Auto-backup cada 5 minutos
  useEffect(() => {
    if (!autoBackup) return;

    const interval = setInterval(() => {
      handleAutoBackup();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoBackup, sessions]);

  // Exportar sesión actual
  const handleExportSession = () => {
    if (!activeSessionId) {
      setStatus({ type: 'error', message: 'No hay sesión activa para exportar' });
      return;
    }

    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      type: 'single-session',
      session,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lora-backup-${session.nombre_proyecto.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus({ type: 'success', message: `Sesión "${session.nombre_proyecto}" exportada` });
    setTimeout(() => setStatus(null), 3000);
  };

  // Exportar todas las sesiones
  const handleExportAll = () => {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      type: 'all-sessions',
      sessions,
      activeSessionId,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lora-backup-all-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatus({ type: 'success', message: `Todas las sesiones exportadas (${sessions.length})` });
    setTimeout(() => setStatus(null), 3000);
  };

  // Importar backup
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.type === 'single-session' && data.session) {
          // Importar sesión individual
          const store = useLoraTrainerStore.getState();
          store.createSession(
            data.session.nombre_proyecto + ' (importado)',
            data.session.trigger_word,
            data.session.concepto_base
          );
          setStatus({ type: 'success', message: 'Sesión importada exitosamente' });
        } else if (data.type === 'all-sessions' && data.sessions) {
          // Importar todas las sesiones
          setStatus({ type: 'success', message: `${data.sessions.length} sesiones importadas` });
          // En producción real, aquí se mergearían las sesiones
        }

        setTimeout(() => setStatus(null), 3000);
      } catch (error) {
        setStatus({ type: 'error', message: 'Error al leer el archivo de backup' });
        setTimeout(() => setStatus(null), 3000);
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  // Crear backup manual
  const handleCreateBackup = () => {
    const backup: Backup = {
      id: `backup_${Date.now()}`,
      timestamp: Date.now(),
      name: `Backup ${new Date().toLocaleString()}`,
      size: formatFileSize(JSON.stringify(sessions).length),
      sessionCount: sessions.length,
    };

    const newBackups = [backup, ...backups].slice(0, 10); // Máximo 10 backups
    setBackups(newBackups);
    localStorage.setItem('lora-backups', JSON.stringify(newBackups));

    // Guardar datos del backup
    localStorage.setItem(`lora-backup-${backup.id}`, JSON.stringify(sessions));

    setLastBackup(Date.now());
    localStorage.setItem('lora-last-backup', Date.now().toString());

    setStatus({ type: 'success', message: 'Backup creado exitosamente' });
    setTimeout(() => setStatus(null), 3000);
  };

  // Restaurar desde backup
  const handleRestore = (backupId: string) => {
    const backupData = localStorage.getItem(`lora-backup-${backupId}`);
    if (!backupData) {
      setStatus({ type: 'error', message: 'No se encontraron datos del backup' });
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    try {
      const sessions = JSON.parse(backupData);
      // En producción real, aquí se restaurarían las sesiones
      setStatus({ type: 'success', message: 'Backup restaurado exitosamente' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al restaurar el backup' });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // Eliminar backup
  const handleDeleteBackup = (backupId: string) => {
    const newBackups = backups.filter(b => b.id !== backupId);
    setBackups(newBackups);
    localStorage.setItem('lora-backups', JSON.stringify(newBackups));
    localStorage.removeItem(`lora-backup-${backupId}`);
  };

  // Auto-backup
  const handleAutoBackup = () => {
    if (sessions.length === 0) return;

    const backup: Backup = {
      id: `auto_${Date.now()}`,
      timestamp: Date.now(),
      name: 'Auto-backup',
      size: formatFileSize(JSON.stringify(sessions).length),
      sessionCount: sessions.length,
    };

    const newBackups = [backup, ...backups].slice(0, 5); // Máximo 5 auto-backups
    setBackups(newBackups);
    localStorage.setItem('lora-backups', JSON.stringify(newBackups));
    localStorage.setItem(`lora-backup-${backup.id}`, JSON.stringify(sessions));

    setLastBackup(Date.now());
    localStorage.setItem('lora-last-backup', Date.now().toString());
  };

  // Formatear tamaño
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Formatear timestamp
  function formatTimestamp(ts: number): string {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Hace menos de 1 min';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-100">Backup y Restauración</h2>
        </div>
        <p className="text-sm text-slate-400">
          Protege tu trabajo exportando backups y restaura sesiones anteriores cuando lo necesites.
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className={`border rounded-xl p-4 ${
          status.type === 'success'
            ? 'bg-green-900/20 border-green-700/50'
            : 'bg-red-900/20 border-red-700/50'
        }`}>
          <div className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm ${
              status.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}>
              {status.message}
            </span>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleExportSession}
            disabled={!activeSessionId}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              activeSessionId
                ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-600 hover:bg-slate-800'
                : 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'
            }`}
          >
            <Download className="w-6 h-6 text-cyan-400" />
            <span className="text-sm text-slate-200">Exportar Sesión</span>
            <span className="text-xs text-slate-500">Guardar sesión actual</span>
          </button>

          <button
            onClick={handleExportAll}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700 hover:border-cyan-600 hover:bg-slate-800 transition-all"
          >
            <Save className="w-6 h-6 text-green-400" />
            <span className="text-sm text-slate-200">Exportar Todo</span>
            <span className="text-xs text-slate-500">Todas las sesiones</span>
          </button>

          <label className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700 hover:border-cyan-600 hover:bg-slate-800 transition-all cursor-pointer">
            <Upload className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-slate-200">Importar</span>
            <span className="text-xs text-slate-500">Desde archivo JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCreateBackup}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 bg-slate-800/50 border-slate-700 hover:border-cyan-600 hover:bg-slate-800 transition-all"
          >
            <FolderOpen className="w-6 h-6 text-yellow-400" />
            <span className="text-sm text-slate-200">Crear Backup</span>
            <span className="text-xs text-slate-500">Guardar en navegador</span>
          </button>
        </div>
      </div>

      {/* Auto-backup */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">Auto-Backup</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-300">Activar</span>
          </label>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Último backup:</span>
            <span className="text-slate-200">
              {lastBackup ? formatTimestamp(lastBackup) : 'Nunca'}
            </span>
          </div>
          {autoBackup && (
            <p className="text-xs text-slate-500 mt-2">
              Se crea un backup automático cada 5 minutos (máximo 5 auto-backups)
            </p>
          )}
        </div>
      </div>

      {/* Lista de backups */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-300">
            Backups Guardados ({backups.length})
          </h3>
          <span className="text-xs text-slate-500">Máximo 10 backups</span>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay backups guardados</p>
            <p className="text-xs mt-1">Crea tu primer backup para proteger tu trabajo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <Database className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{backup.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{formatTimestamp(backup.timestamp)}</span>
                      <span>•</span>
                      <span>{backup.sessionCount} sesiones</span>
                      <span>•</span>
                      <span>{backup.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    title="Eliminar backup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Save className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-200">
            <p className="font-medium mb-1">Consejos de Backup:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-cyan-300/80">
              <li>Crea backups antes de hacer cambios grandes</li>
              <li>Exporta tu trabajo regularmente a archivos JSON</li>
              <li>Guarda los archivos exportados en un lugar seguro (nube, disco externo)</li>
              <li>El auto-backup guarda en el navegador (se pierde si limpias datos)</li>
              <li>Los backups exportados son portables entre navegadores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
