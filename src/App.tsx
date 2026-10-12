/**
 * App.tsx - Entry point principal
 * 
 * Renderiza el LoRA Dataset Pipeline Pro como aplicación principal.
 * En un sistema completo, esto estaría integrado con React Router
 * y el Módulo 3 (Generador) como rutas separadas.
 */

import LoraTrainer from './pages/LoraTrainer';

function App() {
  // Props de integración con Módulo 3 (Generador)
  // En producción, estos vendrían de React Router o estado global
  const handleDatasetReady = (triggerWord: string) => {
    // En un sistema real, navegaría de vuelta al Generador
    // con el trigger word configurado
    console.log('Dataset listo. Trigger word:', triggerWord);
    alert(`✅ Dataset listo!\nTrigger word configurado: "${triggerWord}"\n\nEn un sistema completo, esto volvería al Generador.`);
  };

  return (
    <LoraTrainer
      onDatasetReady={handleDatasetReady}
    />
  );
}

export default App;
