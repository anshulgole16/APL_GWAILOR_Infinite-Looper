import React, { useState, useEffect } from 'react';

const TICKER_ITEMS = [
  "🏏 IND vs AUS — IND 192/4 (35.4 ov) | Kohli 84*(71) | Starc 2/45",
  "🔥 MATCH DAY — IPL Playoffs Tonight 7:30 PM under Stadium Lights!",
  "⚡ RCB vs MI — Super Over Thriller! MI need 12 runs off 6 balls",
  "📊 Pitch Update: Seaming green surface with high initial bounce",
  "🎯 Jasprit Bumrah — Special Coaching: Yorker Accuracy reaches 98%",
  "🏆 T20 Cup Final — IND need 18 off the last over against spin bowler",
];

export default function Ticker() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % TICKER_ITEMS.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-950/70 via-red-900/40 to-red-950/70 border-b border-red-500/30 px-4 py-2 flex items-center gap-3 overflow-hidden">
      <span className="text-red-400 text-[10px] font-black tracking-widest flex-shrink-0 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40 animate-pulse">LIVE UPDATES</span>
      <span
        className="text-xs text-red-100 font-medium truncate transition-opacity duration-300 flex-1"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {TICKER_ITEMS[idx]}
      </span>
    </div>
  );
}
