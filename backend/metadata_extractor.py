#!/usr/bin/env python3
"""
Metadata Extractor - Extractor robusto de PNG Info para LoRA Dataset Pipeline
==============================================================================

Extrae metadatos de imágenes PNG (A1111/ComfyUI params) y otros formatos.
Soporta:
- PNG con tEXt chunks (A1111 WebUI format)
- PNG con ComfyUI workflow metadata
- JPEG con EXIF data (UserComment)
- Fallback graceful si no hay metadata

Autor: AI Local Command Hub - Módulo 4
"""

import os
import re
import json
import struct
from pathlib import Path
from typing import Optional


def extract_png_metadata(image_path: str) -> Optional[dict]:
    """
    Extraer metadatos de una imagen PNG.
    
    Soporta el formato de A1111 WebUI donde los parámetros se guardan
    en el chunk tEXt con clave 'parameters'.
    
    Formato esperado:
    ```
    prompt text here
    Negative prompt: negative text here
    Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 12345, Size: 512x512, Model hash: abc123, Model: model_name
    ```
    
    Args:
        image_path: Ruta al archivo de imagen
    
    Returns:
        Diccionario con metadatos extraídos o None si no hay
    """
    path = Path(image_path)
    
    if not path.exists():
        return None
    
    ext = path.suffix.lower()
    
    if ext == '.png':
        return _extract_png_text_chunks(image_path)
    elif ext in ('.jpg', '.jpeg'):
        return _extract_jpeg_exif(image_path)
    elif ext == '.webp':
        return _extract_webp_metadata(image_path)
    else:
        return None


def _extract_png_text_chunks(image_path: str) -> Optional[dict]:
    """
    Extraer chunks tEXt de un archivo PNG.
    
    El formato PNG almacena texto en chunks con estructura:
    - Length (4 bytes)
    - Chunk type 'tEXt' (4 bytes)
    - Keyword (null-terminated string)
    - Text (remaining bytes until chunk end)
    - CRC (4 bytes)
    """
    try:
        with open(image_path, 'rb') as f:
            # Verificar firma PNG
            signature = f.read(8)
            if signature != b'\x89PNG\r\n\x1a\n':
                return None
            
            metadata = {}
            
            while True:
                # Leer longitud del chunk
                length_bytes = f.read(4)
                if len(length_bytes) < 4:
                    break
                
                length = struct.unpack('>I', length_bytes)[0]
                
                # Leer tipo de chunk
                chunk_type = f.read(4).decode('ascii', errors='ignore')
                
                if chunk_type == 'tEXt':
                    # Leer datos del chunk
                    data = f.read(length)
                    
                    # Separar keyword y texto (separados por null byte)
                    null_pos = data.index(b'\x00')
                    keyword = data[:null_pos].decode('ascii', errors='ignore')
                    text = data[null_pos + 1:].decode('utf-8', errors='ignore')
                    
                    if keyword.lower() == 'parameters':
                        # Parsear formato A1111
                        parsed = _parse_a1111_params(text)
                        metadata.update(parsed)
                    else:
                        metadata[keyword] = text
                
                elif chunk_type == 'iTXt':
                    # International text chunk (ComfyUI usa esto)
                    data = f.read(length)
                    try:
                        null_pos = data.index(b'\x00')
                        keyword = data[:null_pos].decode('ascii', errors='ignore')
                        # Skip compression flag, method, language, translated keyword
                        rest = data[null_pos + 1:]
                        # Find next null bytes for fields
                        parts = rest.split(b'\x00', 2)
                        if len(parts) >= 3:
                            text = parts[2].decode('utf-8', errors='ignore')
                            metadata[keyword] = text
                    except (ValueError, IndexError):
                        pass
                
                elif chunk_type == 'IEND':
                    break
                else:
                    # Saltar chunk desconocido
                    f.seek(length, 1)  # datos
                    f.seek(4, 1)       # CRC
            
            return metadata if metadata else None
            
    except Exception as e:
        print(f"  ⚠️ Error leyendo PNG metadata: {e}")
        return None


def _parse_a1111_params(text: str) -> dict:
    """
    Parsear el formato de parámetros de A1111 WebUI.
    
    Formato:
    ```
    prompt text
    Negative prompt: negative text
    Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 123, Size: 512x512, ...
    ```
    """
    result = {}
    
    if not text or not text.strip():
        return result
    
    lines = text.strip().split('\n')
    
    if len(lines) == 0:
        return result
    
    # Primera línea (y posiblemente más) es el prompt
    # Buscar "Negative prompt:" para separar
    full_text = text.strip()
    
    # Extraer prompt principal
    neg_match = re.search(r'\nNegative prompt:\s*', full_text, re.IGNORECASE)
    if neg_match:
        result['prompt'] = full_text[:neg_match.start()].strip()
        remaining = full_text[neg_match.end():]
        
        # Extraer negative prompt
        steps_match = re.search(r'\nSteps:\s*', remaining, re.IGNORECASE)
        if not steps_match:
            steps_match = re.search(r'^Steps:\s*', remaining, re.IGNORECASE)
        
        if steps_match:
            result['negative_prompt'] = remaining[:steps_match.start()].strip()
            params_text = remaining[steps_match.start():]
        else:
            result['negative_prompt'] = remaining.strip()
            params_text = ''
    else:
        # Sin negative prompt, todo antes de "Steps:" es el prompt
        steps_match = re.search(r'\nSteps:\s*', full_text, re.IGNORECASE)
        if not steps_match:
            steps_match = re.search(r'^Steps:\s*', full_text, re.IGNORECASE)
        
        if steps_match:
            result['prompt'] = full_text[:steps_match.start()].strip()
            params_text = full_text[steps_match.start():]
        else:
            result['prompt'] = full_text.strip()
            params_text = ''
    
    # Parsear parámetros (Steps, Sampler, CFG, etc.)
    if params_text:
        # Buscar la línea que empieza con "Steps:"
        params_line = ''
        for line in params_text.split('\n'):
            if 'Steps:' in line or 'Sampler:' in line:
                params_line = line
                break
        
        if not params_line and params_text:
            params_line = params_text.split('\n')[0]
        
        if params_line:
            # Parsear key-value pairs separados por coma
            pairs = re.findall(r'([^:,]+):\s*([^,]+)', params_line)
            for key, value in pairs:
                key = key.strip().lower().replace(' ', '_')
                value = value.strip()
                if key and value:
                    result[key] = value
    
    return result


def _extract_jpeg_exif(image_path: str) -> Optional[dict]:
    """
    Extraer metadatos EXIF de archivos JPEG.
    
    Busca en el campo UserComment donde A1111 puede guardar parámetros.
    """
    try:
        # Intentar con Pillow si está disponible
        from PIL import Image
        from PIL.ExifTags import Base
        
        img = Image.open(image_path)
        exif_data = img._getexif()
        
        if not exif_data:
            return None
        
        metadata = {}
        
        # Buscar UserComment (tag 0x9286)
        user_comment = exif_data.get(0x9286)
        if user_comment:
            if isinstance(user_comment, bytes):
                # Intentar decodificar
                try:
                    # A1111 a veces guarda en formato ASCII con BOM
                    if user_comment.startswith(b'UNICODE\x00\x00\x00'):
                        text = user_comment[8:].decode('utf-16-be', errors='ignore')
                    else:
                        text = user_comment.decode('utf-8', errors='ignore')
                    
                    parsed = _parse_a1111_params(text)
                    metadata.update(parsed)
                except Exception:
                    pass
            elif isinstance(user_comment, str):
                parsed = _parse_a1111_params(user_comment)
                metadata.update(parsed)
        
        return metadata if metadata else None
        
    except ImportError:
        # Pillow no disponible, intentar lectura raw básica
        return _extract_jpeg_raw_comment(image_path)
    except Exception as e:
        print(f"  ⚠️ Error leyendo JPEG EXIF: {e}")
        return None


def _extract_jpeg_raw_comment(image_path: str) -> Optional[dict]:
    """Lectura raw de COM marker en JPEG sin Pillow"""
    try:
        with open(image_path, 'rb') as f:
            data = f.read()
            
            # Buscar APP1 (EXIF) marker
            app1_pos = data.find(b'\xff\xe1')
            if app1_pos == -1:
                return None
            
            # Buscar COM marker
            com_pos = data.find(b'\xff\xfe')
            if com_pos == -1:
                return None
            
            # Leer longitud
            length = struct.unpack('>H', data[com_pos+2:com_pos+4])[0]
            comment = data[com_pos+4:com_pos+2+length].decode('utf-8', errors='ignore')
            
            return _parse_a1111_params(comment)
            
    except Exception:
        return None


def _extract_webp_metadata(image_path: str) -> Optional[dict]:
    """Extraer metadatos de archivos WebP"""
    try:
        from PIL import Image
        
        img = Image.open(image_path)
        
        # WebP puede tener metadata en el info dict
        metadata = {}
        
        if hasattr(img, 'info'):
            for key, value in img.info.items():
                if isinstance(value, str) and len(value) > 10:
                    # Intentar parsear como A1111 params
                    if 'Steps:' in value or 'Sampler:' in value:
                        parsed = _parse_a1111_params(value)
                        metadata.update(parsed)
                    else:
                        metadata[key] = value
        
        return metadata if metadata else None
        
    except ImportError:
        return None
    except Exception as e:
        print(f"  ⚠️ Error leyendo WebP metadata: {e}")
        return None


def extract_all_metadata(directory: str) -> dict:
    """
    Extraer metadatos de todas las imágenes en un directorio.
    
    Args:
        directory: Ruta al directorio
    
    Returns:
        Diccionario {filename: metadata_dict}
    """
    results = {}
    supported = {'.png', '.jpg', '.jpeg', '.webp'}
    
    dir_path = Path(directory)
    if not dir_path.exists():
        return results
    
    for file_path in sorted(dir_path.iterdir()):
        if file_path.suffix.lower() in supported:
            metadata = extract_png_metadata(str(file_path))
            if metadata:
                results[file_path.name] = metadata
    
    return results


# ============================================================
# CLI (para testing independiente)
# ============================================================

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python metadata_extractor.py <ruta_imagen_o_directorio>")
        sys.exit(1)
    
    target = sys.argv[1]
    
    if os.path.isdir(target):
        results = extract_all_metadata(target)
        print(f"\n📊 Metadatos encontrados en {len(results)} de {len(list(Path(target).iterdir()))} archivos:")
        for filename, metadata in results.items():
            print(f"\n  📄 {filename}:")
            for key, value in metadata.items():
                print(f"     {key}: {value[:80]}{'...' if len(str(value)) > 80 else ''}")
    else:
        metadata = extract_png_metadata(target)
        if metadata:
            print(f"\n📊 Metadatos de {target}:")
            for key, value in metadata.items():
                print(f"  {key}: {value[:100]}{'...' if len(str(value)) > 100 else ''}")
        else:
            print(f"\n⚠️ No se encontraron metadatos en: {target}")
