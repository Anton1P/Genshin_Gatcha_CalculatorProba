import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { PathBuilder, Goal } from './components/PathBuilder';
import { Results } from './components/Results';
import { runSimulationBatch, SimulationConfig } from './lib/gacha';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  // --- Configuration State ---
  const [initialWishes, setInitialWishes] = useState(100);
  const [charPity, setCharPity] = useState(0);
  const [weaponPity, setWeaponPity] = useState(0);
  const [isCharGuaranteed, setIsCharGuaranteed] = useState(false);
  const [crCounter, setCrCounter] = useState(0);
  
  // --- Sequence State ---
  const [sequence, setSequence] = useState<Goal[]>([]);

  // --- Simulation State ---
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successRates, setSuccessRates] = useState<number[]>([]);
  
  // --- Refs for Simulation Loop ---
  const simulationRef = useRef<{
    completedIterations: number;
    totalStepCounts: number[];
    animationFrameId: number | null;
  }>({
    completedIterations: 0,
    totalStepCounts: [],
    animationFrameId: null,
  });

  // --- Derived State ---
  const effectiveWishes = Math.floor(initialWishes / (1 - 0.09));

  // --- Simulation Logic ---
  const startSimulation = useCallback(() => {
    if (sequence.length === 0) return;
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setSuccessRates(new Array(sequence.length).fill(0));

    // Reset simulation ref
    simulationRef.current = {
      completedIterations: 0,
      totalStepCounts: new Array(sequence.length).fill(0),
      animationFrameId: null,
    };

    const TOTAL_ITERATIONS = 10000;
    const BATCH_SIZE = 500;

    const processBatch = () => {
      const { completedIterations, totalStepCounts } = simulationRef.current;

      if (completedIterations >= TOTAL_ITERATIONS) {
        setIsRunning(false);
        return;
      }

      // Run a batch
      const iterationsToRun = Math.min(BATCH_SIZE, TOTAL_ITERATIONS - completedIterations);
      const config: SimulationConfig = {
        initialWishes: effectiveWishes,
        initialCharPity: charPity,
        initialWeaponPity: weaponPity,
        isCharGuaranteed: isCharGuaranteed,
        crCounter: crCounter,
        sequence: sequence,
      };

      const batchResult = runSimulationBatch(config, iterationsToRun);

      // Accumulate results
      for (let i = 0; i < sequence.length; i++) {
        totalStepCounts[i] += batchResult.stepCounts[i];
      }

      const newCompleted = completedIterations + iterationsToRun;
      simulationRef.current.completedIterations = newCompleted;
      
      // Update progress UI
      setProgress(newCompleted / TOTAL_ITERATIONS);
      
      // Update intermediate results for visual feedback (optional, maybe every few batches)
      const currentRates = totalStepCounts.map(count => count / newCompleted);
      setSuccessRates(currentRates);

      // Schedule next batch
      if (newCompleted < TOTAL_ITERATIONS) {
        simulationRef.current.animationFrameId = requestAnimationFrame(processBatch);
      } else {
        setIsRunning(false);
        // Final update to ensure 100% accuracy
        const finalRates = totalStepCounts.map(count => count / TOTAL_ITERATIONS);
        setSuccessRates(finalRates);
      }
    };

    simulationRef.current.animationFrameId = requestAnimationFrame(processBatch);
  }, [sequence, effectiveWishes, charPity, weaponPity, isCharGuaranteed, crCounter, isRunning]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current.animationFrameId) {
      cancelAnimationFrame(simulationRef.current.animationFrameId);
    }
    setIsRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current.animationFrameId) {
        cancelAnimationFrame(simulationRef.current.animationFrameId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            Genshin Impact Gacha Simulator
          </h1>
          <p className="text-slate-500">
            Simulateur Monte-Carlo haute performance (10k itérations)
          </p>
        </header>

        <div className="grid gap-6">
          <ConfigPanel
            initialWishes={initialWishes}
            setInitialWishes={setInitialWishes}
            charPity={charPity}
            setCharPity={setCharPity}
            weaponPity={weaponPity}
            setWeaponPity={setWeaponPity}
            isCharGuaranteed={isCharGuaranteed}
            setIsCharGuaranteed={setIsCharGuaranteed}
            crCounter={crCounter}
            setCrCounter={setCrCounter}
            effectiveWishes={effectiveWishes}
          />

          <PathBuilder
            sequence={sequence}
            setSequence={(newSeq) => {
              setSequence(newSeq);
              setSuccessRates([]); // Reset results on change
              setProgress(0);
            }}
          />

          {/* Simulation Controls */}
          <div className="flex justify-center">
            {!isRunning ? (
              <button
                onClick={startSimulation}
                disabled={sequence.length === 0}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                Lancer la Simulation
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-slate-200 transition-all duration-200 bg-slate-800 rounded-full hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                Arrêter
              </button>
            )}
          </div>

          <Results
            sequence={sequence}
            successRates={successRates}
            isRunning={isRunning}
            progress={progress}
          />
        </div>
        
        <footer className="mt-12 text-center text-xs text-slate-600">
          <p>Basé sur les règles de probabilité de la version 5.0+ (Capturing Radiance, Fate Points).</p>
          <p>Ce simulateur est une estimation statistique et ne garantit pas les résultats en jeu.</p>
        </footer>
      </div>
    </div>
  );
}
