import React from 'react';

export default function AggressionMeter({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct > 75 ? "#ef4444" : pct > 45 ? "#fbbf24" : "#22c55e";
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">⚡ Aggression Meter</span>
        <span className="text-xs font-black font-display" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[2px]">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22c55e 0%, #fbbf24 60%, #ef4444 100%)` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        <span className="text-green-500">Defensive</span>
        <span className="text-amber-500">Balanced</span>
        <span className="text-red-500">Attack</span>
      </div>
    </div>
  );
}
