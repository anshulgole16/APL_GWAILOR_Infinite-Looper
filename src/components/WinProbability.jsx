import React from 'react';

export default function WinProbability({ batting, bowling }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">🏆 Win Probability</p>
      <div className="flex rounded-xl overflow-hidden h-6 text-[10px] font-black border border-white/5 glow-gold">
        <div
          className="flex items-center justify-center transition-all duration-1000 bg-gradient-to-r from-amber-500 to-amber-400 text-black px-1.5"
          style={{ width: `${batting}%` }}
        >
          YOURS: {batting}%
        </div>
        <div
          className="flex items-center justify-center transition-all duration-1000 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-1.5"
          style={{ width: `${bowling}%` }}
        >
          OPP: {bowling}%
        </div>
      </div>
      <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        <span className="text-amber-400">Your Squad</span>
        <span className="text-blue-400">Opponents</span>
      </div>
    </div>
  );
}
