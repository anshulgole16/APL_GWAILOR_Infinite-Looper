import React, { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import MarkdownRenderer from '../components/MarkdownRenderer';
import UnifiedActionBridge from '../components/UnifiedActionBridge';
import { callGeminiApi } from '../utils/gemini';
import { SIMULATOR } from '../utils/simulator';
import { db, firebase } from '../utils/firebase';
import { useVoiceInput, speakText } from '../utils/voice';

export default function CoachPage({ coachMode, apiKey, voiceActive, setPage, setSelectedScenario }) {
  const roleLabels = { batter: "Batter", bowler: "Bowler", captain: "Captain", keeper: "Wicketkeeper" };
  const roleEmoji = { batter: "🏏", bowler: "🎯", captain: "👑", keeper: "🧤" };

  const [activeTab, setActiveTab] = useState("chat"); // "chat", "vision", "simulator"
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Describe your batting or bowling problem. AI Coach will analyze your technique, mindset & training drills.",
      isIntro: true
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePersonality, setActivePersonality] = useState("desi"); // "shastri", "bhogle", "strict", "calm", "desi"
  const [speaking, setSpeaking] = useState(false);
  
  // Biomechanical Vision Scanner State
  const [visionFile, setVisionFile] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const fileInputRef = useRef(null);

  // Pressure Simulator Game State
  const [simStep, setSimStep] = useState(0); // 0 = start, 1 = played
  const [selectedShot, setSelectedShot] = useState(null);
  const [simResult, setSimResult] = useState(null);

  const messagesEndRef = useRef(null);
  const { listening, startListening, stopListening } = useVoiceInput(t => setInput(t));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync speak status for visual bouncing wave
  const triggerSpeakText = (text) => {
    if (!voiceActive) return;
    setSpeaking(true);
    speakText(text, true);
    
    const wordCount = text.split(" ").length;
    const durationMs = (wordCount / 150) * 60 * 1000 + 1500;
    
    setTimeout(() => {
      setSpeaking(false);
    }, durationMs);
  };

  const personalities = {
    shastri: {
      name: "Ravi Shastri",
      emoji: "🎙️",
      prompt: "You are Ravi Shastri — electrifying, high-energy, confident international coach. Speak with massive hype, call it as you see it, and inject Shastri phrases ('tracer bullet', 'in the air and taken!', ' Kya lajawab shot hai!')."
    },
    bhogle: {
      name: "Harsha Bhogle",
      emoji: "🧐",
      prompt: "You are Harsha Bhogle — poetic, calm, warm, and highly tactical. Analyze timing, wrists, batsman grace, and stance balance, injecting gentle Hinglish phrases elegantly ('Kitna sunehra timing!')."
    },
    strict: {
      name: "Strict Coach",
      emoji: "😤",
      prompt: "You are a highly demanding, blunt, strict professional coach. Focus immediately on technical mistakes, command focus, tell them exactly what they are doing wrong with no sugar-coating."
    },
    calm: {
      name: "Calm Mentor",
      emoji: "🧘",
      prompt: "You are a Zen-like calm mentor. Focus on breathwork, target focus, pressure reduction, relaxation of grip, and dynamic mental setups."
    },
    desi: {
      name: "Local Desi",
      emoji: "🏏",
      prompt: "You are a street-smart local Desi Coach. Speak in a friendly, conversational Hinglish dialect, using phrases like 'Suno bhai', 'Chakka marna hai to', 'Pads par khelo' with natural local street cricket wit."
    }
  };

  const quickPrompts = [
    { title: "Spin Problem", difficulty: "Expert", text: "I struggle to read leg-spin, getting closed-face early", emoji: "🏏" },
    { title: "Yorker Issue", difficulty: "Hard", text: "How to block searing toe-crusher yorkers without losing balance?", emoji: "⚡" },
    { title: "Timing Loss", difficulty: "Medium", text: "Losing ball contact timing on off-side drives", emoji: "🎯" },
    { title: "Pressure Batting", difficulty: "Advanced", text: "How to maintain posture during powerplays under high RRR?", emoji: "🧠" }
  ];

  const trainingModes = [
    { name: "Net Practice", desc: "Form & timing", active: true },
    { name: "Death Overs", desc: "Power batting", active: false },
    { name: "Spin Survival", desc: "Read variations", active: false },
    { name: "Chase Pressure", desc: "Rate management", active: false }
  ];

  // Dynamic coaching prompt query execution
  const sendMessage = async (presetText = null) => {
    const textToSend = presetText || input;
    if (!textToSend.trim() || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setLoading(true);

    const coachPers = personalities[activePersonality];
    
    const SYSTEM_PROMPT = `You are CricMind AI — an elite cricket head coach. You are coaching a player right now in a ${coachMode} role.
    Persona Context: ${coachPers.prompt}
    
    Return a response formatted as high-density visual coaching cards. Structure your reply strictly in markdown:
    
    # 📋 AI Coach Breakdown
    
    ## 🔍 Mistake Analysis
    Diagnose the root cause biomechanically (max 2 lines).
    
    ## ⚡ Instant Fix
    1 immediate adjustment on wrist, posture, or stance.
    
    ## 🏋️ Drill routine
    Exactly 2 numbered practice drills they can do today.
    
    ## 🌟 Pro Reference
    Which legendary professional handles this perfectly and what to copy.
    
    Include these summary metrics at the absolute end formatted exactly as:
    METRICS: Expected Improvement: +15% | Mistake Probability: 68% | Pro Match: Virat Kohli Stance
    
    Keep response punchy, high-energy, and mix Hinglish naturally.`;

    try {
      let coachReply = "";
      if (apiKey) {
        coachReply = await callGeminiApi(SYSTEM_PROMPT, textToSend, apiKey);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        coachReply = SIMULATOR.coach(textToSend, coachMode);
        // Format to follow card guidelines
        coachReply = `# 📋 AI Coach Breakdown
        
## 🔍 Mistake Analysis
Your head is falling away slightly towards the off-side, causing you to close your bat face too early and mistime the sweep.

## ⚡ Instant Fix
Keep your front shoulder pointed straight at the bowler until the release, keeping the head vertical over the knee.

## 🏋️ Drill routine
1. **Static Head Drops** (15 reps): Stance posture drop-downs, keeping eyes locked on a static line.
2. **Underarm Sweep Cues** (3 sets of 10): Sweep low underarm feeds strictly along the ground.

## 🌟 Pro Reference
Virat Kohli stance - Watch how his head stays perfectly aligned over his lead shoulder when leaning into spin drives.

METRICS: Expected Improvement: +18% | Mistake Probability: 72% | Pro Match: Virat Kohli Stance`;
      }

      // Sync Firestore
      if (db) {
        db.collection("coaching_sessions").add({
          role: coachMode,
          query: textToSend,
          reply: coachReply,
          style: coachPers.name,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.error("Firestore sync failed: ", e));
      }

      // Voice
      triggerSpeakText(coachReply.replace(/METRICS:.*/g, "").replace(/#.*/g, "").trim());

      // Parse Metrics for beautiful visual layout
      const metricMatch = coachReply.match(/METRICS:\s*Expected Improvement:\s*([\+\d%]+)\s*\|\s*Mistake Probability:\s*([\d%]+)\s*\|\s*Pro Match:\s*(.*)/i);
      
      let parsedMetrics = null;
      let cleanReply = coachReply;
      
      if (metricMatch) {
        parsedMetrics = {
          improvement: metricMatch[1],
          mistakeProb: metricMatch[2],
          proMatch: metricMatch[3]
        };
        cleanReply = coachReply.replace(/METRICS:.*/, "").trim();
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: cleanReply, 
        metrics: parsedMetrics,
        coachName: coachPers.name,
        coachEmoji: coachPers.emoji
      }]);

    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `❌ **Error:** ${e.message}\n\nPlease check your key configuration.` }]);
    } finally {
      setLoading(false);
    }
  };

  // Vision scanner upload simulation
  const handleVisionUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVisionFile(URL.createObjectURL(file));
    setVisionLoading(true);
    setVisionResult(null);

    setTimeout(() => {
      setVisionResult({
        balance: 88,
        head: "Stable (92%)",
        footwork: "Optimal (Late 0.05s)",
        swingPath: "Straight (High-to-Low)",
        mistake: "Excellent stance line, but rear knee remains slightly locked at point of load."
      });
      speakText("Stance scanning complete. Excellent head stability recorded at 92%.", voiceActive);
      setVisionLoading(false);
    }, 1800);
  };

  // Pressure Simulator shot play
  const playSimulatorShot = (shotId) => {
    setSelectedShot(shotId);
    setSimStep(1);

    const coachPers = personalities[activePersonality];
    let resultText = "";

    if (shotId === 1) {
      resultText = `❌ **FAILED!** You tried a massive Slog Sweep, but Bumrah spear-headed a searing 142km/h toe-crushing yorker on off-stump. The ball goes clean under the bat, lighting up the stumps! 
      
      **${coachPers.name} Advice:** "Oh, no! Slogging Bumrah in the blockhole on the first ball is suicide! Stance was locked, knee bent too early. High risk, high fail probability!"`;
    } else if (shotId === 2) {
      resultText = `⚠️ **EDGE!** You leaned into an inside-out lofted extra cover drive. Classic execution, but the length was too full, resulting in a thick outside edge that flies past gully for a double.
      
      **${coachPers.name} Advice:** "That's elegant but risky on this flat pitch. A boundary was on, but your weight transfer shifted late. Safe double, but watch your front foot step!"`;
    } else if (shotId === 3) {
      resultText = `🏏 **FOUR RUNS!** A classy straight lofted punch down the ground. You maintained perfect head posture, presenting the full face of the bat to push the ball straight over Bumrah's head for a glorious boundary!
      
      **${coachPers.name} Advice:** "SHOT OF THE MATCH! Full face of the bat, clean swing path! Kohli-esque balance! Excellent decision under pressure!"`;
    } else {
      resultText = `⚡ **SIX RUNS! (UNBELIEVABLE!)** You played a surprise late scoop past short third-man. Leveraging Bumrah's extreme pace, you knelt low and scooped the ball clean over fine-leg into the stands!
      
      **${coachPers.name} Advice:** "GENIUS CRICKET! Using the bowler's pace under pressure is what separates champions from rookies! Absolute audacity, and it paid off beautifully!"`;
    }

    setSimResult(resultText);
    speakText(resultText.replace(/\*\*.*\*\*/g, ""), voiceActive);
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn bg-black text-white relative">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-avatar-pulse {
          animation: pulse-ring 2s infinite ease-in-out;
        }
        @keyframes wave-bounce {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1.3); }
        }
        .animate-wave-bar {
          animation: wave-bounce 0.7s ease-in-out infinite;
          transform-origin: bottom;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
      `}</style>

      {/* 1. Header with Coach Tab Switcher */}
      <div className="px-4 py-3 bg-[#0a0f0a] border-b border-white/10 flex items-center justify-between flex-shrink-0 relative z-10">
        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          <span>{roleEmoji[coachMode]}</span> AI Academy Mode
        </span>
        
        {/* Navigation Tabs inside Coach Page */}
        <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-xl text-[10px]">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all ${activeTab === "chat" ? "bg-amber-500 text-black font-black" : "text-gray-400 hover:text-white"}`}
          >
            Coach Chat
          </button>
          <button
            onClick={() => setActiveTab("vision")}
            className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all ${activeTab === "vision" ? "bg-amber-500 text-black font-black" : "text-gray-400 hover:text-white"}`}
          >
            AI Vision
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all ${activeTab === "simulator" ? "bg-amber-500 text-black font-black" : "text-gray-400 hover:text-white"}`}
          >
            Pressure Game
          </button>
        </div>
      </div>

      {/* 2. Coach Personality Segment Selector */}
      <div className="px-4 py-2.5 bg-neutral-900/50 border-b border-white/5 space-y-1.5">
        <p className="text-[8px] text-amber-400 font-display font-black tracking-widest uppercase">🎙️ Select Coach Avatar Personality</p>
        <div className="flex justify-between gap-1.5 overflow-x-auto">
          {Object.keys(personalities).map(key => {
            const persObj = personalities[key];
            const isSelected = activePersonality === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActivePersonality(key);
                  speakText(`Active coach: ${persObj.name}.`, voiceActive);
                }}
                className={`flex-1 rounded-2xl py-1.5 px-2 text-center transition-all border flex flex-col items-center justify-center cursor-pointer ${
                  isSelected 
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-white shadow-lg font-black scale-105" 
                    : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="text-sm mb-0.5">{persObj.emoji}</span>
                <span className="text-[8px] truncate max-w-full font-bold uppercase leading-none">{persObj.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Routing */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4 relative">
        
        {/* Tab 1: COACH CHAT ROOM */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            
            {/* Gamified progress tracking dashboard */}
            <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-xl space-y-2.5">
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-400 tracking-wider">
                <span>📈 Player Gamified Skill Tracking</span>
                <span className="text-amber-400">Bronze III Level</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2 space-y-0.5">
                  <span className="text-[7px] text-gray-400 font-bold uppercase block">Timing Accuracy</span>
                  <span className="text-xs font-black text-white">82% <strong className="text-[8px] text-green-400 font-bold">+12%</strong></span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2 space-y-0.5">
                  <span className="text-[7px] text-gray-400 font-bold uppercase block">Spin Read</span>
                  <span className="text-xs font-black text-white">78%</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2 space-y-0.5">
                  <span className="text-[7px] text-gray-400 font-bold uppercase block">Backfoot Control</span>
                  <span className="text-xs font-black text-white">82%</span>
                </div>
              </div>
            </div>

            {/* Speaking avatar visual wave overlay */}
            {(speaking || loading) && (
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-3 flex items-center gap-3 animate-pulse">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl flex-shrink-0 text-black font-black border border-amber-400/50">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-avatar-pulse" />
                  🤖
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-[8px] font-black uppercase text-amber-400 tracking-widest leading-none">AI Coach Broadcast</p>
                  <p className="text-[10px] text-gray-300 italic truncate max-w-[200px]">
                    {loading ? "Biomechanical overlay loading..." : `Speaking: ${personalities[activePersonality].name} Cues`}
                  </p>
                </div>
                {/* Equalizer waves */}
                <div className="flex items-end gap-0.5 h-6">
                  <div className="w-[2.5px] h-full bg-amber-500 rounded animate-wave-bar delay-1"></div>
                  <div className="w-[2.5px] h-full bg-amber-500 rounded animate-wave-bar delay-3"></div>
                  <div className="w-[2.5px] h-full bg-orange-500 rounded animate-wave-bar delay-2"></div>
                  <div className="w-[2.5px] h-full bg-amber-400 rounded animate-wave-bar delay-5"></div>
                  <div className="w-[2.5px] h-full bg-orange-600 rounded animate-wave-bar delay-4"></div>
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow-md flex-shrink-0 text-black font-bold">🤖</div>
                  )}
                  
                  <div className={`max-w-[88%] space-y-3.5 rounded-3xl p-4 border transition-all duration-300 ${
                    m.role === "user" 
                      ? "bg-amber-500/10 border-amber-500/25 text-white" 
                      : "bg-[#0b0c0b] border-white/10 text-gray-200"
                  }`}>
                    {m.isIntro ? (
                      <p className="text-xs font-semibold italic text-amber-400 leading-normal">{m.text}</p>
                    ) : m.role === "user" ? (
                      <p className="text-xs font-bold leading-normal">{m.text}</p>
                    ) : (
                      <>
                        {/* Render parsed markdown strategy cards */}
                        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                          <span className="text-[9px] text-amber-400 font-display font-black tracking-widest uppercase">
                            {m.coachEmoji} {m.coachName} Analysis
                          </span>
                          <span className="text-[8px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-black uppercase">DIAGNOSED</span>
                        </div>
                        
                        <MarkdownRenderer text={m.text} />
                        
                        {/* High density coaching statistics cards */}
                        {m.metrics && (
                          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center">
                            <div className="bg-white/5 border border-white/5 rounded-xl p-1.5">
                              <span className="text-[6px] text-gray-500 uppercase block font-black">Mistake Prob</span>
                              <span className="text-[10px] text-red-400 font-black">{m.metrics.mistakeProb}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-1.5">
                              <span className="text-[6px] text-gray-500 uppercase block font-black">Est. Improvement</span>
                              <span className="text-[10px] text-green-400 font-black">{m.metrics.improvement}</span>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-xl p-1.5">
                              <span className="text-[6px] text-gray-500 uppercase block font-black">Pro Reference</span>
                              <span className="text-[9px] text-amber-400 font-black truncate block">{m.metrics.proMatch.split(" ")[0]}</span>
                            </div>
                          </div>
                        )}
                        
                        <UnifiedActionBridge text={m.text} setPage={setPage} setSelectedScenario={setSelectedScenario} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action prompt grid (Compact redesign) */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">💡 Select Pitch Training Cues</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map(p => (
                    <button
                      key={p.title}
                      onClick={() => sendMessage(p.text)}
                      className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 rounded-2xl p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer flex flex-col justify-between h-20"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs font-black text-white">{p.emoji} {p.title}</span>
                        <span className="text-[7px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">{p.difficulty}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-snug line-clamp-2 mt-1">"{p.text}"</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Training Modes HUD */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">🏋️ Training Net Sessions</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {trainingModes.map(m => (
                    <button
                      key={m.name}
                      onClick={() => sendMessage(`Run net practice drill module for ${m.name}`)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-2 text-center transition-all cursor-pointer"
                    >
                      <span className="text-[9px] font-black text-white block truncate">{m.name}</span>
                      <span className="text-[6px] text-gray-500 uppercase mt-0.5 block truncate">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: AI VISION SCANNER */}
        {activeTab === "vision" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0c0d0c] to-black border border-white/10 rounded-3xl p-4 space-y-1">
              <h2 className="text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="camera" className="text-amber-400 w-4 h-4" /> AI Action Vision Scanner
              </h2>
              <p className="text-gray-400 text-[10px] leading-normal">
                Upload a snapshot or batting clip frame. Our dynamic biomechanics engine parses posture, head alignment, and hip swing in real-time.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => !visionLoading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 bg-white/5 relative"
            >
              {visionFile ? (
                <div className="relative">
                  <img src={visionFile} alt="Stance Preview" className="max-h-40 mx-auto rounded-2xl object-cover border border-amber-500/20 glow-gold" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setVisionFile(null); setVisionResult(null); }}
                    className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="text-amber-400 mx-auto w-12 h-12 flex items-center justify-center bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <Icon name="upload-cloud" className="w-6 h-6" />
                  </div>
                  <p className="text-gray-300 text-xs font-semibold">Select Batting/Bowling Screenshot</p>
                  <p className="text-gray-500 text-[10px] uppercase font-bold">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleVisionUpload}
                className="hidden"
                disabled={visionLoading}
              />
            </div>

            {visionLoading && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 glow-gold animate-pulse">
                <svg className="animate-spin h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-400 text-xs italic">Mapping skeleton joint coordinates...</span>
              </div>
            )}

            {/* Vision results panel */}
            {visionResult && !visionLoading && (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <p className="text-amber-400 font-display font-black text-xs uppercase tracking-widest">🔬 Biomechanical Vision Report</p>
                  <span className="text-[8px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-black uppercase">COMPLETED</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] text-gray-500 uppercase block font-black mb-1">Stance Balance Score</span>
                    <strong className="text-base text-white">{visionResult.balance}%</strong>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] text-gray-500 uppercase block font-black mb-1">Head Stability</span>
                    <strong className="text-xs text-green-400 font-black">{visionResult.head}</strong>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] text-gray-500 uppercase block font-black mb-1">Footwork Trigger</span>
                    <strong className="text-xs text-white font-black">{visionResult.footwork}</strong>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                    <span className="text-[8px] text-gray-500 uppercase block font-black mb-1">Swing Path Arc</span>
                    <strong className="text-xs text-amber-400 font-black">{visionResult.swingPath}</strong>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3">
                  <span className="text-[8px] text-amber-400 uppercase block font-black mb-1">⚡ Key Correction Cue</span>
                  <p className="text-xs leading-normal italic text-gray-200">"{visionResult.mistake}"</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: PRESSURE DECISION SIMULATOR (Viral Feature!) */}
        {activeTab === "simulator" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0c0d0c] to-black border border-white/10 rounded-3xl p-4 space-y-1">
              <h2 className="text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="award" className="text-amber-400 w-4 h-4" /> 18 Off 6 Wkt Bumrah Challenge
              </h2>
              <p className="text-gray-400 text-[10px] leading-normal">
                High-pressure match decider! 18 needed off the final over against Jasprit Bumrah. Pick your tactical shot and get graded by the AI Coach!
              </p>
            </div>

            {/* Challenge Stance */}
            {simStep === 0 ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-5 text-center space-y-3">
                  <span className="text-3xl block animate-bounce">🔥</span>
                  <p className="text-xs font-bold text-white leading-relaxed">
                    Bumrah spears in with an aggressive, side-on run-up. He is targeting a searing, tailing-in blockhole yorker at 144 km/h!
                  </p>
                  <p className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Select your tactical response shot:</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => playSimulatorShot(1)}
                    className="w-full text-left bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-2xl p-3.5 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-white">💥 Slog Sweep over deep mid-wicket</span>
                    <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase">HIGH RISK</span>
                  </button>
                  <button
                    onClick={() => playSimulatorShot(2)}
                    className="w-full text-left bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-2xl p-3.5 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-white">🏏 Inside-out lofted extra cover drive</span>
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">MODERATE</span>
                  </button>
                  <button
                    onClick={() => playSimulatorShot(3)}
                    className="w-full text-left bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-2xl p-3.5 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-white">⚡ Straight lofted punch down the ground</span>
                    <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-black uppercase">TACTICAL</span>
                  </button>
                  <button
                    onClick={() => playSimulatorShot(4)}
                    className="w-full text-left bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-2xl p-3.5 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-white">🐢 Late scoop past short third-man</span>
                    <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-black uppercase">AUDACIOUS</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <p className="text-amber-400 font-display font-black text-xs uppercase tracking-widest">🏆 Decision Outcome & Grading</p>
                  <span className="text-[8px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-black uppercase">EVALUATED</span>
                </div>

                <p className="text-xs leading-relaxed text-gray-200">{simResult}</p>

                <button
                  onClick={() => { setSimStep(0); setSelectedShot(null); setSimResult(null); }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-display font-black text-xs uppercase tracking-wider py-3 rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  🔄 Try Again / Next Delivery
                </button>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Compact ChatGPT-Style Voice Dock */}
      {activeTab === "chat" && (
        <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent px-4 py-3 border-t border-white/5 z-20">
          <div className="flex gap-2 max-w-md mx-auto items-center">
            
            {/* Embedded Mic Text input dock */}
            <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-1.5 focus-within:border-amber-500/50 transition-all duration-300">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Describe batting problem..."
                className="flex-1 bg-transparent border-0 text-white text-xs placeholder-gray-500 focus:outline-none h-9"
                disabled={loading}
              />
              <button
                onClick={listening ? stopListening : startListening}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border ${
                  listening
                    ? "bg-red-500 animate-pulse border-red-400 shadow-md shadow-red-500/20 text-white"
                    : "text-gray-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                <Icon name={listening ? "mic-off" : "mic"} className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-2xl flex items-center justify-center text-black flex-shrink-0 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
          </div>
          {listening && <p className="text-[10px] text-red-400 font-bold text-center mt-2 animate-pulse uppercase tracking-wider">🎙️ AI listening... Describe your pitch struggle!</p>}
        </div>
      )}
    </div>
  );
}
