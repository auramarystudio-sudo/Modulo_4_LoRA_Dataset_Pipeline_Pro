# 🚀 Guía Rápida para Principiantes

> **Tu primer LoRA en 10 minutos**

Esta guía te llevará paso a paso para crear tu primer LoRA, incluso si nunca has trabajado con IA antes.

---

## 📋 ¿Qué vas a aprender?

- ✅ Qué es un LoRA y para qué sirve
- ✅ Cómo preparar tu dataset
- ✅ Cómo usar esta herramienta
- ✅ Cómo entrenar tu LoRA
- ✅ Cómo usar tu LoRA entrenado

---

## 🎯 ¿Qué es un LoRA?

Un **LoRA** es como enseñarle un truco nuevo a la IA. 

**Ejemplos:**
- Enseñarle tu estilo artístico
- Enseñarle tu personaje favorito
- Enseñarle un objeto específico
- Enseñarle una técnica especial

**Analogía:** Imagina que la IA es un artista experto. Con LoRA, le muestras ejemplos de lo que quieres que aprenda, y después puede crear cosas nuevas en ese estilo.

---

## 🛠️ ¿Qué necesitas?

### Hardware
- **Computadora** con Windows, Linux o Mac
- **Tarjeta gráfica NVIDIA** con 8GB+ VRAM (recomendado 12GB+)
  - RTX 3060 (12GB) ✅
  - RTX 4070 (12GB) ✅
  - RTX 4090 (24GB) ✅✅✅

### Archivos
- **15-50 imágenes** de lo que quieres enseñar
  - Resolución mínima: 512x512 (SD 1.5) o 1024x1024 (SDXL)
  - Formatos: PNG, JPG, WEBP
  - Variedad de ángulos, poses y fondos

### Software
- **Navegador web** moderno (Chrome, Firefox, Edge)
- **Kohya_ss** (para entrenar) - [Descargar aquí](https://github.com/bmaltais/kohya_ss)

---

## 📸 Paso 1: Preparar tus Imágenes

### ¿Qué imágenes usar?

**✅ Buenas imágenes:**
- Alta calidad y resolución
- Variedad de ángulos y poses
- Diferentes fondos
- Buena iluminación
- Enfocadas en tu concepto

**❌ Evitar:**
- Imágenes borrosas o pixeladas
- Marcas de agua o texto
- Imágenes muy similares entre sí
- Fondos muy distractores

### Ejemplo: Entrenar tu estilo artístico

```
✅ 20-30 de tus mejores dibujos/pinturas
✅ Diferentes temas (retratos, paisajes, objetos)
✅ Diferentes técnicas (línea, color, sombreado)
✅ Alta resolución (al menos 1024x1024)
```

### Ejemplo: Entrenar un personaje

```
✅ 15-25 imágenes del personaje
✅ Diferentes poses (frontal, perfil, 3/4)
✅ Diferentes expresiones (feliz, serio, neutral)
✅ Diferentes fondos
✅ Diferentes ángulos de cámara
```

---

## 🎨 Paso 2: Elegir tu Trigger Word

El **trigger word** es la palabra mágica que activará tu LoRA.

### Reglas:
- ✅ Usa solo letras minúsculas y números
- ✅ Mínimo 3 caracteres
- ✅ Que sea única (no una palabra común)
- ✅ Fácil de recordar y escribir

### Ejemplos:

**❌ Malos:**
- `person` (muy genérico)
- `art` (demasiado común)
- `MyStyle123` (mayúsculas)

**✅ Buenos:**
- `mystyle` (tu estilo)
- `juanchar` (tu personaje Juan)
- `cybrpnk` (estilo cyberpunk)
- `ohwx` (código único)

### 💡 Tip:
Usa la pestaña **"Trigger"** para verificar que tu trigger word no entre en conflicto con otros LoRAs populares.

---

## 🚀 Paso 3: Usar la Herramienta

### Opción A: Wizard para Principiantes (Recomendado)

1. **Abre la aplicación** en tu navegador
2. **Haz clic en "Mi Primer LoRA"** (botón morado arriba a la derecha)
3. **Sigue el wizard** paso a paso:
   - Crear sesión
   - Definir trigger word
   - Subir imágenes
   - Generar captions
   - Validar dataset
   - Planificar entrenamiento
   - Exportar configuración

### Opción B: Tour Interactivo

1. **Haz clic en "Tour"** (botón cyan arriba a la derecha)
2. **Explora cada sección** con explicaciones detalladas
3. **Aprende qué hace** cada herramienta

### Opción C: Manual (para usuarios avanzados)

Sigue el flujo:
```
Sesiones → Pipeline → Captions → Validar → Planificar → Exportar
```

---

## 📝 Paso 4: Generar y Validar Captions

### ¿Qué son los captions?

Son **descripciones textuales** de cada imagen. Le dicen a la IA qué hay en la imagen.

**Ejemplo:**
```
mystyle, retrato de mujer joven, cabello largo castaño, 
sonrisa suave, iluminación natural, fondo difuso, 
estilo artístico personal, colores cálidos
```

### Proceso automático:

1. Ve a la pestaña **"Pipeline"**
2. Selecciona tus imágenes (drag & drop o directorio)
3. Elige el método:
   - **Florence-2** (local, más preciso)
   - **Ollama** (API, más rápido)
4. Haz clic en **"Ejecutar Pipeline"**
5. Espera a que termine (1-5 minutos)

### Validación manual:

1. Ve a la pestaña **"Captions"**
2. Revisa cada caption generado
3. Edita los que necesiten corrección
4. Valida los que estén bien (click en el check)
5. Usa **"Operaciones en Lote"** para validar todos a la vez

### 💡 Consejos para buenos captions:

- ✅ Siempre incluye el trigger word al inicio
- ✅ Sé específico y descriptivo
- ✅ Incluye detalles sobre iluminación, estilo, composición
- ✅ Mantén longitud entre 80-200 caracteres
- ✅ Usa comas para separar conceptos

---

## 🔍 Paso 5: Verificar Calidad

### Usa el Quality Checker:

1. Ve a la pestaña **"Calidad"**
2. Revisa tu **score de calidad** (0-100)
3. Objetivo: **80+ puntos**

### Checklist de calidad:

- ✅ Mínimo 15 imágenes
- ✅ Todos los captions validados
- ✅ Trigger word en todos los captions (≥95%)
- ✅ Longitud promedio 80-200 caracteres
- ✅ Sin errores críticos
- ✅ Score ≥ 80

### Usa el Recomendador Inteligente:

1. Ve a la pestaña **"Recomendador"**
2. Revisa las sugerencias automáticas
3. Corrige los problemas críticos primero

---

## 🧮 Paso 6: Planificar Entrenamiento

### Ve a la pestaña "Planner":

**Configuración recomendada para empezar:**

| Parámetro | Valor | Explicación |
|-----------|-------|-------------|
| **Resolución** | 1024px | Para SDXL |
| **Epochs** | 10 | Pasadas por el dataset |
| **Repeats** | 5 | Repeticiones por epoch |
| **Batch Size** | 1 | Imágenes a la vez (ajusta según VRAM) |
| **Learning Rate** | 1e-4 | Velocidad de aprendizaje |

### Cálculos automáticos:

La herramienta calcula:
- **Pasos totales** = (imágenes × repeats × epochs) / batch_size
- **VRAM estimada** según resolución y batch size
- **Tiempo estimado** de entrenamiento

### 💡 Ajustes según tu GPU:

**8GB VRAM:**
- Batch Size: 1
- Resolución: 768px o 1024px

**12GB VRAM:**
- Batch Size: 2-4
- Resolución: 1024px

**24GB VRAM:**
- Batch Size: 4-8
- Resolución: 1024px

---

## 💾 Paso 7: Exportar Configuración

### Ve a la pestaña "Exportar":

1. Revisa la configuración
2. Ajusta si es necesario
3. Haz clic en **"Descargar config.yaml"**
4. También puedes descargar **"train.sh"** (script de entrenamiento)

### Archivos generados:

- **config.yaml** - Configuración completa para Kohya_ss
- **train.sh** - Script bash para entrenar (opcional)

---

## 🎓 Paso 8: Entrenar con Kohya_ss

### Instala Kohya_ss:

```bash
# Clonar repositorio
git clone https://github.com/bmaltais/kohya_ss.git
cd kohya_ss

# Instalar dependencias
pip install -r requirements.txt

# Iniciar interfaz web
python kohya_gui.py
```

### Carga tu configuración:

1. Abre Kohya_ss en tu navegador
2. Ve a la sección **"LoRA"**
3. Carga el archivo **config.yaml** que exportaste
4. Verifica que todo esté correcto
5. Haz clic en **"Start Training"**

### Tiempo de entrenamiento:

- **RTX 3060:** 10-30 minutos
- **RTX 4090:** 5-15 minutos
- **RTX 2060:** 30-60 minutos

### Durante el entrenamiento:

- ✅ No cierres la ventana de Kohya_ss
- ✅ Monitorea el progreso
- ✅ Revisa los logs si hay errores

---

## 🎉 Paso 9: Usar tu LoRA

### Archivos generados:

Después de entrenar, Kohya_ss genera:
- **tu_lora.safetensors** - Tu modelo LoRA entrenado

### Instalar tu LoRA:

**Para Stable Diffusion WebUI (A1111):**
```
1. Copia tu_lora.safetensors a:
   stable-diffusion-webui/models/Lora/

2. Reinicia la WebUI

3. En el prompt, usa:
   <lora:tu_lora:1> tu_trigger_word, descripción...
```

**Ejemplo de prompt:**
```
<lora:mystyle:1> mystyle, retrato de mujer, cabello largo, 
sonrisa suave, iluminación natural, fondo difuso
```

### Parámetros del LoRA:

- **Peso:** 0.5-1.0 (empieza con 1.0)
- **Steps:** 20-30 (igual que el modelo base)
- **CFG Scale:** 7-9

---

## 🔧 Solución de Problemas

### Problema: Mi LoRA genera imágenes muy similares a las de entrenamiento

**Causa:** Overfitting (memorizó demasiado)

**Soluciones:**
1. Agrega más variedad a tu dataset
2. Reduce los epochs (de 10 a 5)
3. Agrega class images para regularización
4. Reduce el Network Dim (de 32 a 16)

### Problema: Mi LoRA no se parece a lo que entrené

**Causas posibles:**
1. No estás usando el trigger word en el prompt
2. El trigger word está mal escrito
3. No cargaste el archivo .safetensors
4. El LoRA no se entrenó suficiente

**Soluciones:**
1. Verifica que usas el trigger word correcto
2. Aumenta los epochs o pasos
3. Mejora la calidad de tu dataset

### Problema: Error de VRAM durante entrenamiento

**Causa:** No tienes suficiente memoria en tu GPU

**Soluciones:**
1. Reduce el Batch Size (de 4 a 2 o 1)
2. Reduce la resolución (de 1024 a 768)
3. Cierra otros programas que usen GPU

---

## 📚 Recursos Adicionales

### Documentación:
- **Centro de Ayuda** - Pestaña "Ayuda" en la aplicación
- **Tour Interactivo** - Botón "Tour" en el header
- **Glosario** - Todos los términos explicados

### Comunidad:
- **CivitAI** - [civitai.com](https://civitai.com) - Modelos y LoRAs
- **Reddit** - r/StableDiffusion
- **Discord** - Servidores de Stable Diffusion

### Videos:
- Busca en YouTube: "LoRA training tutorial"
- Busca: "Kohya_ss guide"
- Busca: "Stable Diffusion LoRA"

---

## ✅ Checklist Final

Antes de entrenar, verifica:

- [ ] Tengo 15-50 imágenes de calidad
- [ ] Elegí un trigger word único
- [ ] Generé captions para todas las imágenes
- [ ] Validé al menos el 80% de los captions
- [ ] Trigger word está en todos los captions
- [ ] Score de calidad ≥ 80
- [ ] Planifiqué el entrenamiento (pasos, epochs, etc.)
- [ ] Exporté la configuración (config.yaml)
- [ ] Tengo Kohya_ss instalado y funcionando
- [ ] Tengo suficiente VRAM (8GB mínimo)

---

## 🎯 Próximos Pasos

### Después de tu primer LoRA:

1. **Experimenta** con diferentes configuraciones
2. **Prueba** con diferentes tipos de conceptos
3. **Combina** múltiples LoRAs
4. **Comparte** tus resultados en CivitAI
5. **Aprende** de la comunidad

### Conceptos avanzados:

- **Class Images** - Para regularización
- **Network Dim/Alpha** - Ajustar tamaño del LoRA
- **Learning Rate Schedulers** - Optimizar entrenamiento
- **Multiple LoRAs** - Combinar conceptos

---

## 💬 ¿Necesitas ayuda?

### Dentro de la aplicación:
- **Botón "Mi Primer LoRA"** - Wizard guiado
- **Botón "Tour"** - Tour interactivo
- **Pestaña "Ayuda"** - Centro de ayuda completo
- **Pestaña "Recomendador"** - Sugerencias automáticas

### Recursos externos:
- **README.md** - Documentación completa
- **GitHub Issues** - Reportar problemas
- **Comunidad** - Preguntar en Reddit/Discord

---

## 🎉 ¡Felicidades!

Ahora sabes todo lo necesario para crear tu primer LoRA. 

**Recuerda:**
- 🎨 La práctica hace al maestro
- 🔄 Experimenta y aprende de los errores
- 📚 La comunidad es tu amiga
- 🚀 ¡Diviértete creando!

---

**¿Listo para empezar?** 

Abre la aplicación y haz clic en **"Mi Primer LoRA"** 🎓
