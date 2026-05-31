import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/Icon';
import { callGeminiApi } from '../utils/gemini';
import { SIMULATOR } from '../utils/simulator';
import { db, firebase } from '../utils/firebase';
import { useVoiceInput, speakText } from '../utils/voice';

export default function CommentaryPage({ apiKey, voiceActive }) {
  const [customDescription, setCustomDescription] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStyle, setActiveStyle] = useState("shastri"); // "shastri", "bhogle", "ipl", "radio"
  const [crowdActive, setCrowdActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  // Dynamic Live Scoreboard Simulation State
  const [runs, setRuns] = useState(192);
  const [wickets, setWickets] = useState(4);
  const [balls, setBalls] = useState(214); // 35 * 6 + 4 = 214 balls (35.4 overs)
  const [bat1Runs, setBat1Runs] = useState(82);
  const [bat1Balls, setBat1Balls] = useState(51);
  const [bat2Runs, setBat2Runs] = useState(45);
  const [bat2Balls, setBat2Balls] = useState(28);
  const [bowlerBalls, setBowlerBalls] = useState(22); // 3.4 overs * 6 = 22 balls
  const [bowlerRuns, setBowlerRuns] = useState(38);
  const [bowlerWickets, setBowlerWickets] = useState(1);
  const [momentum, setMomentum] = useState(68); // India dominance percentage

  const crowdAudioRef = useRef(null);

  const { listening, startListening, stopListening } = useVoiceInput(t => setCustomDescription(t));

  // Stadium Sound System
  useEffect(() => {
    if (crowdActive) {
      crowdAudioRef.current = new Audio('https://www.soundjay.com/misc/sounds/stadium-crowd-1.mp3');
      crowdAudioRef.current.loop = true;
      crowdAudioRef.current.volume = 0.25;
      crowdAudioRef.current.play().catch(e => console.log("Crowd sound auto-play blocked: ", e));
    } else {
      if (crowdAudioRef.current) {
        crowdAudioRef.current.pause();
        crowdAudioRef.current = null;
      }
    }
    return () => {
      if (crowdAudioRef.current) {
        crowdAudioRef.current.pause();
      }
    };
  }, [crowdActive]);

  // Track speech playing state to sync animated waveforms
  const triggerSpeakText = (text) => {
    if (!voiceActive) return;
    setSpeaking(true);
    speakText(text, true);
    
    // Estimate speaking duration based on word count (~150 words per minute)
    const wordCount = text.split(" ").length;
    const durationMs = (wordCount / 150) * 60 * 1000 + 1000;
    
    setTimeout(() => {
      setSpeaking(false);
    }, durationMs);
  };

  const commentaryStyles = {
    shastri: {
      name: "Ravi Shastri",
      emoji: "🎙️",
      desc: "High energy, electrifying catchphrases, bold voice",
      prompt: `You are Ravi Shastri — the legendary, electrifying, high-energy live cricket commentator. Generate exactly 2-3 sentences of cricket commentary. 
      Use highly enthusiastic tone and iconic Shastri catchphrases like "Down the track!", "Like a tracer bullet!", "That is massive!", "In the air... and taken!", "Absolutely outstanding!". 
      Occasionally mix short, extremely energetic Hindi catchphrases naturally (e.g. "Arre baap re!", "Kya lajawab shot tha!"). Max 50 words. Return ONLY the commentary text.`
    },
    bhogle: {
      name: "Harsha Bhogle",
      emoji: "🧐",
      desc: "Poetic, warm, highly analytical, elegant cadence",
      prompt: `You are Harsha Bhogle — the poetic, eloquent, and highly analytical cricket commentator. Generate exactly 2-3 sentences of commentary.
      Focus on timing, sweet spot of the bat, body balance, wrists roll, and tactical field placement. Speak with elegance and a warm, intellectual tone.
      Occasionally inject gentle Hindi phrases gracefully (e.g. "Kitna sunehra shot hai!", "Lajawab timing!"). Max 50 words. Return ONLY the commentary text.`
    },
    ipl: {
      name: "IPL Hype",
      emoji: "⚡",
      desc: "Maximum volume, rapid pace, hyperactive stadium buzz",
      prompt: `You are a hyper-energetic, high-octane IPL-style stadium commentator. Generate exactly 2-3 sentences of commentary.
      Speak with extreme vocal volume, calling it "DLF Maximum!", "Tata Punch Super Striker!", "Absolute absolute carnage in the stadium!".
      Pace must be rapid, using dramatic Hinglish phrases (e.g. "O teri! Ball directly into the stand!", "Kamaal ka shot, gazab ka chakka!"). Max 50 words. Return ONLY the commentary text.`
    },
    radio: {
      name: "Classic Radio",
      emoji: "📻",
      desc: "Vintage 1980s broadcast, traditional ball-by-ball detailing",
      prompt: `You are a classic vintage British-Indian radio commentator from the 1980s. Generate exactly 2-3 sentences of highly traditional ball-by-ball description.
      Focus on wind direction, exact field adjustments, technical stance mechanics, and classic terms (e.g. "tucked away off the hips", "a fine leg glance", "lovely piece of fielding at cover-point").
      Do not use modern hype terms. Speak with calm, traditional elegance. Max 50 words. Return ONLY the commentary text.`
    }
  };

  const eventTriggers = [
    { label: "Six", event: "Batsman dances down the track, hits a massive flat six straight over long-on, ball landing in the 3rd tier crowd!", emoji: "💥", type: "six" },
    { label: "Four", event: "Elegant cover drive boundary. Batsman leans perfectly into the pitch, hitting the sweet spot through gaps.", emoji: "⚡", type: "four" },
    { label: "Wicket", event: "Bowler spears in a searing yorker on off-stump, batsman late, stumps flying out of the ground!", emoji: "🔴", type: "wicket" },
    { label: "Dot Ball", event: "Cracking toe-crushing blockhole delivery under pressure, batsman jammed inside crease, dot ball pressure builds up.", emoji: "⚪", type: "dot" },
    { label: "No Ball", event: "Bowler oversteps the crease massively, sirens go off, free hit coming up next ball!", emoji: "🟨", type: "noball" },
    { label: "Wide", event: "Bowler sprays it well wide of off-stump under pressure.", emoji: "🟣", type: "wide" },
    { label: "LBW Appeal", event: "Huge appeal for LBW, umpire shakes head, captain signals review, third umpire checking UltraEdge!", emoji: "🎥", type: "review" },
    { label: "Century", event: "Batsman completes a glorious century, raises bat as stadium crowd goes completely wild!", emoji: "🏆", type: "century" },
  ];

  const updateScorecard = (type) => {
    // Increment ball counts
    if (type !== "noball" && type !== "wide") {
      setBalls(prev => prev + 1);
      setBowlerBalls(prev => prev + 1);
      setBat1Balls(prev => prev + 1);
    }

    if (type === "six") {
      setRuns(prev => prev + 6);
      setBat1Runs(prev => prev + 6);
      setBowlerRuns(prev => prev + 6);
      setMomentum(prev => Math.min(prev + 7, 95));
    } else if (type === "four") {
      setRuns(prev => prev + 4);
      setBat1Runs(prev => prev + 4);
      setBowlerRuns(prev => prev + 4);
      setMomentum(prev => Math.min(prev + 4, 90));
    } else if (type === "wicket") {
      setWickets(prev => prev + 1);
      setBowlerWickets(prev => prev + 1);
      // Simulate fresh batsman coming in
      setBat1Runs(0);
      setBat1Balls(0);
      setMomentum(prev => Math.max(prev - 12, 10));
    } else if (type === "century") {
      setRuns(prev => prev + 1);
      setBat1Runs(prev => prev + 1);
      setBowlerRuns(prev => prev + 1);
      setMomentum(prev => Math.min(prev + 5, 95));
    } else if (type === "wide" || type === "noball") {
      setRuns(prev => prev + 1);
      setBowlerRuns(prev => prev + 1);
    } else if (type === "dot") {
      setMomentum(prev => Math.max(prev - 3, 20));
    }
  };

  const generateCommentary = async (presetEvent = null, type = null) => {
    const queryText = presetEvent || customDescription;
    if (!queryText.trim() || loading) return;

    setLoading(true);
    setCustomDescription("");
    
    if (type) {
      updateScorecard(type);
    }

    const currentStyle = commentaryStyles[activeStyle];

    try {
      let commentaryText = "";
      if (apiKey) {
        commentaryText = await callGeminiApi(
          currentStyle.prompt,
          `Scoreboard: IND vs AUS, Score: ${Math.floor(runs)}/${wickets} in ${Math.floor(balls / 6)}.${balls % 6} overs. Strike Batsman: Virat Kohli, Non-Strike: Rishabh Pant. Bowler: Mitchell Starc. Event to describe: ${queryText}`,
          apiKey
        );
      } else {
        // Fallback simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        commentaryText = SIMULATOR.commentary(queryText);
      }

      // Sync to Firebase
      if (db) {
        db.collection("commentaries").add({
          event: queryText,
          commentary: commentaryText,
          style: currentStyle.name,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.error("Firestore sync failed: ", e));
      }

      // Speak & Set Speaking indicator
      triggerSpeakText(commentaryText);

      const timeStamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      
      setFeed(prev => [
        {
          event: queryText,
          commentary: commentaryText,
          style: currentStyle.name,
          styleEmoji: currentStyle.emoji,
          time: timeStamp,
          overs: `${Math.floor(balls / 6)}.${balls % 6}`
        },
        ...prev
      ]);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format overs helper
  const formattedOvers = `${Math.floor(balls / 6)}.${balls % 6}`;
  const formattedBowlerOvers = `${Math.floor(bowlerBalls / 6)}.${bowlerBalls % 6}`;

  return (
    <div className="flex flex-col h-full animate-fadeIn bg-black text-white relative">
      {/* Self-contained CSS Animations for wave bouncing */}
      <style>{`
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

      {/* 1. Header & Live score bar */}
      <div className="px-4 py-3 bg-gradient-to-b from-[#0a0f0a] to-[#020502] border-b border-white/10 flex items-center justify-between flex-shrink-0 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Live mic</span>
        </div>
        
        {/* Match Score Badge */}
        <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-center">
          <span className="text-xs font-display font-black text-white">
            IND <span className="text-amber-400">{runs}/{wickets}</span> vs AUS
          </span>
          <span className="text-[10px] text-gray-400 ml-2 font-bold">{formattedOvers} Ov</span>
        </div>
        
        {/* Sound Ambience Button */}
        <button
          onClick={() => setCrowdActive(!crowdActive)}
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-all duration-300 ${
            crowdActive 
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40 glow-gold animate-pulse" 
              : "bg-white/5 text-gray-400 border-white/5"
          }`}
        >
          <Icon name="volume-2" className="w-3 h-3" /> Crowd
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-4">
        
        {/* 2. Interactive Scoreboard & Momentum Panel */}
        <div className="bg-gradient-to-br from-[#0c0d0c] to-black border border-white/5 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Batsmen</p>
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1">
                  🏏 Virat Kohli <span className="text-amber-400 font-black">{bat1Runs}*</span> <span className="text-[10px] text-gray-500">({bat1Balls})</span>
                </p>
                <p className="text-gray-400 text-[11px]">
                  Rishabh Pant <span className="text-gray-200 font-bold">{bat2Runs}</span> <span className="text-[10px] text-gray-500">({bat2Balls})</span>
                </p>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Current Bowler</p>
              <p className="font-bold text-white">Mitchell Starc</p>
              <p className="text-[11px] text-gray-400">
                {formattedBowlerOvers} Ov • <span className="text-amber-400">{bowlerRuns}</span> Runs • <span className="text-red-400">{bowlerWickets}</span> Wkt
              </p>
            </div>
          </div>

          {/* Dominance Momentum Bar */}
          <div className="space-y-1 pt-1.5 border-t border-white/5">
            <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 tracking-wider">
              <span>IND Dominance ({momentum}%)</span>
              <span>AUS ({100 - momentum}%)</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500" 
                style={{ width: `${momentum}%` }}
              />
              <div 
                className="bg-neutral-800 h-full transition-all duration-500" 
                style={{ width: `${100 - momentum}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Commentary Style Customizer (Viral!) */}
        <div className="space-y-2">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase">🎙️ Choose Commentary Voice Style</p>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.keys(commentaryStyles).map(key => {
              const styleObj = commentaryStyles[key];
              const isSelected = activeStyle === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveStyle(key);
                    speakText(`Switched to ${styleObj.name} style.`, voiceActive);
                  }}
                  className={`rounded-2xl py-2 px-1 text-center transition-all duration-300 border flex flex-col items-center justify-center cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/5 font-black scale-[1.03]" 
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="text-base mb-1">{styleObj.emoji}</span>
                  <span className="text-[9px] truncate max-w-full font-bold uppercase leading-none">{styleObj.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Dynamic CSS Audio Waveform & speaking indicator */}
        {(speaking || loading) && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                {loading ? "Generating voice..." : `AI ${commentaryStyles[activeStyle].name} Speaking...`}
              </p>
            </div>
            
            {/* Visual Equalizer bounce wave */}
            <div className="flex items-end gap-0.5 h-6">
              <div className="w-[3px] h-full bg-amber-500 rounded animate-wave-bar delay-1"></div>
              <div className="w-[3px] h-full bg-amber-500 rounded animate-wave-bar delay-3"></div>
              <div className="w-[3px] h-full bg-orange-500 rounded animate-wave-bar delay-2"></div>
              <div className="w-[3px] h-full bg-amber-400 rounded animate-wave-bar delay-5"></div>
              <div className="w-[3px] h-full bg-orange-600 rounded animate-wave-bar delay-4"></div>
              <div className="w-[3px] h-full bg-amber-500 rounded animate-wave-bar delay-1"></div>
            </div>
          </div>
        )}

        {/* 5. Cleaned Event Triggers */}
        <div>
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase mb-2">⚡ Stadium Triggers</p>
          <div className="grid grid-cols-4 gap-2">
            {eventTriggers.map(t => (
              <button
                key={t.label}
                onClick={() => generateCommentary(t.event, t.type)}
                disabled={loading}
                className="bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-white rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] duration-200"
              >
                <span className="text-base mb-1.5">{t.emoji}</span>
                <span className="text-[9px] font-bold tracking-wider uppercase leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Commentary Scrolling Feed */}
        <div className="space-y-3.5">
          <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase mb-1">📢 Commentary Feed</p>
          
          {feed.map((f, i) => (
            <div
              key={i}
              className={`rounded-3xl p-4 border transition-all duration-300 animate-fadeIn ${
                i === 0
                  ? "bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-black border-amber-500/30 glow-gold"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span>🕐 {f.time}</span>
                  <span className="text-gray-600">•</span>
                  <span>{f.overs} Ov</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-amber-500/80 font-black">{f.styleEmoji} {f.style}</span>
                </span>
                {i === 0 && (
                  <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse uppercase tracking-wider">LIVE MIC</span>
                )}
              </div>
              
              <p className={`text-xs leading-relaxed font-medium ${i === 0 ? "text-amber-100 font-bold" : "text-gray-300"}`}>
                "{f.commentary}"
              </p>
              
              <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[9px] text-gray-500">
                <span className="truncate italic flex-1 max-w-[200px]">Trigger: {f.event}</span>
                <button
                  onClick={() => triggerSpeakText(f.commentary)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-black border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase transition-all"
                >
                  <Icon name="volume-2" className="w-2.5 h-2.5" /> Replay
                </button>
              </div>
            </div>
          ))}

          {feed.length === 0 && !loading && (
            <div className="text-center py-10 bg-white/5 border border-white/5 rounded-3xl">
              <div className="text-amber-400 mx-auto w-12 h-12 flex items-center justify-center bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-3 animate-pulse">
                <Icon name="radio" className="w-6 h-6" />
              </div>
              <p className="text-gray-400 text-xs font-semibold">Live Mic Silent</p>
              <p className="text-gray-500 text-[10px] mt-1 max-w-[200px] mx-auto">Click any of the stadium event triggers above or speak into the microphone to launch commentary.</p>
            </div>
          )}
        </div>

      </div>

      {/* 7. Rounded Modern Input Bar with Inline mic */}
      <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent px-4 py-3 border-t border-white/5 z-20">
        <div className="flex gap-2 max-w-md mx-auto items-center">
          
          {/* Rounded Input Wrapper with nested Mic button */}
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-1.5 focus-within:border-amber-500/50 transition-all duration-300">
            <input
              value={customDescription}
              onChange={e => setCustomDescription(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") generateCommentary();
              }}
              placeholder="Describe event..."
              className="flex-1 bg-transparent border-0 text-white text-xs placeholder-gray-500 focus:outline-none h-9"
            />
            
            {/* Embedded microphone trigger inside the input bar */}
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
          
          {/* Send commentary button */}
          <button
            onClick={() => generateCommentary()}
            disabled={!customDescription.trim() || loading}
            className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-2xl flex items-center justify-center text-black flex-shrink-0 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Icon name="play" className="w-4 h-4" />
          </button>
        </div>
        {listening && <p className="text-[10px] text-red-400 font-bold text-center mt-2 animate-pulse uppercase tracking-wider">🎙️ AI listening... Speak stadium action now!</p>}
      </div>
    </div>
  );
}
