/**
 * ImageDropZone - Zona de arrastre para imágenes del dataset
 * 
 * Permite:
 * - Drag & drop de múltiples imágenes
 * - Selección manual con file input
 * - Preview de imágenes cargadas
 * - Eliminar imágenes individuales
 * - Funciona con 1 o más imágenes (ideal para empezar con 1)
 * - Feedback visual durante el arrastre
 */

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface DroppedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

interface ImageDropZoneProps {
  images: DroppedImage[];
  onImagesChange: (images: DroppedImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageDropZone({ images, onImagesChange, maxImages = 200, disabled = false }: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      return `"${file.name}" no es un formato de imagen válido`;
    }
    if (file.size > 50 * 1024 * 1024) {
      return `"${file.name}" es demasiado grande (máx 50MB)`;
    }
    return null;
  };

  // Formatear tamaño
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Procesar archivos
  const processFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const newImages: DroppedImage[] = [];
    const errors: string[] = [];

    const fileArray = Array.from(files);
    
    // Verificar límite
    if (images.length + fileArray.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes. Actualmente tienes ${images.length}.`);
      return;
    }

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        return;
      }

      const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id,
        file,
        preview,
        name: file.name,
        size: formatSize(file.size),
      });
    });

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  }, [images, onImagesChange, maxImages]);

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // File input handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input para permitir seleccionar el mismo archivo
      e.target.value = '';
    }
  };

  // Eliminar imagen
  const handleRemove = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    onImagesChange(images.filter(img => img.id !== id));
  };

  // Eliminar todas
  const handleRemoveAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    onImagesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          disabled
            ? 'border-slate-700 bg-slate-900/50 cursor-not-allowed opacity-50'
            : isDragging
            ? 'border-cyan-400 bg-cyan-900/20 scale-[1.02]'
            : 'border-slate-700 bg-slate-900/30 hover:border-cyan-600 hover:bg-slate-800/50'
        }`}
      >
        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {/* Contenido */}
        <div className={`transition-transform ${isDragging ? 'scale-110' : ''}`}>
          {isDragging ? (
            <>
              <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
              <p className="text-lg font-medium text-cyan-300">¡Suelta las imágenes aquí!</p>
              <p className="text-sm text-slate-400 mt-1">Se agregarán al dataset</p>
            </>
          ) : images.length === 0 ? (
            <>
              <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-lg font-medium text-slate-200 mb-1">
                Arrastra imágenes aquí
              </p>
              <p className="text-sm text-slate-400 mb-3">
                o haz click para seleccionar archivos
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="bg-slate-800 px-2 py-1 rounded">PNG</span>
                <span className="bg-slate-800 px-2 py-1 rounded">JPG</span>
                <span className="bg-slate-800 px-2 py-1 rounded">WEBP</span>
                <span className="bg-slate-800 px-2 py-1 rounded">BMP</span>
                <span className="text-slate-600">•</span>
                <span>Máx 50MB por archivo</span>
              </div>
              <div className="mt-4 bg-cyan-900/20 border border-cyan-700/30 rounded-lg p-3">
                <p className="text-xs text-cyan-300">
                  💡 <strong>Tip:</strong> Puedes empezar con solo 1 imagen de referencia.
                  El pipeline generará variaciones automáticamente.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <p className="text-sm font-medium text-slate-200">
                  Agregar más imágenes
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {images.length} imagen{images.length !== 1 ? 'es' : ''} cargada{images.length !== 1 ? 's' : ''}
                {maxImages && ` • Máximo ${maxImages}`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-3">
          {/* Header con contador y acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-slate-200">
                {images.length} imagen{images.length !== 1 ? 'es' : ''} lista{images.length !== 1 ? 's' : ''} para procesar
              </span>
            </div>
            <button
              onClick={handleRemoveAll}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar todas
            </button>
          </div>

          {/* Grid de previews */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-600 transition-colors"
              >
                {/* Thumbnail */}
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay con info */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(img.id);
                    }}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-white text-center truncate w-full px-1" title={img.name}>
                    {img.name}
                  </p>
                  <p className="text-xs text-slate-400">{img.size}</p>
                </div>

                {/* Indicador de drag */}
                <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                Total: <span className="text-slate-200 font-medium">{images.length}</span>
              </span>
              <span className="text-slate-400">
                Tamaño: <span className="text-slate-200 font-medium">
                  {formatSize(images.reduce((sum, img) => sum + img.file.size, 0))}
                </span>
              </span>
            </div>
            <span className="text-xs text-green-400">
              ✓ Listo para pipeline
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar tipo para uso externo
export type { DroppedImage };
