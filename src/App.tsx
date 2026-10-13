/**
 * App.tsx - Entry point principal
 * 
 * Glassmorphism Dark Pro v3.0 - Estilo oficial aplicado
 */

import LoraTrainer from './pages/LoraTrainer';

function App() {
  const handleDatasetReady = (triggerWord: string) => {
    console.log('Dataset listo. Trigger word:', triggerWord);
    alert(`✅ Dataset listo!\nTrigger word configurado: "${triggerWord}"\n\nEn un sistema completo, esto volvería al módulo principal.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <LoraTrainer onDatasetReady={handleDatasetReady} />
    </div>
  );
}

export default App;
