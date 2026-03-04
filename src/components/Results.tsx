import React from 'react';
import { Goal } from './PathBuilder';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ResultsProps {
  sequence: Goal[];
  successRates: number[];
  isRunning: boolean;
  progress: number;
}

export function Results({ sequence, successRates, isRunning, progress }: ResultsProps) {
  if (sequence.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-100">Résultats de la Simulation</h2>
        {isRunning && (
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span className="animate-pulse">●</span>
            Calcul en cours... {Math.round(progress * 100)}%
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sequence.map((goal, index) => {
          const rate = successRates[index] || 0;
          const percentage = (rate * 100).toFixed(1);
          
          return (
            <div key={goal.id} className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className={cn(
                  "font-medium",
                  goal.type === 'character' ? "text-indigo-300" : "text-fuchsia-300"
                )}>
                  {index + 1}. {goal.label}
                </span>
                <span className="text-slate-100 font-mono">{percentage}%</span>
              </div>
              
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    goal.type === 'character' ? "bg-indigo-500" : "bg-fuchsia-500",
                    rate < 0.2 && "bg-red-500",
                    rate > 0.8 && "bg-emerald-500"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
