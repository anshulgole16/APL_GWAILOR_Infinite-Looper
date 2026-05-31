import React, { useState } from 'react';

export default function FieldPlacement({ strategy, role }) {
  const [selectedFielder, setSelectedFielder] = useState(null);

  const positions = strategy === "aggressive"
    ? [
        { x: 50, y: 15, label: "Long On", role: "Boundary cover to stop straight lofts and boundary strikes." },
        { x: 80, y: 18, label: "Long Off", role: "Boundary protector covering wide off-drive regions." },
        { x: 22, y: 22, label: "Deep Mid-W", role: "Deep cover for slog sweeps and leg-side hooks." },
        { x: 90, y: 48, label: "Deep Point", role: "Deep off-side boundary rider catching sliced cuts." },
        { x: 12, y: 48, label: "Fine Leg", role: "Stump line boundary protection preventing sweeps." },
        { x: 68, y: 70, label: "Mid-off", role: "Attacking extra cover position preventing fast singles." },
        { x: 32, y: 70, label: "Mid-on", role: "Inner ring fielder stopping drive pushes." },
        { x: 50, y: 82, label: "Bowler", role: "Tactical speed/spin deliverer under direct plan." },
      ]
    : [
        { x: 65, y: 35, label: "Slip", role: "Ultra close-in catch position for defensive edges off spin/pace." },
        { x: 74, y: 40, label: "Gully", role: "Intercepts fast squarish drives and cut edges." },
        { x: 86, y: 55, label: "Point", role: "Key inner ring cover stopping quick off-side pushes." },
        { x: 14, y: 55, label: "Sq Leg", role: "Inner ring leg side protection capturing mistimed sweeps." },
        { x: 68, y: 70, label: "Mid-off", role: "Standard drive protection on off-side." },
        { x: 32, y: 70, label: "Mid-on", role: "Standard drive protection on leg-side." },
        { x: 50, y: 18, label: "Deep Cover", role: "Outfield sweeping boundary rider stopping square cuts." },
        { x: 50, y: 82, label: "Bowler", role: "Tactical deliverer targeting defensive dot-ball angles." },
      ];

  return (
    <div className="bg-gradient-to-b from-emerald-950/40 to-green-950/60 border border-green-500/20 rounded-3xl p-4 glow-green">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs text-green-400 font-display font-black tracking-widest uppercase">🏟️ Dynamic Field Map</p>
        <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-bold uppercase">{strategy} Setup</span>
      </div>

      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full max-h-56 mx-auto cursor-pointer drop-shadow-2xl">
          {/* Grass stadium texture background */}
          <ellipse cx="50" cy="50" rx="48" ry="48" fill="#14532d" opacity="0.3" stroke="#22c55e" strokeWidth="1" />
          
          {/* Boundary ring */}
          <ellipse cx="50" cy="50" rx="46" ry="46" fill="none" stroke="#22c55e" strokeWidth="0.75" />
          
          {/* 30-Yard inner circle */}
          <ellipse cx="50" cy="50" rx="26" ry="26" fill="none" stroke="#4ade80" strokeWidth="0.75" strokeDasharray="3,3" />
          
          {/* Pitch */}
          <rect x="45" y="38" width="10" height="24" rx="1" fill="#a16207" opacity="0.8" stroke="#78350f" strokeWidth="0.5" />
          <rect x="46.5" y="40" width="7" height="20" rx="0.5" fill="#854d0e" opacity="0.6" />
          
          {/* Stumps */}
          <line x1="47.5" y1="38" x2="52.5" y2="38" stroke="#fbbf24" strokeWidth="1.5" />
          <line x1="47.5" y1="62" x2="52.5" y2="62" stroke="#fbbf24" strokeWidth="1.5" />
          
          {/* Fielder dots */}
          {positions.map((p, i) => (
            <g key={i} onClick={(e) => { e.stopPropagation(); setSelectedFielder(p); }} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r={selectedFielder?.label === p.label ? 3.5 : 2.5}
                fill={p.label === "Bowler" ? "#ef4444" : p.x < 30 || p.x > 70 || p.y < 30 ? "#fbbf24" : "#3b82f6"}
                className="transition-all duration-300 hover:scale-150"
                stroke="#ffffff"
                strokeWidth="0.5"
              />
              <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="3.5" fill="#ffffff" fontWeight="bold" opacity="0.9">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Interactive Fielder Helper */}
        {selectedFielder ? (
          <div className="absolute bottom-2 left-2 right-2 bg-black/90 border border-green-500/40 rounded-xl p-2.5 text-xs animate-fadeIn backdrop-blur-md">
            <div className="flex justify-between items-center font-bold text-amber-400 mb-0.5">
              <span>📍 Position: {selectedFielder.label}</span>
              <button onClick={() => setSelectedFielder(null)} className="text-gray-400 hover:text-white text-sm font-bold">×</button>
            </div>
            <p className="text-gray-300 leading-tight">{selectedFielder.role}</p>
          </div>
        ) : (
          <p className="text-[10px] text-green-400/70 text-center mt-2 animate-pulse">👉 Tap on any fielder dot to view tactical role placement details!</p>
        )}
      </div>

      <div className="flex gap-4 mt-3 justify-center text-[10px]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white/20 inline-block" />Outfield boundary riders</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white/20 inline-block" />Inner circle ring savers</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white/20 inline-block" />Bowler</span>
      </div>
    </div>
  );
}
