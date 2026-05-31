import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AggressionMeter from '../components/AggressionMeter';
import WinProbability from '../components/WinProbability';
import FieldPlacement from '../components/FieldPlacement';
import { callGeminiApi } from '../utils/gemini';
import { SIMULATOR } from '../utils/simulator';
import { db, firebase } from '../utils/firebase';

export default function StrategyPage({ apiKey, selectedScenario, setSelectedScenario }) {
  const [form, setForm] = useState({ 
    role: "batting", 
    opponent: "Balanced Squad", 
    pitch: "Flat", 
    overs: "10", 
    wickets: "2",
    currentRR: "7.20",
    requiredRR: "8.90",
    partnership: "38 runs off 24 balls"
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldType, setFieldType] = useState("defensive");
  const [aggression, setAggression] = useState(50);
  const [winProb, setWinProb] = useState({ batting: 50, bowling: 50 });
  const [pressureScore, setPressureScore] = useState(30);

  const pitches = [
    { name: "Flat", desc: "Batting Highway", emoji: "🏜️", detail: "Dry brown surface, zero lateral seam." },
    { name: "Green Seaming", desc: "Pace Heaven", emoji: "🌿", detail: "Lush grass layer, heavy seam & swing." },
    { name: "Dry Spinning", desc: "Spin Paradise", emoji: "🍂", detail: "Deep cracks, dry dust, massive turn." },
    { name: "Bouncy Track", desc: "Carry & Pace", emoji: "⚡", detail: "Hard clay, high carry, pace friendly." },
    { name: "Slow & Low", desc: "Cutter Heaven", emoji: "🐢", detail: "Sticky dry sand, low spongy bounce." }
  ];

  const opponents = [
    { name: "Pace Attack", hint: "Short ball threat", emoji: "🚀" },
    { name: "Spin Heavy", hint: "Middle overs choke", emoji: "🌀" },
    { name: "Power Hitters", hint: "Death overs danger", emoji: "💥" },
    { name: "Balanced Squad", hint: "Steady containment", emoji: "⚖️" },
    { name: "Inexperienced", hint: "Pressure triggers", emoji: "🐣" }
  ];

  useEffect(() => {
    if (selectedScenario) {
      setForm(f => ({
        ...f,
        pitch: selectedScenario.pitch,
        opponent: selectedScenario.opponent
      }));
      setSelectedScenario(null);
    }
  }, [selectedScenario]);

  // Compute dynamic match pressure dynamically
  const ovs = parseInt(form.overs) || 10;
  const wckts = parseInt(form.wickets) || 2;
  const reqRRVal = parseFloat(form.requiredRR) || 8.5;
  
  // Calculate dynamic pressure percentage
  const calculatedPressure = Math.min(100, Math.max(10, Math.round(
    wckts * 14 + (20 - ovs) * 1.5 + (reqRRVal - 6) * 8
  )));

  useEffect(() => {
    setPressureScore(calculatedPressure);
  }, [form.overs, form.wickets, form.requiredRR]);

  // Determine pressure level details
  let pressureLevel = "Safe";
  let pressureColor = "from-green-500 to-emerald-600";
  let pressureBorder = "border-green-500/20";
  let pressureText = "text-green-400";
  
  if (pressureScore > 75) {
    pressureLevel = "Collapse Risk 🚨";
    pressureColor = "from-red-500 to-rose-600";
    pressureBorder = "border-red-500/20";
    pressureText = "text-red-400";
  } else if (pressureScore > 50) {
    pressureLevel = "High Pressure ⚠️";
    pressureColor = "from-orange-500 to-amber-600";
    pressureBorder = "border-orange-500/20";
    pressureText = "text-orange-400";
  } else if (pressureScore > 25) {
    pressureLevel = "Balanced ⚖️";
    pressureColor = "from-yellow-500 to-amber-500";
    pressureBorder = "border-yellow-500/20";
    pressureText = "text-yellow-400";
  }

  const runAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);

    const aggScore = form.role === "batting"
      ? Math.min(95, Math.max(30, 45 + (15 - ovs) * 2.5 + wckts * 3.5 + (reqRRVal > 9 ? 10 : 0)))
      : Math.min(95, Math.max(25, 75 - wckts * 6 + (reqRRVal < 8 ? 8 : -5)));
    
    setAggression(Math.round(aggScore));
    setFieldType(aggScore > 55 ? "aggressive" : "defensive");

    const winPct = form.role === "batting"
      ? Math.min(88, Math.max(15, 65 - wckts * 7.5 + (ovs > 8 ? 8 : -8) - (reqRRVal - 8) * 5))
      : Math.min(85, Math.max(15, 35 + wckts * 8 + (reqRRVal - 8) * 4));

    setWinProb({ batting: Math.round(winPct), bowling: Math.round(100 - winPct) });

    const SYSTEM_PROMPT = `You are CricMind AI — an elite cricket head coach and tactical genius. Analyze this scenario and output matching strategy in exactly this format:
    
    ## 🎯 Situation Read
    Provide exactly 2 sentences critically outlining the pressure match situation. Refer explicitly to the run rate and pressure level.
    
    ## 📋 Primary Strategy
    Provide a tactical overview of instruction directives (3-4 lines).
    
    ## ⚡ Key Tactics
    - Tactic 1 (Detailed execution target zones)
    - Tactic 2 (Detailed execution based on pitch conditions)
    - Tactic 3 (Weak bowler targeting strategy)
    - Tactic 4 (Defensive containment or defensive backup)
    
    ## 🎲 If Plan A Fails
    Contingency backup plan (2 lines).
    
    ## 🏆 Win Condition
    1 clear milestone needed to cross the finish line.`;

    const userPromptText = `Role: ${form.role}. Opponent Style: ${form.opponent}. Pitch Surface: ${form.pitch}. Overs Left: ${form.overs}. Wickets ${form.role === "batting" ? "Down" : "Taken"}: ${form.wickets}. Current RR: ${form.currentRR}. Req RR: ${form.requiredRR}. Partnership: ${form.partnership}.`;

    try {
      let strategyReply = "";
      if (apiKey) {
        strategyReply = await callGeminiApi(SYSTEM_PROMPT, userPromptText, apiKey);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        strategyReply = SIMULATOR.strategy(form);
      }

      if (db) {
        db.collection("strategy_analyses").add({
          role: form.role,
          pitch: form.pitch,
          opponent: form.opponent,
          overs: form.overs,
          wickets: form.wickets,
          strategy: strategyReply,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.error("Firestore sync failed: ", e));
      }

      setResult(strategyReply);
    } catch (e) {
      setResult(`❌ **Error:** ${e.message}\n\nPlease check your key connection.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full animate-fadeIn pb-24 bg-black text-white">
      <div className="px-4 py-4 space-y-4">
        
        {/* Header HUD - Minimal & Sleek (No neon glow clutter) */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-white font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="bar-chart-3" className="text-amber-400 w-4 h-4" /> Match Strategy Room
            </h2>
            <p className="text-gray-400 text-[10px] leading-snug">
              Professional-grade team strategy cards, dynamic aggression ranges, and tactical F1 overlays.
            </p>
          </div>
          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">TACTICS</span>
        </div>

        {/* 1. Thin Segmented Control Role Selector */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl relative">
          <button
            onClick={() => setForm(f => ({ ...f, role: "batting" }))}
            className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              form.role === "batting" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            🏏 Batting
          </button>
          <button
            onClick={() => setForm(f => ({ ...f, role: "bowling" }))}
            className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all duration-300 ${
              form.role === "bowling" 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/10" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎯 Bowling
          </button>
        </div>

        {/* 2. Visual Pitch Selection Cards */}
        <div className="space-y-2">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">🏜️ Pitch Surface Conditions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {pitches.map(p => {
              const isSelected = form.pitch === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setForm(f => ({ ...f, pitch: p.name }))}
                  className={`rounded-2xl p-2.5 text-center border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-br from-amber-500/15 to-orange-500/5 border-amber-500 text-white scale-[1.03] shadow-md shadow-amber-500/5 font-black" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-gray-200"
                  }`}
                  title={p.detail}
                >
                  <span className="text-lg mb-1">{p.emoji}</span>
                  <span className="text-[9px] font-bold tracking-wider leading-none uppercase truncate max-w-full">{p.name.split(" ")[0]}</span>
                  <span className="text-[6px] text-gray-500 mt-1 uppercase font-bold truncate max-w-full leading-none">{p.desc.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
          {/* Pitch helper detail */}
          <p className="text-[9px] text-gray-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 italic">
            💡 {pitches.find(p => p.name === form.pitch)?.detail}
          </p>
        </div>

        {/* 3. Opponent Cards with Tactical hints */}
        <div className="space-y-2">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">⚡ Opponent Style & Tactical Threat</p>
          <div className="grid grid-cols-5 gap-1.5">
            {opponents.map(o => {
              const isSelected = form.opponent === o.name;
              return (
                <button
                  key={o.name}
                  onClick={() => setForm(f => ({ ...f, opponent: o.name }))}
                  className={`rounded-2xl p-2.5 text-center border transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-br from-amber-500/15 to-orange-500/5 border-amber-500 text-white scale-[1.03] shadow-md shadow-amber-500/5 font-black" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-gray-200"
                  }`}
                  title={o.hint}
                >
                  <span className="text-base mb-1">{o.emoji}</span>
                  <span className="text-[9px] font-bold tracking-wider leading-none uppercase truncate max-w-full">{o.name.split(" ")[0]}</span>
                  <span className="text-[6px] text-red-400 font-bold mt-1 uppercase truncate max-w-full leading-none">{o.hint.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[9px] text-red-400 bg-red-950/20 px-3 py-1.5 rounded-xl border border-red-500/10 italic">
            ⚠️ Tactical Threat Zone: <strong className="uppercase">{opponents.find(o => o.name === form.opponent)?.hint}</strong>
          </p>
        </div>

        {/* 4. Live Match Context HUD */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 space-y-3.5">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">📈 Live Match Context Stats</p>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[8px] text-gray-400 font-black uppercase mb-1">Current Run Rate</label>
              <input
                type="text"
                value={form.currentRR}
                onChange={e => setForm(f => ({ ...f, currentRR: e.target.value }))}
                placeholder="e.g. 7.50"
                className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 font-black uppercase mb-1">Required Run Rate</label>
              <input
                type="text"
                value={form.requiredRR}
                onChange={e => setForm(f => ({ ...f, requiredRR: e.target.value }))}
                placeholder="e.g. 9.20"
                className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 font-black uppercase mb-1">Active Partnership</label>
              <input
                type="text"
                value={form.partnership}
                onChange={e => setForm(f => ({ ...f, partnership: e.target.value }))}
                placeholder="e.g. 52 runs"
                className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
            <div>
              <label className="block text-[8px] text-gray-400 font-black uppercase mb-1">Overs Left</label>
              <input
                type="number"
                value={form.overs}
                onChange={e => setForm(f => ({ ...f, overs: e.target.value }))}
                placeholder="e.g. 5"
                className="w-full bg-black border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 font-black uppercase mb-1">
                Wickets {form.role === "batting" ? "Lost" : "Taken"}
              </label>
              <input
                type="number"
                value={form.wickets}
                onChange={e => setForm(f => ({ ...f, wickets: e.target.value }))}
                placeholder="e.g. 3"
                className="w-full bg-black border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 5. Match Pressure Meter Widget */}
        <div className={`bg-black border ${pressureBorder} rounded-3xl p-4 space-y-2.5 transition-all duration-300`}>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] text-gray-400 font-display font-black tracking-widest uppercase">⚠️ Match Pressure Meter</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded border border-white/5 ${pressureText}`}>
              {pressureLevel} ({pressureScore}%)
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${pressureColor} transition-all duration-500 rounded-full`}
              style={{ width: `${pressureScore}%` }}
            />
          </div>
        </div>

        {/* 6. Premium CTA Button */}
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 text-black font-display font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 uppercase tracking-wider cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Plotting tactical maps...
            </>
          ) : (
            <>
              <Icon name="cpu" className="w-4 h-4" /> Generate AI Strategy
            </>
          )}
        </button>

        {/* 7. F1 Dashboard Results HUD */}
        {result && !loading && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            
            {/* dynamic Win Probability & Aggression widgets */}
            <div className="grid grid-cols-2 gap-3.5">
              <AggressionMeter value={aggression} />
              <WinProbability batting={winProb.batting} bowling={winProb.bowling} />
            </div>

            {/* AI Strategic Wagon Wheel (Batting) OR Pitch Heatmap (Bowling) */}
            {form.role === "batting" ? (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">🏏 Batting Wagon Wheel (Attack Gaps)</p>
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black uppercase">HIGH YIELD</span>
                </div>
                
                <div className="relative flex justify-center py-2 bg-black/40 rounded-2xl border border-white/5">
                  <svg viewBox="0 0 120 120" className="w-full max-h-56">
                    {/* Boundary circle */}
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#22c55e" strokeWidth="0.75" />
                    <circle cx="60" cy="60" r="32" fill="none" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2,2" />
                    
                    {/* Pitch */}
                    <rect x="56" y="48" width="8" height="24" rx="0.5" fill="#a16207" opacity="0.8" />
                    
                    {/* Gaps / Scoring Lines */}
                    {/* Cover Drive (+4) */}
                    <line x1="60" y1="60" x2="105" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="0" />
                    <circle cx="105" cy="35" r="2.5" fill="#f59e0b" />
                    <text x="109" y="33" fontSize="4.5" fill="#f59e0b" fontWeight="black">🏏 +4</text>
                    
                    {/* Midwicket Pull (+6) */}
                    <line x1="60" y1="60" x2="12" y2="42" stroke="#f97316" strokeWidth="2" />
                    <circle cx="12" cy="42" r="2.5" fill="#f97316" />
                    <text x="5" y="38" fontSize="4.5" fill="#f97316" fontWeight="black">💥 +6</text>
                    
                    {/* Straight Loft (+6) */}
                    <line x1="60" y1="60" x2="60" y2="8" stroke="#ef4444" strokeWidth="2.2" />
                    <circle cx="60" cy="8" r="2.5" fill="#ef4444" />
                    <text x="63" y="9" fontSize="4.5" fill="#ef4444" fontWeight="black">🚀 +6</text>
                    
                    {/* Fine Leg Glance (+1) */}
                    <line x1="60" y1="60" x2="25" y2="98" stroke="#9ca3af" strokeWidth="0.8" />
                    <circle cx="25" cy="98" r="1.5" fill="#9ca3af" />
                    <text x="16" y="103" fontSize="4.5" fill="#9ca3af" fontWeight="bold">🚶 +1</text>
                    
                    {/* Off-side Cut (+2) */}
                    <line x1="60" y1="60" x2="98" y2="85" stroke="#fbbf24" strokeWidth="1" />
                    <circle cx="98" cy="85" r="2" fill="#fbbf24" />
                    <text x="101" y="90" fontSize="4.5" fill="#fbbf24" fontWeight="bold">⚡ +2</text>
                  </svg>
                </div>
                <p className="text-[9px] text-gray-500 text-center italic">Highlighted zones depict AI recommended high-probability scoring directions based on pitch & bowler style.</p>
              </div>
            ) : (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">🎯 Pitch Landing Heatmap (Bowling Targets)</p>
                  <span className="text-[8px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-black uppercase">TACTICAL FOCUS</span>
                </div>
                
                <div className="relative flex justify-center py-2 bg-black/40 rounded-2xl border border-white/5">
                  <svg viewBox="0 0 100 100" className="w-full max-h-56">
                    {/* Pitch silhouette from bowler view */}
                    <rect x="25" y="10" width="50" height="80" rx="3" fill="#854d0e" opacity="0.4" stroke="#a16207" strokeWidth="0.75" />
                    
                    {/* Length lines */}
                    <line x1="25" y1="30" x2="75" y2="30" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                    <text x="20" y="32" fontSize="3" fill="#9ca3af">Short</text>
                    
                    <line x1="25" y1="55" x2="75" y2="55" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                    <text x="16" y="57" fontSize="3" fill="#9ca3af">Good Length</text>
                    
                    <line x1="25" y1="75" x2="75" y2="75" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                    <text x="20" y="77" fontSize="3" fill="#9ca3af">Full</text>
                    
                    {/* Off-stump channel marker */}
                    <line x1="62" y1="10" x2="62" y2="90" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6" />
                    
                    {/* Heatmap rings */}
                    {/* Good length corridor of uncertainty */}
                    <circle cx="62" cy="50" r="10" fill="#ef4444" opacity="0.25" />
                    <circle cx="62" cy="50" r="6" fill="#ef4444" opacity="0.45" />
                    <circle cx="62" cy="50" r="3.5" fill="#ef4444" opacity="0.7" />
                    <text x="64" y="44" fontSize="3.5" fill="#ef4444" fontWeight="black">🎯 Target Zone</text>
                    
                    {/* Secondary dry spin patch */}
                    <circle cx="42" cy="62" r="8" fill="#eab308" opacity="0.15" />
                    <circle cx="42" cy="62" r="4.5" fill="#eab308" opacity="0.3" />
                  </svg>
                </div>
                <p className="text-[9px] text-gray-500 text-center italic">Red hot zones represent landing grids optimized to extract seam deviations and mistimed drives.</p>
              </div>
            )}

            {/* Dynamic Fielder Map Placement component */}
            <FieldPlacement strategy={fieldType} role={form.role} />

            {/* AI Explanation / Trust-builder Cards (F1 Dashboard Style) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#0b0c0b] border border-white/10 rounded-2xl p-3 space-y-1">
                <div className="text-[8px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" /> Biomechanical Reading
                </div>
                <p className="text-[11px] font-bold text-white">Opponent Off-spinner</p>
                <p className="text-[9px] text-gray-400 leading-snug">
                  AI detected high leakage rates square-leg when deliveries are angled slow into the pads on {form.pitch} surface.
                </p>
              </div>
              <div className="bg-[#0b0c0b] border border-white/10 rounded-2xl p-3 space-y-1">
                <div className="text-[8px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" /> Tactical Advisory
                </div>
                <p className="text-[11px] font-bold text-white">Target attack over 14</p>
                <p className="text-[9px] text-gray-400 leading-snug">
                  Pace attack displays high fatigue signs. Pivot batting intent towards mid-wicket lofts as seam drops.
                </p>
              </div>
            </div>

            {/* AI Captain Mode Feature Box */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-3xl p-4 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🤖</span>
                <p className="text-amber-400 font-display font-black text-xs uppercase tracking-widest leading-none">AI Captain Mode Activated</p>
              </div>
              <p className="text-[11px] text-gray-200 leading-relaxed italic">
                "{form.role === "batting" 
                  ? `Batsmen must avoid lofting sweeps on the leg side vs ${form.opponent}. Target the third-seamer corridor, rotate singles actively, and preserve wickets until the final overs.` 
                  : `Opponent batting run rate is slowing down. Introduce an aggressive short-midwicket fielder immediately and instruct bowler to target wide yorkers out of batsman's reaching arc.`
                }"
              </p>
            </div>

            {/* Highly readable text strategy card block */}
            <div className="bg-gradient-to-br from-[#0c0f0c] via-black to-black border border-white/10 rounded-3xl p-5 shadow-2xl">
              <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-white/5">
                <p className="text-amber-400 font-display font-black text-xs uppercase tracking-widest">📋 AI Strategic Blueprint</p>
                <button className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-black tracking-wider uppercase flex items-center gap-1 transition-all duration-300">
                  <Icon name="download" className="w-2.5 h-2.5" /> EXPORT PLAN
                </button>
              </div>
              <MarkdownRenderer text={result} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
