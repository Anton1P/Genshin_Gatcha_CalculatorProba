import React from 'react';
import { Plus, Trash2, User, Sword } from 'lucide-react';
import { cn } from '../lib/utils';

export type GoalType = 'character' | 'weapon';

export interface Goal {
  id: string;
  type: GoalType;
  label: string;
}

interface PathBuilderProps {
  sequence: Goal[];
  setSequence: (seq: Goal[]) => void;
}

export function PathBuilder({ sequence, setSequence }: PathBuilderProps) {
  const addGoal = (type: GoalType) => {
    const currentCount = sequence.filter(g => g.type === type).length;
    
    // Max constraints
    if (type === 'character' && currentCount >= 7) return; // C6 (7 copies)
    if (type === 'weapon' && currentCount >= 5) return; // R5 (5 copies)

    const label = type === 'character' 
      ? `C${currentCount}` 
      : `R${currentCount + 1}`; // R1 is first copy

    setSequence([
      ...sequence,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        label,
      },
    ]);
  };

  const removeGoal = (index: number) => {
    const newSeq = [...sequence];
    newSeq.splice(index, 1);
    // Re-label subsequent items of same type? 
    // The prompt implies "Constructeur de Chemin Personnalisé" where user builds a sequence.
    // If I remove C0 from "C0, C1", the remaining one should probably become C0?
    // Or just let it be. The prompt says "Affiche la séquence (ex: 1. C0 -> 2. R1 -> 3. C1)".
    // Let's re-calculate labels for simplicity and correctness.
    
    const recalculatedSeq = newSeq.map((item) => item); // clone
    // Actually, simpler to just rebuild the whole sequence labels based on type counts
    // But wait, if I have C0, R1, C1 and I remove R1, I get C0, C1.
    // The labels should probably reflect the *cumulative* count in the sequence.
    // Let's just re-generate labels based on the new sequence order.
    
    const charCounts = 0;
    const weaponCounts = 0;
    
    // Actually, let's just use the add logic for now, and if they remove, we might need to re-label.
    // Let's implement a simple re-labeler.
    const finalSeq: Goal[] = [];
    let cCount = 0;
    let wCount = 0;
    
    for (const item of newSeq) {
      if (item.type === 'character') {
        finalSeq.push({ ...item, label: `C${cCount}` });
        cCount++;
      } else {
        finalSeq.push({ ...item, label: `R${wCount + 1}` });
        wCount++;
      }
    }
    
    setSequence(finalSeq);
  };

  const clearSequence = () => setSequence([]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-100">
          <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            #
          </div>
          <h2 className="text-lg font-semibold">Chemin Personnalisé</h2>
        </div>
        <button
          onClick={clearSequence}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-950/30 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          Tout effacer
        </button>
      </div>

      {/* Sequence List */}
      <div className="min-h-[100px] bg-slate-950/50 rounded-lg border border-slate-800/50 p-4 mb-6 flex flex-wrap gap-3 items-center">
        {sequence.length === 0 && (
          <div className="w-full text-center text-slate-600 text-sm italic">
            Aucun objectif défini. Ajoutez des personnages ou des armes.
          </div>
        )}
        
        {sequence.map((goal, index) => (
          <div
            key={goal.id}
            className={cn(
              "relative group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all animate-in fade-in zoom-in duration-200",
              goal.type === 'character'
                ? "bg-indigo-950/30 border-indigo-900 text-indigo-300"
                : "bg-fuchsia-950/30 border-fuchsia-900 text-fuchsia-300"
            )}
          >
            <span className="opacity-50 text-xs mr-1">{index + 1}.</span>
            {goal.type === 'character' ? <User className="w-3 h-3" /> : <Sword className="w-3 h-3" />}
            {goal.label}
            
            <button
              onClick={() => removeGoal(index)}
              className="ml-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => addGoal('character')}
          disabled={sequence.filter(g => g.type === 'character').length >= 7}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajouter Personnage (C)
        </button>
        <button
          onClick={() => addGoal('weapon')}
          disabled={sequence.filter(g => g.type === 'weapon').length >= 5}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajouter Arme Cible (R)
        </button>
      </div>
    </div>
  );
}
