import React from 'react';
import { Settings, Coins, Sparkles, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfigPanelProps {
  initialWishes: number;
  setInitialWishes: (v: number) => void;
  charPity: number;
  setCharPity: (v: number) => void;
  weaponPity: number;
  setWeaponPity: (v: number) => void;
  isCharGuaranteed: boolean;
  setIsCharGuaranteed: (v: boolean) => void;
  effectiveWishes: number;
}

export function ConfigPanel({
  initialWishes,
  setInitialWishes,
  charPity,
  setCharPity,
  weaponPity,
  setWeaponPity,
  isCharGuaranteed,
  setIsCharGuaranteed,
  effectiveWishes,
}: ConfigPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6 text-slate-100">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wishes Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Vœux initiaux disponibles
          </label>
          <input
            type="number"
            min="0"
            value={initialWishes}
            onChange={(e) => setInitialWishes(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
          <div className="text-xs text-slate-500 mt-1">
            Total effectif (avec astéries): <span className="text-indigo-400 font-mono font-bold">{effectiveWishes}</span>
          </div>
        </div>

        {/* Character Pity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Pity Personnage (0-89)
          </label>
          <input
            type="number"
            min="0"
            max="89"
            value={charPity}
            onChange={(e) => setCharPity(Math.min(89, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Weapon Pity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Pity Arme (0-79)
          </label>
          <input
            type="number"
            min="0"
            max="79"
            value={weaponPity}
            onChange={(e) => setWeaponPity(Math.min(79, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Guaranteed Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            {isCharGuaranteed ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
            Statut Personnage 5★
          </label>
          <button
            onClick={() => setIsCharGuaranteed(!isCharGuaranteed)}
            className={cn(
              "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all border",
              isCharGuaranteed
                ? "bg-emerald-950/30 border-emerald-900 text-emerald-400 hover:bg-emerald-950/50"
                : "bg-amber-950/30 border-amber-900 text-amber-400 hover:bg-amber-950/50"
            )}
          >
            {isCharGuaranteed ? "100% Garanti" : "En 50/50 (55% Win)"}
          </button>
        </div>
      </div>
    </div>
  );
}
