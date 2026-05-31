import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import { speakText } from '../utils/voice';

export default function HomePage({ setPage, coachMode, setCoachMode }) {
  const [ambientSound, setAmbientSound] = useState(false);
  const [streak, setStreak] = useState(5);
  const ambientAudioRef = useRef(null);

  // Dynamic stadium ambient sound toggle
  useEffect(() => {
    if (ambientSound) {
      ambientAudioRef.current = new Audio('https://www.soundjay.com/misc/sounds/stadium-crowd-1.mp3');
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.15;
      ambientAudioRef.current.play().catch(e => console.log("Ambient sound blocked: ", e));
      speakText("Stadium atmosphere online. Prepare for elite training.", true);
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    }
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [ambientSound]);

  const roles = [
    { 
      id: "batter", 
      label: "Batter", 
      emoji: "🏏", 
      desc: "Timing sweeps & straight drive drills", 
      color: "from-amber-500/10 to-transparent border-amber-500/30",
      stats: { timing: "82%", spin: "Medium", shot: "Cover Drive" }
    },
    { 
      id: "bowler", 
      label: "Bowler", 
      emoji: "🎯", 
      desc: "Outswing, lines & death speed", 
      color: "from-blue-500/10 to-transparent border-blue-500/30",
      stats: { swing: "85%", yorker: "High", ball: "Inswing Yorker" }
    },
    { 
      id: "captain", 
      label: "Captain", 
      emoji: "👑", 
      desc: "Field maps, DRS & match calls", 
      color: "from-purple-500/10 to-transparent border-purple-500/30",
      stats: { tactics: "90%", decision: "Fast", role: "DRS Analyst" }
    },
    { 
      id: "keeper", 
      label: "Wicketkeeper", 
      emoji: "🧤", 
      desc: "Reflex speed, catches & spin takes", 
      color: "from-green-500/10 to-transparent border-green-500/30",
      stats: { reflex: "92%", catchRate: "88%", gloves: "Gloves Legend" }
    },
  ];

  const features = [
    { page: "coach", emoji: "🤖", label: "AI Coach", desc: "Interactive customized drills & tips", status: "3 drills pending" },
    { page: "strategy", emoji: "📊", label: "Match Strategy", desc: "Dynamic field plans & heatmaps", status: "Dominance active" },
    { page: "commentary", emoji: "🎙️", label: "AI Live Mic", desc: "Legendary voice playout commentary", status: "Last active: 2m ago" },
    { page: "scanner", emoji: "📸", label: "Stance Vision", desc: "Upload swing or scorecard shots", status: "2 scans logged" },
  ];

  return (
    <div className="overflow-y-auto h-full animate-fadeIn bg-black text-white">
      <div className="px-4 pt-4 pb-36 space-y-4">
        
        {/* 1. Hero Section Premium Redesign */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b0c0b] border border-white/10 p-5 shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 90% 10%, #f59e0b 0%, transparent 60%)" }} />
          
          <div className="relative z-10 flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
                  🔥 {streak} Day Streak
                </span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                <span className="text-[8px] text-gray-500 font-bold uppercase">AI Coach Online</span>
              </div>
              <h1 className="text-xl font-display font-black text-white tracking-tight">Hello, {localStorage.getItem("CRICMIND_PLAYER_NAME") || "Anshul"}</h1>
              <p className="text-[10px] text-amber-400 font-bold">
                📈 Spin weakness improved by <strong className="text-green-400 font-black">+11%</strong> this week
              </p>
              <p className="text-gray-400 text-[10px] pt-1.5 leading-normal max-w-[220px]">
                "Describe your batting problem. AI Coach will analyze technique, mindset & drills."
              </p>
            </div>
            
            {/* Interactive blinking AI Assistant avatar */}
            <div 
              onClick={() => { setAmbientSound(!ambientSound); }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              title="Toggle Stadium Ambience Sound"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-lg relative group-hover:scale-105 transition-all">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping delay-500" />
                🤖
              </div>
              <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${
                ambientSound 
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse" 
                  : "bg-white/5 text-gray-500 border-white/5"
              }`}>
                {ambientSound ? "🔊 Stadium ON" : "🔇 Ambient"}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-white/5">
            <button 
              onClick={() => setPage("coach")} 
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-display font-black text-[10px] py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icon name="bot" className="w-3.5 h-3.5" /> Start AI Session
            </button>
            <button 
              onClick={() => setPage("scanner")} 
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-display font-black text-[10px] py-2.5 rounded-xl transition-all border border-white/10 uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icon name="camera" className="w-3.5 h-3.5 text-gray-400" /> Scan My Batting
            </button>
          </div>
        </div>

        {/* 2. Live Match Intelligence Strip */}
        <div className="bg-[#0c0d0c]/40 border border-white/5 rounded-2xl p-2 px-3 flex items-center gap-2 overflow-hidden">
          <span className="text-red-400 text-[8px] font-black tracking-widest flex-shrink-0 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse">AI ALERT</span>
          <span className="text-[10px] text-gray-300 font-bold truncate flex-1 animate-fadeIn">
            ⚠️ Bumrah yorker success rate: <strong className="text-red-400">78%</strong> | Predicted Match Win IND: <strong className="text-amber-400">64%</strong>
          </span>
        </div>

        {/* 3. Quick Actions Row */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setPage("coach")}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-2xl py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-base mb-1">🎙️</span>
            <span className="text-[8px] font-bold text-gray-300 uppercase leading-none">Voice Coach</span>
          </button>
          <button
            onClick={() => setPage("scanner")}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-2xl py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-base mb-1">📸</span>
            <span className="text-[8px] font-bold text-gray-300 uppercase leading-none">Upload Shot</span>
          </button>
          <button
            onClick={() => {
              setPage("coach");
              // Go to pressure tab
              speakText("Loading Bumrah Pressure simulator scenario.", true);
            }}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-2xl py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-base mb-1">🧠</span>
            <span className="text-[8px] font-bold text-gray-300 uppercase leading-none">Pressure Test</span>
          </button>
          <button
            onClick={() => setPage("strategy")}
            className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-2xl py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-base mb-1">📊</span>
            <span className="text-[8px] font-bold text-gray-300 uppercase leading-none">Match IQ</span>
          </button>
        </div>

        {/* 4. Continue Session Carousel */}
        <div className="space-y-2">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">⏱️ Resume Active Session</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setPage("coach")}
              className="bg-gradient-to-r from-amber-500/10 to-transparent border border-white/10 rounded-2xl p-3 text-left transition-all hover:scale-[1.02] cursor-pointer flex-shrink-0 w-36"
            >
              <div className="text-[8px] text-amber-400 font-black uppercase mb-1">🌀 Spin Survival</div>
              <p className="text-[10px] font-bold text-white leading-normal truncate">Preserve off-side sweep</p>
              <span className="text-[7px] text-gray-500 uppercase font-black block mt-2">Active now ›</span>
            </button>
            <button
              onClick={() => setPage("strategy")}
              className="bg-gradient-to-r from-blue-500/10 to-transparent border border-white/10 rounded-2xl p-3 text-left transition-all hover:scale-[1.02] cursor-pointer flex-shrink-0 w-36"
            >
              <div className="text-[8px] text-blue-400 font-black uppercase mb-1">⚡ Death Tactics</div>
              <p className="text-[10px] font-bold text-white leading-normal truncate">Bumrah yorker block</p>
              <span className="text-[7px] text-gray-500 uppercase font-black block mt-2">Resume plan ›</span>
            </button>
            <button
              onClick={() => setPage("coach")}
              className="bg-gradient-to-r from-purple-500/10 to-transparent border border-white/10 rounded-2xl p-3 text-left transition-all hover:scale-[1.02] cursor-pointer flex-shrink-0 w-36"
            >
              <div className="text-[8px] text-purple-400 font-black uppercase mb-1">🧠 Chase Pressure</div>
              <p className="text-[10px] font-bold text-white leading-normal truncate">Required RR 9.8 drills</p>
              <span className="text-[7px] text-gray-500 uppercase font-black block mt-2">Start session ›</span>
            </button>
          </div>
        </div>

        {/* 5. Personalized Player Role Selector with Stats Card */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase flex items-center gap-1.5">
              <Icon name="users" className="w-3.5 h-3.5 text-amber-400" /> Active Player Roles
            </p>
            <span className="text-[8px] text-gray-500 font-bold uppercase">Dynamic bio adjustments</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {roles.map(r => {
              const isSelected = coachMode === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setCoachMode(r.id);
                    speakText(`Switched player role to ${r.label}.`, voiceActive);
                  }}
                  className={`relative rounded-3xl bg-[#0b0c0b] border p-3 text-left transition-all duration-300 ${r.color} ${
                    isSelected ? "border-amber-500 scale-[1.02]" : "border-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xl">{r.emoji}</span>
                    {isSelected && (
                      <span className="text-[7px] bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded font-black uppercase">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-xs font-display font-black text-white mt-1.5 leading-none">{r.label}</div>
                  
                  {/* Dynamic stats overlay for personalization */}
                  <div className="mt-2 pt-1.5 border-t border-white/5 space-y-1 text-[8px] text-gray-400 font-medium">
                    {r.id === "batter" && (
                      <>
                        <div className="flex justify-between"><span>Timing:</span> <strong className="text-white">{r.stats.timing}</strong></div>
                        <div className="flex justify-between"><span>Spin Control:</span> <strong className="text-amber-400">{r.stats.spin}</strong></div>
                      </>
                    )}
                    {r.id === "bowler" && (
                      <>
                        <div className="flex justify-between"><span>Swing:</span> <strong className="text-white">{r.stats.swing}</strong></div>
                        <div className="flex justify-between"><span>Yorker:</span> <strong className="text-amber-400">{r.stats.yorker}</strong></div>
                      </>
                    )}
                    {r.id === "captain" && (
                      <>
                        <div className="flex justify-between"><span>Tactics:</span> <strong className="text-white">{r.stats.tactics}</strong></div>
                        <div className="flex justify-between"><span>Decision:</span> <strong className="text-amber-400">{r.stats.decision}</strong></div>
                      </>
                    )}
                    {r.id === "keeper" && (
                      <>
                        <div className="flex justify-between"><span>Reflex:</span> <strong className="text-white">{r.stats.reflex}</strong></div>
                        <div className="flex justify-between"><span>Catch Rate:</span> <strong className="text-amber-400">{r.stats.catchRate}</strong></div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Dynamic operating system Centerpiece Dashboard & SVG Skill Tracker */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl animate-pulse" />
          
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase flex items-center gap-1">
              <Icon name="bar-chart-3" className="w-3.5 h-3.5" /> AI Operating System DNA Dashboard
            </span>
            <span className="text-[7px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase">GOLD ARCHETYPE</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SVG confidence meter */}
            <div className="space-y-1.5">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Batting Confidence DNA</p>
              
              <div className="relative flex justify-center py-1">
                <svg viewBox="0 0 50 25" className="w-full max-h-16">
                  {/* Gauge track */}
                  <path d="M 5,22 A 18,18 0 0,1 45,22" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="3.5, 1" opacity="0.2" strokeLinecap="round" />
                  {/* Gauge value */}
                  <path d="M 5,22 A 18,18 0 0,1 39,12" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                  <text x="25" y="22" textAnchor="middle" fontSize="6.5" fill="#ffffff" fontWeight="black">84%</text>
                </svg>
              </div>
              <p className="text-[7px] text-gray-500 text-center uppercase font-black">Matches Pro Stance: SKY</p>
            </div>

            {/* SVG Form Trend Graph (Sparkline) */}
            <div className="space-y-1.5">
              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">5-Day Form Progression</p>
              
              <div className="flex justify-center py-2 bg-black/40 rounded-2xl border border-white/5 px-2">
                <svg viewBox="0 0 60 20" className="w-full h-10">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="60" y2="10" stroke="#ffffff" strokeWidth="0.2" opacity="0.1" />
                  
                  {/* Sparkline curve */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="5,15 18,12 30,14 42,6 55,4"
                  />
                  {/* Nodes */}
                  <circle cx="5" cy="15" r="1" fill="#f59e0b" />
                  <circle cx="18" cy="12" r="1" fill="#f59e0b" />
                  <circle cx="30" cy="14" r="1" fill="#f59e0b" />
                  <circle cx="42" cy="6" r="1" fill="#f59e0b" />
                  <circle cx="55" cy="4" r="1.5" fill="#f59e0b" className="animate-ping" />
                </svg>
              </div>
              <div className="flex justify-between text-[6px] text-gray-500 font-bold uppercase px-1">
                <span>Day 1: 65%</span>
                <span>Day 5: 88%</span>
              </div>
            </div>
          </div>

          {/* Weakness & Daily Insight panel */}
          <div className="bg-red-950/20 border border-red-500/10 rounded-2xl p-3 flex gap-2.5 items-center">
            <span className="text-xl animate-pulse">💡</span>
            <div className="flex-1 space-y-0.5">
              <span className="text-[7px] text-red-400 uppercase font-black tracking-wider block">Daily AI Insight</span>
              <p className="text-[9px] text-gray-300 leading-normal italic">
                "Your strike rotation drops against left-arm spin. Stance shoulder opens up 8 degrees too early."
              </p>
            </div>
          </div>
        </div>

        {/* 7. Features Room Modern Grid (Compact heights & mini active stats) */}
        <div>
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase mb-2.5 flex items-center gap-1.5">
            <Icon name="compass" className="w-3.5 h-3.5 text-amber-400" /> Operating System Features
          </p>
          
          <div className="grid grid-cols-2 gap-2.5">
            {features.map(f => (
              <button
                key={f.page}
                onClick={() => setPage(f.page)}
                className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 rounded-2xl p-3.5 text-left transition-all active:scale-95 duration-200 cursor-pointer flex flex-col justify-between h-[105px] group"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xl group-hover:scale-110 transition-transform">{f.emoji}</span>
                  <span className="text-[7px] bg-white/5 text-gray-400 border border-white/5 px-1.5 py-0.5 rounded uppercase font-black truncate max-w-[80px]">
                    {f.status.split(":")[0]}
                  </span>
                </div>
                <div className="space-y-0.5 mt-2">
                  <div className="text-white font-display font-black text-xs">{f.label}</div>
                  <div className="text-gray-400 text-[8px] leading-tight line-clamp-2">"{f.desc}"</div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
