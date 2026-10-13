/**
 * App.tsx - Entry point principal
 * 
 * Renderiza el LoRA Dataset Pipeline Pro como módulo autocontenido.
 * Diseñado para integrarse dentro de un módulo principal con su propio sidebar.
 */

import LoraTrainer from './pages/LoraTrainer';

function App() {
  // Props de integración con el módulo principal
  // En un sistema real, estos vendrían de React Router o estado global
  const handleDatasetReady = (triggerWord: string) => {
    console.log('Dataset listo. Trigger word:', triggerWord);
    alert(`✅ Dataset listo!\nTrigger word configurado: "${triggerWord}"\n\nEn un sistema completo, esto volvería al módulo principal.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1600px] mx-auto">
        <LoraTrainer onDatasetReady={handleDatasetReady} />
      </div>
    </div>
  );
}

export default App;
