import React, { useState } from 'react';

export default function RadarChart({ data }) {
  const [selectedKey, setSelectedKey] = useState(null);
  
  const cx = 50, cy = 50, r = 32;
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const n = keys.length;

  const getPoint = (i, val) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];
  const polyPoints = vals.map((v, i) => {
    const p = getPoint(i, v);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <div className="space-y-3 flex flex-col items-center">
      <div className="relative w-full flex justify-center">
        <svg viewBox="0 0 100 100" className="w-full max-h-40 filter drop-shadow-2xl">
          {/* Custom SVG filter for glowing amber edges */}
          <defs>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Radial Grid lines */}
          {gridLevels.map(lv => (
            <polygon
              key={lv}
              points={keys.map((_, i) => {
                const p = getPoint(i, lv);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="none"
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Main Axis line dividers */}
          {keys.map((_, i) => {
            const p = getPoint(i, 100);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="0.5"
              />
            );
          })}
          
          {/* Data Poly Shape with premium amber glow */}
          <polygon
            points={polyPoints}
            fill="rgba(245, 158, 11, 0.15)"
            stroke="#f59e0b"
            strokeWidth="1.2"
            filter="url(#glow-amber)"
            className="transition-all duration-700 ease-in-out"
          />
          
          {/* Tiny Dots on corners with click triggers */}
          {vals.map((v, i) => {
            const p = getPoint(i, v);
            const isSelected = selectedKey === keys[i];
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={isSelected ? "3.2" : "2.2"}
                fill={isSelected ? "#f59e0b" : "#b45309"}
                stroke="#ffffff"
                strokeWidth="0.5"
                className="transition-all duration-300 cursor-pointer hover:scale-150"
                onClick={() => setSelectedKey(isSelected ? null : keys[i])}
              />
            );
          })}
          
          {/* Axis Labels (Interactive) */}
          {keys.map((k, i) => {
            const p = getPoint(i, 118);
            const isSelected = selectedKey === k;
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                fontSize="5"
                fontWeight={isSelected ? "900" : "700"}
                fill={isSelected ? "#f59e0b" : "#9ca3af"}
                dominantBaseline="middle"
                className="font-display uppercase tracking-wider cursor-pointer hover:fill-white transition-all"
                onClick={() => setSelectedKey(isSelected ? null : k)}
              >
                {k}
              </text>
            );
          })}
        </svg>

        {/* Dynamic Tooltip inside Radar Chart card */}
        {selectedKey && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 border border-amber-500/40 rounded-xl p-2 px-3 text-[10px] text-center backdrop-blur-md animate-fadeIn shadow-2xl z-10">
            <p className="text-[8px] uppercase font-black text-amber-400 leading-none mb-0.5">Rating Focus</p>
            <p className="font-bold text-white uppercase">{selectedKey}</p>
            <p className="text-xs font-black text-amber-400 mt-1">{data[selectedKey]}%</p>
          </div>
        )}
      </div>

      {/* Axis Highlights below chart */}
      <div className="w-full flex justify-between text-[9px] text-gray-500 border-t border-white/5 pt-2 px-1">
        <span>💪 Strongest: <strong className="text-green-400 uppercase font-black">Strategy ({data.Strategy}%)</strong></span>
        <span>⚠️ Weakest: <strong className="text-red-400 uppercase font-black">Bowling ({data.Bowling}%)</strong></span>
      </div>
    </div>
  );
}
