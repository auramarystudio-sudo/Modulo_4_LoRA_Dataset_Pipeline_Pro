/**
 * DirectoryPicker - Explorador de directorios interactivo
 * 
 * Permite seleccionar rutas de directorios mediante:
 * - Explorador visual con navegación por carpetas
 * - Búsqueda de carpetas/archivos
 * - File System Access API (cuando está disponible)
 * - Breadcrumb de navegación
 * - Vista previa de contenido
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileImage,
  Search,
  ChevronRight,
  Home,
  ArrowUp,
  X,
  Check,
  HardDrive,
  Monitor,
} from 'lucide-react';

interface DirectoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
  mode?: 'input' | 'output';
}

// Estructura de carpetas simulada para demo
interface FileSystemItem {
  name: string;
  type: 'folder' | 'file';
  path: string;
  size?: string;
  modified?: string;
  children?: FileSystemItem[];
}

// Sistema de archivos simulado con estructura realista
const MOCK_FILESYSTEM: FileSystemItem[] = [
  {
    name: 'Home',
    type: 'folder',
    path: '/home/usuario',
    children: [
      {
        name: 'Documentos',
        type: 'folder',
        path: '/home/usuario/Documentos',
        children: [
          { name: 'proyectos-lora', type: 'folder', path: '/home/usuario/Documentos/proyectos-lora' },
          { name: 'datasets', type: 'folder', path: '/home/usuario/Documentos/datasets' },
        ]
      },
      {
        name: 'Descargas',
        type: 'folder',
        path: '/home/usuario/Descargas',
        children: [
          { name: 'imagenes-raw', type: 'folder', path: '/home/usuario/Descargas/imagenes-raw' },
        ]
      },
      {
        name: 'Imágenes',
        type: 'folder',
        path: '/home/usuario/Imágenes',
        children: [
          { name: 'dataset-personaje', type: 'folder', path: '/home/usuario/Imágenes/dataset-personaje' },
          { name: 'referencias', type: 'folder', path: '/home/usuario/Imágenes/referencias' },
          { name: 'generadas', type: 'folder', path: '/home/usuario/Imágenes/generadas' },
        ]
      },
      {
        name: 'Proyectos',
        type: 'folder',
        path: '/home/usuario/Proyectos',
        children: [
          {
            name: 'ai-local-command-hub',
            type: 'folder',
            path: '/home/usuario/Proyectos/ai-local-command-hub',
            children: [
              { name: 'datasets', type: 'folder', path: '/home/usuario/Proyectos/ai-local-command-hub/datasets' },
              { name: 'output', type: 'folder', path: '/home/usuario/Proyectos/ai-local-command-hub/output' },
            ]
          },
        ]
      },
    ]
  },
  {
    name: 'Disco Local (C:)',
    type: 'folder',
    path: 'C:/',
    children: [
      {
        name: 'Users',
        type: 'folder',
        path: 'C:/Users',
        children: [
          {
            name: 'Usuario',
            type: 'folder',
            path: 'C:/Users/Usuario',
            children: [
              { name: 'Desktop', type: 'folder', path: 'C:/Users/Usuario/Desktop' },
              { name: 'Documents', type: 'folder', path: 'C:/Users/Usuario/Documents' },
              { name: 'Pictures', type: 'folder', path: 'C:/Users/Usuario/Pictures' },
            ]
          }
        ]
      },
      {
        name: 'StableDiffusion',
        type: 'folder',
        path: 'C:/StableDiffusion',
        children: [
          { name: 'outputs', type: 'folder', path: 'C:/StableDiffusion/outputs' },
          { name: 'training', type: 'folder', path: 'C:/StableDiffusion/training' },
          { name: 'datasets', type: 'folder', path: 'C:/StableDiffusion/datasets' },
        ]
      },
    ]
  },
];

export default function DirectoryPicker({ isOpen, onClose, onSelect, initialPath = '', mode = 'input' }: DirectoryPickerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath || '/home/usuario');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [useNativePicker, setUseNativePicker] = useState(false);

  // Encontrar el nodo actual en el filesystem
  const currentFolder = useMemo(() => {
    return findFolderByPath(MOCK_FILESYSTEM, currentPath);
  }, [currentPath]);

  // Filtrar items por búsqueda
  const filteredItems = useMemo(() => {
    if (!currentFolder?.children) return [];
    
    if (!searchQuery) return currentFolder.children;
    
    return currentFolder.children.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentFolder, searchQuery]);

  // Breadcrumb
  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join('/'),
    }));
  }, [currentPath]);

  // Navegar a una carpeta
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFolder(null);
    setSearchQuery('');
  };

  // Seleccionar carpeta actual
  const handleSelectCurrent = () => {
    onSelect(currentPath);
    onClose();
  };

  // File System Access API (Chrome/Edge)
  const handleNativePicker = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-ignore - API no estandarizada aún
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        // En un entorno real, obtendríamos la ruta del handle
        // Por ahora usamos el nombre como identificador
        onSelect(`/${dirHandle.name}`);
        onClose();
      } catch (err) {
        console.log('Picker cancelado:', err);
      }
    }
  };

  // Enter para seleccionar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedFolder) {
        handleSelectCurrent();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedFolder]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">
              {mode === 'input' ? 'Seleccionar Directorio de Entrada' : 'Seleccionar Directorio de Salida'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar carpetas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => navigateTo('/')}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
            title="Inicio"
          >
            <Home className="w-4 h-4" />
          </button>
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.path} className="flex items-center gap-1 flex-shrink-0">
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <button
                onClick={() => navigateTo(crumb.path)}
                className={`text-sm px-2 py-0.5 rounded transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'text-cyan-300 bg-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Contenido - Lista de carpetas */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {/* Botón para subir */}
          {currentPath !== '/' && (
            <button
              onClick={() => {
                const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
                navigateTo(parent);
              }}
              className="flex items-center gap-2 w-full p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors mb-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm">Subir un nivel</span>
            </button>
          )}

          {/* Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchQuery ? (
                <p className="text-sm">No se encontraron carpetas con "{searchQuery}"</p>
              ) : (
                <p className="text-sm">Esta carpeta está vacía</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.type === 'folder') {
                      setSelectedFolder(item.path);
                      navigateTo(item.path);
                    }
                  }}
                  onDoubleClick={() => {
                    if (item.type === 'folder') {
                      onSelect(item.path);
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors text-left ${
                    selectedFolder === item.path
                      ? 'bg-cyan-900/30 border border-cyan-700/50'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  ) : (
                    <FileImage className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200 truncate block">{item.name}</span>
                  </div>
                  {item.type === 'folder' && (
                    <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Path actual y acciones */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {/* Path actual */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
            <HardDrive className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={currentPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-200 font-mono focus:outline-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {'showDirectoryPicker' in window && (
                <button
                  onClick={handleNativePicker}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Usar explorador nativo del sistema"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Explorador nativo
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSelectCurrent}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Check className="w-4 h-4" />
                Seleccionar esta carpeta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function findFolderByPath(tree: FileSystemItem[], path: string): FileSystemItem | null {
  for (const node of tree) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFolderByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}
