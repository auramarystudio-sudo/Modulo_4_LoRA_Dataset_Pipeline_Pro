#!/usr/bin/env python3
"""
LoRA Dataset Preparation Pipeline - Script CLI Principal
=========================================================

Módulo principal del pipeline de preparación de datasets para LoRA.
Ejecuta la extracción de metadatos, generación de captions y exportación
del dataset en formato compatible con Kohya_ss.

Uso:
    python lora-dataset-prep.py -i /ruta/imagenes -o /ruta/output -t trigger_word [opciones]

Opciones:
    -i, --input         Directorio de entrada con imágenes
    -o, --output        Directorio de salida para dataset procesado
    -t, --trigger       Trigger word para los captions
    --method            Método de captioning: florence2 | ollama (default: florence2)
    --model             Modelo específico (Florence-2 variant o Ollama model)
    --dry-run           Simular sin escribir archivos
    --json-output       Devolver resultado en formato JSON
    --ollama-url        URL del endpoint Ollama (default: http://localhost:11434)
    --batch-size        Tamaño de batch para procesamiento (default: 1)
    --verbose           Output detallado

Autor: AI Local Command Hub - Módulo 4
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Optional

# Importar módulos locales
try:
    from metadata_extractor import extract_png_metadata, extract_all_metadata
    from caption_engine import CaptionEngine, Florence2Engine, OllamaEngine
except ImportError:
    # Fallback si los módulos no están en el path
    script_dir = Path(__file__).parent
    sys.path.insert(0, str(script_dir))
    from metadata_extractor import extract_png_metadata, extract_all_metadata
    from caption_engine import CaptionEngine, Florence2Engine, OllamaEngine


def parse_args() -> argparse.Namespace:
    """Parsear argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(
        description='LoRA Dataset Preparation Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  # Procesar con Florence-2 local
  python lora-dataset-prep.py -i ./images -o ./dataset -t mychar --method florence2
  
  # Procesar con Ollama API
  python lora-dataset-prep.py -i ./images -o ./dataset -t mychar --method ollama --model llava:7b
  
  # Dry run (solo verificar, no escribir)
  python lora-dataset-prep.py -i ./images -o ./dataset -t mychar --dry-run --json-output
        """
    )
    
    parser.add_argument('-i', '--input', required=True, help='Directorio de entrada con imágenes')
    parser.add_argument('-o', '--output', required=True, help='Directorio de salida para dataset')
    parser.add_argument('-t', '--trigger', required=True, help='Trigger word para captions')
    parser.add_argument('--method', choices=['florence2', 'ollama'], default='florence2',
                       help='Método de captioning (default: florence2)')
    parser.add_argument('--model', default=None,
                       help='Modelo específico (ej: microsoft/Florence-2-base, llava:7b)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sin escribir archivos')
    parser.add_argument('--json-output', action='store_true',
                       help='Devolver resultado en formato JSON')
    parser.add_argument('--ollama-url', default='http://localhost:11434',
                       help='URL del endpoint Ollama')
    parser.add_argument('--batch-size', type=int, default=1,
                       help='Tamaño de batch para procesamiento')
    parser.add_argument('--verbose', action='store_true',
                       help='Output detallado')
    
    return parser.parse_args()


def find_images(input_dir: str) -> list[Path]:
    """Buscar todas las imágenes en el directorio de entrada"""
    supported_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}
    input_path = Path(input_dir)
    
    if not input_path.exists():
        raise FileNotFoundError(f"Directorio no encontrado: {input_dir}")
    
    images = []
    for ext in supported_extensions:
        images.extend(input_path.glob(f'*{ext}'))
        images.extend(input_path.glob(f'*{ext.upper()}'))
    
    # Eliminar duplicados y ordenar
    images = sorted(set(images))
    return images


def process_pipeline(args: argparse.Namespace) -> dict:
    """
    Ejecutar el pipeline completo de preparación de dataset.
    
    Flujo:
    1. Escanear directorio de entrada
    2. Extraer metadatos PNG Info de cada imagen
    3. Generar captions usando el método seleccionado
    4. Enriquecer captions con metadatos originales
    5. Escribir archivos .txt gemelos (si no es dry-run)
    6. Retornar resultado estructurado
    """
    start_time = time.time()
    results = {
        'success': False,
        'output': '',
        'processedCount': 0,
        'durationSeconds': 0,
        'captions': [],
    }
    
    logs = []
    
    def log(level: str, message: str, progress: Optional[int] = None):
        """Función helper para logging"""
        entry = {
            'timestamp': time.strftime('%H:%M:%S'),
            'level': level,
            'message': message,
        }
        if progress is not None:
            entry['progress'] = progress
        logs.append(entry)
        
        if not args.json_output:
            prefix = {'info': 'ℹ️', 'success': '✅', 'warning': '⚠️', 'error': '❌'}.get(level, '')
            print(f"[{entry['timestamp']}] {prefix} {message}")
    
    try:
        # Paso 1: Escanear directorio
        log('info', f'🚀 Iniciando pipeline de preparación de dataset...')
        log('info', f'📁 Input: {args.input}')
        log('info', f'📁 Output: {args.output}')
        log('info', f'🏷️ Trigger: {args.trigger}')
        log('info', f'🤖 Método: {args.method}{" (DRY RUN)" if args.dry_run else ""}')
        
        images = find_images(args.input)
        total = len(images)
        
        if total == 0:
            raise ValueError(f'No se encontraron imágenes en: {args.input}')
        
        log('info', f'🖼️ Encontradas {total} imágenes para procesar', 5)
        
        # Paso 2: Inicializar motor de captioning
        log('info', f'🧠 Inicializando motor de captioning ({args.method})...', 10)
        
        if args.method == 'florence2':
            model_name = args.model or 'microsoft/Florence-2-base'
            engine = Florence2Engine(model_name=model_name)
        else:
            model_name = args.model or 'llava:7b'
            engine = OllamaEngine(
                endpoint=args.ollama_url,
                model=model_name
            )
        
        engine.initialize()
        log('success', f'✅ Motor {args.method} inicializado', 15)
        
        # Paso 3: Procesar cada imagen
        captions = []
        output_path = Path(args.output)
        
        if not args.dry_run:
            output_path.mkdir(parents=True, exist_ok=True)
        
        for i, image_path in enumerate(images):
            progress = 15 + int((i / total) * 75)
            log('info', f'📸 Procesando [{i+1}/{total}]: {image_path.name}', progress)
            
            try:
                # Extraer metadatos PNG Info
                metadata = extract_png_metadata(str(image_path))
                
                if metadata and args.verbose:
                    log('info', f'  📋 Metadata encontrada: {len(metadata)} campos')
                
                # Generar caption
                raw_caption = engine.generate_caption(str(image_path))
                
                # Enriquecer con metadatos originales
                enriched_caption = enrich_caption(
                    args.trigger, raw_caption, metadata
                )
                
                caption_entry = {
                    'filename': image_path.name,
                    'imagePath': str(image_path),
                    'caption': enriched_caption,
                    'originalMetadata': metadata if metadata else {},
                    'variacion': 0.5,
                    'validated': False,
                }
                captions.append(caption_entry)
                
                # Escribir archivo .txt gemelo (si no es dry-run)
                if not args.dry_run:
                    txt_path = output_path / f"{image_path.stem}.txt"
                    with open(txt_path, 'w', encoding='utf-8') as f:
                        f.write(enriched_caption)
                    
                    if args.verbose:
                        log('info', f'  💾 Escrito: {txt_path.name}')
                
                log('success', f'  ✓ Caption generado para {image_path.name}')
                
            except Exception as e:
                log('error', f'  ❌ Error procesando {image_path.name}: {str(e)}')
                if args.verbose:
                    import traceback
                    log('error', f'  {traceback.format_exc()}')
                continue
        
        # Paso 4: Finalizar
        if not args.dry_run:
            log('info', '💾 Archivos escritos al disco', 95)
        else:
            log('warning', '⚠️ DRY RUN - No se escribieron archivos', 95)
        
        duration = time.time() - start_time
        log('success', f'✅ Pipeline completado en {duration:.1f}s', 100)
        log('success', f'📊 {len(captions)} imágenes procesadas exitosamente')
        
        results['success'] = True
        results['processedCount'] = len(captions)
        results['durationSeconds'] = round(duration, 2)
        results['captions'] = captions
        results['output'] = '\n'.join([l['message'] for l in logs])
        
    except Exception as e:
        duration = time.time() - start_time
        log('error', f'❌ Error fatal: {str(e)}')
        
        results['success'] = False
        results['error'] = str(e)
        results['durationSeconds'] = round(duration, 2)
        results['output'] = '\n'.join([l['message'] for l in logs])
    
    return results


def enrich_caption(trigger: str, raw_caption: str, metadata: Optional[dict]) -> str:
    """
    Enriquecer el caption generado con metadatos originales.
    
    Reglas:
    - Trigger word SIEMPRE al inicio
    - No sobrescribir información útil del metadata
    - Combinar de forma coherente
    """
    # Limpiar el caption raw
    clean_caption = raw_caption.strip()
    
    # Si hay metadata con prompt original, extraer elementos clave
    if metadata and metadata.get('prompt'):
        original_prompt = metadata['prompt']
        # Extraer descriptores clave (primeras 2-3 cláusulas)
        clauses = [c.strip() for c in original_prompt.split(',') if len(c.strip()) > 3]
        key_elements = clauses[:3]
        
        if key_elements:
            # Combinar: trigger + caption generado + elementos clave del original
            clean_caption = f"{clean_caption}, {', '.join(key_elements)}"
    
    # Asegurar que el trigger está al inicio
    if not clean_caption.lower().startswith(trigger.lower()):
        clean_caption = f"{trigger}, {clean_caption}"
    
    return clean_caption


def main():
    """Punto de entrada principal"""
    args = parse_args()
    
    try:
        results = process_pipeline(args)
        
        if args.json_output:
            # Salida JSON para integración con React
            print(json.dumps(results, indent=2, ensure_ascii=False))
        else:
            # Salida legible
            if results['success']:
                print(f"\n{'='*50}")
                print(f"✅ Pipeline exitoso")
                print(f"   Imágenes procesadas: {results['processedCount']}")
                print(f"   Duración: {results['durationSeconds']}s")
                print(f"{'='*50}")
            else:
                print(f"\n❌ Pipeline falló: {results.get('error', 'Error desconocido')}")
                sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n\n⚠️ Pipeline interrumpido por el usuario")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
