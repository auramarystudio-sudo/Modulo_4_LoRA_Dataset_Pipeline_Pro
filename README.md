# 🎨 LoRA Dataset Pipeline Pro

> **Herramienta profesional para preparación de datasets de entrenamiento LoRA**

Una aplicación web completa que te guía paso a paso en la creación de datasets para entrenar modelos LoRA (Low-Rank Adaptation) para Stable Diffusion.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Guía para Principiantes](#-guía-para-principiantes)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes](#-componentes)
- [Flujo de Trabajo](#-flujo-de-trabajo)
- [FAQ](#-faq)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Para Principiantes
- **🗺️ Tour Interactivo** - Guía paso a paso por toda la interfaz
- **📚 Centro de Ayuda** - Glosario completo con analogías simples
- **🧙 Wizard para Primer LoRA** - Asistente que te lleva de la mano

### 📊 Análisis y Calidad
- **Dashboard** - Métricas visuales del progreso
- **Detector de Duplicados** - Evita overfitting
- **Word Cloud Analyzer** - Visualiza patrones en captions
- **Quality Checker** - Score de calidad 0-100
- **Recomendador Inteligente** - Sugerencias automáticas

### ⚡ Productividad
- **Operaciones en Lote** - Edita múltiples captions a la vez
- **Atajos de Teclado** - Navegación rápida
- **Historial de Cambios** - Undo/Redo completo
- **Plantillas** - Captions predefinidos por categoría

### 🔧 Entrenamiento
- **Training Planner** - Calcula pasos, VRAM y tiempo
- **Class Image Generator** - Prompts para regularización
- **Trigger Manager** - Valida tu trigger word
- **Kohya Config Exporter** - Configuración lista para entrenar

### 💾 Gestión
- **Backup/Restore** - No pierdas tu trabajo
- **Reporte Final** - Resumen completo antes de entrenar
- **Drag & Drop** - Sube imágenes fácilmente
- **Directory Picker** - Explorador de archivos visual

---

## 🔧 Requisitos

### Sistema
- **Node.js** 18+ 
- **npm** o **yarn**
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)

### Para Entrenamiento Real
- **GPU NVIDIA** con 8GB+ VRAM (recomendado 12GB+)
- **Python 3.10+** (para el backend)
- **Kohya_ss** instalado
- **15-50 imágenes** de tu concepto

---

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/lora-dataset-pipeline-pro.git
cd lora-dataset-pipeline-pro

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 🚀 Uso

### Inicio Rápido

1. **Abre la aplicación** en tu navegador
2. **Haz clic en "Mi Primer LoRA"** (botón morado)
3. **Sigue el wizard** paso a paso
4. **Sube tus imágenes** (15-50 recomendadas)
5. **Genera captions** automáticamente
6. **Valida y ajusta** los captions
7. **Exporta la configuración** para Kohya_ss
8. **¡Entrena tu LoRA!**

### Flujo Completo

```
Crear Sesión → Subir Imágenes → Generar Captions → Validar → 
Planificar → Exportar → Entrenar con Kohya_ss
```

---

## 📖 Guía para Principiantes

### ¿Qué es un LoRA?

Un **LoRA** (Low-Rank Adaptation) es una técnica para entrenar modelos de IA de forma eficiente. En lugar de reentrenar todo el modelo (que es enorme), solo entrenas una pequeña parte.

**Analogía:** Es como agregar un módulo especializado a un robot existente en lugar de construir un robot nuevo desde cero.

### ¿Qué necesito para crear un LoRA?

1. **15-50 imágenes** de lo que quieres enseñar
2. **Una palabra única** (trigger word)
3. **Una tarjeta gráfica NVIDIA** con 8GB+ VRAM
4. **10-30 minutos** de tu tiempo

### Conceptos Clave

| Término | Explicación Simple |
|---------|-------------------|
| **Trigger Word** | La palabra mágica que activa tu LoRA |
| **Dataset** | El conjunto de imágenes que usas para entrenar |
| **Caption** | Descripción textual de cada imagen |
| **Epoch** | Una pasada completa por todo tu dataset |
| **Steps** | Cada actualización que hace la IA |
| **VRAM** | Memoria de tu tarjeta gráfica |

### Recursos Recomendados

- **Tour Interactivo** - Haz clic en "Tour" en el header
- **Centro de Ayuda** - Pestaña "Ayuda" con glosario completo
- **FAQ** - Preguntas frecuentes en el Centro de Ayuda

---

## 📁 Estructura del Proyecto

```
lora-dataset-pipeline-pro/
├── src/
│   ├── components/
│   │   └── lora-trainer/
│   │       ├── Dashboard.tsx              # Métricas visuales
│   │       ├── SessionHistory.tsx         # Gestión de sesiones
│   │       ├── DatasetPipeline.tsx        # Pipeline principal
│   │       ├── CaptionPreview.tsx         # Preview de captions
│   │       ├── CaptionTemplates.tsx       # Plantillas
│   │       ├── MetadataExtractor.tsx      # Extractor de metadata
│   │       ├── TrainingPlanner.tsx        # Planificador
│   │       ├── TriggerManager.tsx         # Validador de triggers
│   │       ├── KohyaConfigExporter.tsx    # Exportador de config
│   │       ├── DuplicateDetector.tsx      # Detector de duplicados
│   │       ├── ClassImageGenerator.tsx    # Generador de class images
│   │       ├── ChangeHistory.tsx          # Historial undo/redo
│   │       ├── BatchOperations.tsx        # Operaciones en lote
│   │       ├── WordCloudAnalyzer.tsx      # Análisis de palabras
│   │       ├── QualityChecker.tsx         # Control de calidad
│   │       ├── KeyboardShortcuts.tsx      # Atajos de teclado
│   │       ├── InteractiveTour.tsx        # Tour interactivo
│   │       ├── HelpCenter.tsx             # Centro de ayuda
│   │       ├── BeginnerWizard.tsx         # Wizard para novatos
│   │       ├── BackupRestore.tsx          # Backup/Restore
│   │       ├── FinalReport.tsx            # Reporte final
│   │       ├── SmartRecommender.tsx       # Recomendador inteligente
│   │       ├── DirectoryPicker.tsx        # Selector de directorios
│   │       └── ImageDropZone.tsx          # Zona drag & drop
│   ├── pages/
│   │   └── LoraTrainer.tsx                # Página principal
│   ├── store/
│   │   └── lora-trainer-store.ts          # Estado global (Zustand)
│   ├── types/
│   │   └── lora-trainer.ts                # Tipos TypeScript
│   ├── utils/
│   │   ├── python-runner.ts               # Ejecutor Python
│   │   └── dataset-validator.ts           # Validador de dataset
│   ├── data/
│   │   └── lora-defaults.ts               # Datos por defecto
│   ├── App.tsx                            # Componente raíz
│   ├── main.tsx                           # Entry point
│   └── index.css                          # Estilos globales
├── backend/
│   ├── lora-dataset-prep.py               # Script CLI principal
│   ├── caption_engine.py                  # Motor de captioning
│   └── metadata_extractor.py              # Extractor de metadata
├── public/                                # Archivos estáticos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧩 Componentes

### Principales (18 componentes)

| Componente | Función |
|------------|---------|
| **Dashboard** | Vista general con métricas y gráficos |
| **DatasetPipeline** | Ejecuta el pipeline Python con progreso en tiempo real |
| **CaptionPreview** | Galería editable de captions generados |
| **CaptionTemplates** | Plantillas predefinidas por categoría |
| **MetadataExtractor** | Visualiza metadata PNG Info |
| **TrainingPlanner** | Calcula buckets, pasos y VRAM |
| **TriggerManager** | Valida trigger words con 50+ comunes |
| **KohyaConfigExporter** | Genera config.yaml para Kohya_ss |
| **DuplicateDetector** | Detecta imágenes/captions duplicados |
| **ClassImageGenerator** | Genera prompts para regularización |
| **ChangeHistory** | Historial con undo/redo |
| **BatchOperations** | Edita múltiples captions a la vez |
| **WordCloudAnalyzer** | Nube de palabras con análisis |
| **QualityChecker** | Score de calidad 0-100 |
| **KeyboardShortcuts** | 15 atajos de teclado |
| **InteractiveTour** | Tour guiado de 16 pasos |
| **HelpCenter** | Glosario + FAQ + recursos |
| **BeginnerWizard** | Asistente paso a paso |
| **BackupRestore** | Exportar/importar sesiones |
| **FinalReport** | Resumen completo antes de entrenar |
| **SmartRecommender** | Sugerencias automáticas |

---

## 🔄 Flujo de Trabajo

### Para Principiantes

1. **Haz clic en "Mi Primer LoRA"** → Wizard guiado
2. **Crea una sesión** → Nombre, trigger word, concepto
3. **Sube imágenes** → Drag & drop o selector de directorio
4. **Genera captions** → Pipeline automático
5. **Revisa y valida** → CaptionPreview + BatchOperations
6. **Verifica calidad** → QualityChecker + SmartRecommender
7. **Planifica entrenamiento** → TrainingPlanner
8. **Exporta configuración** → KohyaConfigExporter
9. **Entrena con Kohya_ss** → Usa los archivos exportados

### Para Usuarios Avanzados

1. **Dashboard** → Vista general rápida
2. **Operaciones en lote** → Ediciones masivas
3. **Detector de duplicados** → Limpieza de dataset
4. **Word Cloud** → Análisis de patrones
5. **Backup** → Protege tu trabajo
6. **Reporte final** → Checklist antes de entrenar

---

## ❓ FAQ

### ¿Cuántas imágenes necesito?
**15-50 imágenes** para un LoRA básico. Para conceptos simples, 15-20 pueden ser suficientes. Para personas o conceptos complejos, 30-50 es ideal.

### ¿Qué resolución deben tener las imágenes?
- **SD 1.5:** 512x512 píxeles
- **SDXL:** 1024x1024 píxeles
- **Flux:** 1024x1024 píxeles

### ¿Cuánto tiempo toma entrenar un LoRA?
- **RTX 3060:** 10-30 minutos
- **RTX 4090:** 5-15 minutos
- **RTX 2060:** 30-60 minutos

### ¿Qué tarjeta gráfica necesito?
**Mínimo:** NVIDIA con 8GB VRAM  
**Recomendado:** 12GB+ VRAM  
**Ideal:** RTX 4090 (24GB VRAM)

### ¿Puedo entrenar sin GPU?
Técnicamente sí, pero sería extremadamente lento (horas o días). No es práctico.

### ¿Por qué mi LoRA genera imágenes muy similares a las de entrenamiento?
Esto es **overfitting**. Soluciones:
1. Agrega más variedad a tu dataset
2. Reduce los epochs o pasos
3. Agrega class images para regularización
4. Reduce el Network Dim

### ¿Qué es el trigger word?
Es una **palabra única** que activa tu LoRA. Cuando la usas en un prompt, la IA sabe que debe aplicar lo que aprendió.

**Ejemplo:** Si entrenaste un LoRA de tu gato "Michi", el trigger podría ser "michigato". Al escribir "michigato jugando", la IA generará imágenes de TU gato.

---

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **TypeScript 5** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS 3** - Estilos
- **Zustand** - Estado global
- **Lucide React** - Iconos
- **Python 3.10+** - Backend (scripts)

---

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

- **Documentación:** Centro de Ayuda integrado
- **Tour:** Botón "Tour" en el header
- **FAQ:** Pestaña "Ayuda" → FAQ
- **Issues:** GitHub Issues

---

## 🎉 Agradecimientos

- **Kohya_ss** - Herramienta de entrenamiento
- **Stable Diffusion** - Modelo base
- **Comunidad CivitAI** - Recursos y ejemplos
- **Todos los contribuidores** de herramientas de IA

---

**¿Listo para crear tu primer LoRA?** 🚀

[Comenzar ahora](#-uso)
