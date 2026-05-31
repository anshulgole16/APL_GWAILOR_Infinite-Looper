import React from 'react';

export default function UnifiedActionBridge({ text, setPage, setSelectedScenario }) {
  const lower = text.toLowerCase();
  const showStadium = lower.includes("spin") || lower.includes("yorker") || lower.includes("outswing") || lower.includes("fast bowling") || lower.includes("delivery") || lower.includes("bowl");
  const showPosture = lower.includes("stance") || lower.includes("posture") || lower.includes("elbow") || lower.includes("shoulder") || lower.includes("feet") || lower.includes("backlift") || lower.includes("footwork") || lower.includes("hips") || lower.includes("balance");
  const showTactics = lower.includes("strategy") || lower.includes("tactic") || lower.includes("contingency") || lower.includes("game plan") || lower.includes("death over");

  if (!showStadium && !showPosture && !showTactics) return null;

  const handleStadiumBypass = () => {
    let pitch = "Flat";
    let opponent = "Balanced Squad";
    if (lower.includes("spin")) {
      pitch = "Dry Spinning";
      opponent = "Spin Heavy";
    } else if (lower.includes("yorker") || lower.includes("outswing")) {
      pitch = "Bouncy Track";
      opponent = "Pace Attack";
    }
    setSelectedScenario({ pitch, opponent });
    setPage("strategy");
  };

  return (
    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-2 animate-fadeIn relative z-10">
      <p className="w-full text-[9px] text-amber-400 font-display font-black uppercase tracking-widest leading-none mb-1">🔗 Unified Action Bridge</p>
      {showStadium && (
        <button
          onClick={handleStadiumBypass}
          className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/35 border border-green-500/30 text-green-300 font-display font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg tracking-wider transition-all shadow-md active:scale-95"
        >
          🏟️ Practice Scenario
        </button>
      )}
      {showPosture && (
        <button
          onClick={() => setPage("scanner")}
          className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/30 text-blue-300 font-display font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg tracking-wider transition-all shadow-md active:scale-95"
        >
          🔍 Upload Stance
        </button>
      )}
      {showTactics && (
        <button
          onClick={() => setPage("strategy")}
          className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 text-amber-300 font-display font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg tracking-wider transition-all shadow-md active:scale-95"
        >
          🗺️ Tactics Board
        </button>
      )}
    </div>
  );
}
