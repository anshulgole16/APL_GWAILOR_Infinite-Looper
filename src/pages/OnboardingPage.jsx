import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { speakText } from '../utils/voice';

// Web Audio API Sound Synthesizer (Resilient browser-native audio without asset dependencies)
const playSound = (type, enabled) => {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'scan') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'success') {
      // Premium ascending major chord chime
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        g.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        o.start(ctx.currentTime + idx * 0.08);
        o.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === 'beep') {
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (err) {
    console.warn("Web Audio API blocked or not supported", err);
  }
};

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const wasLoggedOut = localStorage.getItem("CRICMIND_LOGGED_OUT") === "true";
      if (wasLoggedOut) {
        localStorage.removeItem("CRICMIND_LOGGED_OUT");
        return 2;
      }
    }
    return 1;
  }); // 1: Splash Screen, 2: Split Welcome/Auth Screen, 3: Role, 4: Skills, 5: Biomechanical DNA Scanner
  const [emailForm, setEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Login vs Signup inside email
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom states for premium welcome polish
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [authError, setAuthError] = useState("");

  const getUsersFromDb = () => {
    try {
      return JSON.parse(localStorage.getItem("CRICMIND_USERS")) || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setAuthError("");
  }, [isRegistering, signupData.email, signupData.password]);
  
  // Immersive Transition Overlay state
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeProgress, setFinalizeProgress] = useState(0);
  const [finalizeLog, setFinalizeLog] = useState("Initializing neural network modules...");

  // Onboarding parameters
  const [selectedRole, setSelectedRole] = useState("batter");
  const [skills, setSkills] = useState({ timing: 75, power: 65, spinControl: 60, footwork: 70 });
  const [weakness, setWeakness] = useState("spin"); // "spin", "yorkers", "shortball", "pressure"
  
  // DNA Scanner Loading States
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState("Initializing biomechanical mapping...");
  const [dnaProfile, setDnaProfile] = useState(null);

  const greetings = [
    "Welcome to CricMind AI",
    "Build Your Cricket DNA",
    "Train Smarter. Play Sharper.",
    "AI Coach is Online"
  ];

  const dailyInsights = [
    "Batters struggle most against yorkers under pressure during death overs.",
    "Spin control improves by 18% when head position remains level at release.",
    "Cover drives are 2.5x more reliable when your front shoulder guides the swing path.",
    "Express seamers rely heavily on wrist snap velocity rather than pure arm speed."
  ];

  const previewRoles = [
    { id: "batter", label: "Batter", emoji: "🏏", desc: "Timing & cover drives" },
    { id: "bowler", label: "Bowler", emoji: "🎯", desc: "Outswing & death cutters" },
    { id: "allrounder", label: "All-Rounder", emoji: "⚡", desc: "Dual utility match threat" }
  ];

  const handleGoogleClick = () => {
    if (googleLoading) return;
    playSound('click', soundEnabled);
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      handleAuthComplete("Anshul");
    }, 1200);
  };

  // Screen 1: Splash Screen 2-second auto-transition
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
        playSound('success', soundEnabled);
        speakText("Welcome to CricMind AI. Let's configure your cricket operating system.", true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Rotations for greeting and insights
  useEffect(() => {
    if (step === 2) {
      const gTimer = setInterval(() => {
        setGreetingIndex(prev => (prev + 1) % greetings.length);
      }, 3500);
      const iTimer = setInterval(() => {
        setInsightIndex(prev => (prev + 1) % dailyInsights.length);
      }, 5000);
      return () => {
        clearInterval(gTimer);
        clearInterval(iTimer);
      };
    }
  }, [step]);

  // Screen 5: Dynamic DNA Scanning simulation
  useEffect(() => {
    if (step === 5 && scanProgress < 100) {
      const texts = [
        "Initializing biomechanical mapping...",
        "Parsing joint-coordinate posture files...",
        "Evaluating timing accuracy and backlift arcs...",
        "Correlating stats vs professional league benchmarks...",
        "Compiling Cricket IQ index..."
      ];
      
      const interval = setInterval(() => {
        setScanProgress(prev => {
          const next = prev + 5;
          const textIdx = Math.min(texts.length - 1, Math.floor((next / 100) * texts.length));
          setScanText(texts[textIdx]);
          playSound('beep', soundEnabled);
          
          if (next >= 100) {
            clearInterval(interval);
            playSound('success', soundEnabled);
            generateDnaProfile();
          }
          return next;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step, scanProgress]);

  // Immersive transition simulator
  useEffect(() => {
    if (isFinalizing) {
      const logs = [
        "Connecting with coach telemetry layers...",
        "Establishing realtime batting model pipelines...",
        "Generating initial performance charts...",
        "Synthesizing personal drill schedules...",
        "Ecosystem ready. Launching practice arena!"
      ];
      const timer = setInterval(() => {
        setFinalizeProgress(prev => {
          const next = prev + 10;
          const logIdx = Math.min(logs.length - 1, Math.floor((next / 100) * logs.length));
          setFinalizeLog(logs[logIdx]);
          playSound('click', soundEnabled);
          if (next >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              localStorage.setItem("CRICMIND_ONBOARDED", "true");
              
              // Save registered user to database
              if (isRegistering) {
                const users = getUsersFromDb();
                const newUser = {
                  name: signupData.name,
                  email: signupData.email.toLowerCase(),
                  password: signupData.password,
                  role: selectedRole,
                  skills: skills,
                  weakness: weakness,
                  dna: dnaProfile
                };
                const updatedUsers = [...users.filter(u => u.email !== newUser.email), newUser];
                localStorage.setItem("CRICMIND_USERS", JSON.stringify(updatedUsers));
                localStorage.setItem("CRICMIND_CURRENT_USER", JSON.stringify(newUser));
                localStorage.setItem("CRICMIND_PLAYER_NAME", newUser.name);
              }
              onComplete();
            }, 600);
          }
          return next;
        });
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isFinalizing]);

  const generateDnaProfile = () => {
    const rolesMap = {
      batter: "Aggressive Middle-Order Anchor",
      bowler: "Express Outswing Specialist",
      allrounder: "Dynamic Match Finisher",
      keeper: "Reflex Stumping Legend",
      captain: "Tactical Strategic Mind"
    };

    const avgSkill = Math.round((skills.timing + skills.power + skills.spinControl + skills.footwork) / 4);
    const calculatedIQ = 80 + Math.round(avgSkill / 6);

    const insightMap = {
      spin: "Your timing profile resembles Suryakumar Yadav. High wrist snap velocity, but head tilts 6° outside off-stump against leg-spin.",
      yorkers: "Highly stable stance. However, backfoot knee remains straight at point of release, making you vulnerable to toe-crushing yorkers.",
      shortball: "Excellent forearm flex. But your center of gravity shifts too far onto your heels, making you hook short deliveries blindly.",
      pressure: "Great wrist-work. Although stroke rotation drops by 14% after over 12 when required run rate crosses 9.20."
    };

    setDnaProfile({
      iq: calculatedIQ,
      archetype: rolesMap[selectedRole] || "Balanced Cricketer",
      weaknessScore: 100 - skills.spinControl,
      insight: insightMap[weakness]
    });
    
    speakText(`DNA Scan complete. Your Cricket IQ is ${calculatedIQ}. Archetype: ${rolesMap[selectedRole]}.`, true);
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    playSound('click', soundEnabled);
    speakText(`Selected ${roleId} role.`, true);
  };

  const handleAuthComplete = (username = "Cricketer") => {
    localStorage.setItem("CRICMIND_PLAYER_NAME", username);
    setStep(3);
    playSound('success', soundEnabled);
    speakText("Identity confirmed. Choose your cricket role.", true);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "Empty", percent: 0, color: "bg-white/10" };
    if (pass.length < 5) return { label: "Weak", percent: 30, color: "bg-red-500" };
    if (pass.length < 8) return { label: "Medium", percent: 65, color: "bg-amber-500" };
    return { label: "Elite", percent: 100, color: "bg-emerald-500" };
  };

  const passStrength = getPasswordStrength(signupData.password);

  return (
    <div className="h-full w-full bg-[#030603] text-white relative overflow-hidden flex flex-col justify-between font-display select-none">
      
      {/* Immersive Stadium Spotlight & Fog Animation CSS */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.1; }
          50% { transform: translateY(-20px) scale(1.15); opacity: 0.25; }
        }
        @keyframes breathing {
          0%, 100% { transform: scale(0.96); filter: drop-shadow(0 0 10px rgba(245,158,11,0.25)); opacity: 0.85; }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 30px rgba(245,158,11,0.6)); opacity: 1; }
        }
        @keyframes rotate-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotate-counter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes sweep {
          0%, 100% { transform: rotate(-25deg); opacity: 0.15; }
          50% { transform: rotate(25deg); opacity: 0.35; }
        }
        .stadium-fog-glow {
          background: radial-gradient(circle at 50% -10%, rgba(21,128,61,0.15) 0%, transparent 75%);
        }
        .animate-spotlight {
          transform-origin: top center;
          animation: sweep 12s infinite ease-in-out;
        }
        .animate-float-particles {
          animation: float-slow 10s infinite ease-in-out;
        }
        .animate-orb-breath {
          animation: breathing 3.5s infinite ease-in-out;
        }
        .animate-rotate-ring-fast {
          animation: rotate-clockwise 4s infinite linear;
        }
        .animate-rotate-ring-slow {
          animation: rotate-counter 12s infinite linear;
        }
        @keyframes scan-line {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scan-line {
          animation: scan-line 2.2s infinite linear;
        }
        @keyframes pulse-radial {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.3); opacity: 0.3; }
        }
        .animate-pulse-radial {
          animation: pulse-radial 6s infinite ease-in-out;
        }
      `}</style>

      {/* DYNAMIC STADIUM BACKGROUND LAYERS (spotlights, particles, fog) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Stadium green fog */}
        <div className="absolute inset-0 stadium-fog-glow" />
        
        {/* Pulsing ambient dark glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse-radial" />
        
        {/* Stadium Spotlights sweep */}
        <div className="absolute top-0 left-1/4 w-[120px] h-[300px] bg-gradient-to-b from-emerald-500/20 to-transparent blur-2xl animate-spotlight" />
        <div className="absolute top-0 right-1/4 w-[100px] h-[350px] bg-gradient-to-b from-amber-500/10 to-transparent blur-2xl animate-spotlight" style={{ animationDelay: "-3s" }} />

        {/* Floating CSS particles */}
        <div className="absolute inset-0 opacity-20 animate-float-particles" style={{
          backgroundImage: "radial-gradient(circle at 15% 25%, #f59e0b 2px, transparent 2px), radial-gradient(circle at 85% 75%, #10b981 3px, transparent 3px), radial-gradient(circle at 50% 60%, #fff 1.5px, transparent 1.5px)"
        }} />
      </div>

      {/* Global Muted / Speaker Toggle (Top-Right HUD bar) */}
      {step > 1 && !isFinalizing && (
        <div className="absolute top-4 right-4 z-40">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-xs text-gray-400 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <span>{soundEnabled ? "🔊" : "🔇"}</span>
          </button>
        </div>
      )}

      {/* SCREEN 1: SPLASH SCREEN */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
          {/* Main Breathing Logo Orb */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer rings */}
            <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-rotate-ring-slow" />
            <div className="absolute inset-1.5 border border-dashed border-emerald-500/30 rounded-full animate-rotate-ring-fast" />
            
            {/* Core ball */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-2xl border border-white/20 animate-orb-breath">
              🏏
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">CricMind AI</h1>
            <p className="text-[9px] text-amber-400 font-black tracking-widest uppercase">The AI Operating System for Cricketers</p>
          </div>
          
          {/* Loading Indicator */}
          <div className="flex gap-1.5 pt-8">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {/* SCREEN 2: SPLIT WELCOME / AUTH SCREEN */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between px-6 py-6 relative z-10 animate-fadeIn h-full">
          
          {/* TOP SECTION: Logo & Animated AI Orb */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🏏</span>
              <span className="text-xs font-black tracking-widest uppercase text-white leading-none">CricMind AI</span>
            </div>
            
            {/* Animated Sphere Avatar */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border border-amber-500/30 rounded-full animate-rotate-ring-slow" />
              <div className="absolute inset-1 border border-dotted border-emerald-500/40 rounded-full animate-rotate-ring-fast" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm shadow-lg animate-orb-breath">
                🤖
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: Smart Greeting, Strips & Dynamic Forms */}
          <div className="my-auto space-y-4">
            
            {/* Heading & Subheading Container */}
            <div className="space-y-1 text-center">
              <span className="text-[9px] text-amber-400 font-black tracking-widest uppercase block animate-fadeIn h-4">
                {greetings[greetingIndex]}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">
                Train Smarter.<br/>Play Sharper.
              </h2>
            </div>

            {/* AI Stats strip */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto">
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-300">
                <span>🔥</span> <span>120K+ Analyses</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-300">
                <span>📈</span> <span>87% Consistency</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/15" />
              <div className="flex items-center gap-1 text-[8px] font-bold text-gray-300">
                <span>🏏</span> <span>Real-Time IQ</span>
              </div>
            </div>

            {/* Dynamic Card Area (Email Setup vs Actions Room) */}
            {emailForm ? (
              <div className="bg-[#0b0c0b]/90 border border-white/10 rounded-3xl p-5 space-y-3.5 animate-fadeIn max-w-sm mx-auto w-full shadow-2xl backdrop-blur-md relative">
                
                {/* Back / Title */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest">
                    {isRegistering ? "CREATE CRICMIND DNA" : "AUTHENTICATE TELEMETRY"}
                  </span>
                  <button 
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setEmailForm(false);
                    }} 
                    className="text-gray-500 hover:text-white text-xs font-black cursor-pointer px-1"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Input Fields */}
                <div className="space-y-3">
                  {isRegistering && (
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">👤</span>
                      <input
                        type="text"
                        placeholder="Player Name (e.g. Anshul)"
                        value={signupData.name}
                        onChange={e => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-black/60 border border-white/10 focus:border-amber-400 focus:shadow-[0_0_10px_rgba(245,158,11,0.15)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">📧</span>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={e => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-black/60 border border-white/10 focus:border-amber-400 focus:shadow-[0_0_10px_rgba(245,158,11,0.15)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Security Password"
                      value={signupData.password}
                      onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-black/60 border border-white/10 focus:border-amber-400 focus:shadow-[0_0_10px_rgba(245,158,11,0.15)] rounded-xl pl-9 pr-20 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
                    />
                    
                    {/* Password Show Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', soundEnabled);
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-gray-500 hover:text-white cursor-pointer px-1.5 py-0.5"
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {signupData.password && (
                    <div className="space-y-1 animate-fadeIn">
                      <div className="flex justify-between text-[8px] font-bold text-gray-500">
                        <span>PASSWORD STRENGTH</span>
                        <span className="uppercase font-black text-white">{passStrength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passStrength.color} transition-all duration-300`} 
                          style={{ width: `${passStrength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error feedback notice */}
                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-2.5 text-[9px] font-bold text-center uppercase tracking-wide animate-fadeIn">
                      ⚠️ {authError}
                    </div>
                  )}
                </div>

                {/* Submit Email Button */}
                <button
                  onClick={() => {
                    if (emailLoading) return;
                    playSound('click', soundEnabled);
                    
                    if (isRegistering) {
                      // Check if email already registered
                      const users = getUsersFromDb();
                      const exists = users.find(u => u.email.toLowerCase() === signupData.email.toLowerCase());
                      if (exists) {
                        playSound('error', soundEnabled);
                        setAuthError("Email already registered. Please login.");
                        return;
                      }
                      setEmailLoading(true);
                      setTimeout(() => {
                        setEmailLoading(false);
                        handleAuthComplete(signupData.name || "Anshul");
                      }, 1000);
                    } else {
                      // Login Mode: Check credentials
                      const users = getUsersFromDb();
                      const user = users.find(u => u.email.toLowerCase() === signupData.email.toLowerCase());
                      if (!user) {
                        playSound('error', soundEnabled);
                        setAuthError("Profile not found. Please register first.");
                        return;
                      }
                      if (user.password !== signupData.password) {
                        playSound('error', soundEnabled);
                        setAuthError("Incorrect password. Please try again.");
                        return;
                      }
                      
                      // Success! Load credentials
                      setEmailLoading(true);
                      setTimeout(() => {
                        setEmailLoading(false);
                        localStorage.setItem("CRICMIND_CURRENT_USER", JSON.stringify(user));
                        localStorage.setItem("CRICMIND_PLAYER_NAME", user.name);
                        
                        if (user.role) setSelectedRole(user.role);
                        if (user.skills) setSkills(user.skills);
                        if (user.weakness) setWeakness(user.weakness);
                        if (user.dna) setDnaProfile(user.dna);
                        
                        setIsFinalizing(true);
                        speakText(`Welcome back, ${user.name}. Loading your performance dashboard.`, true);
                      }, 1000);
                    }
                  }}
                  disabled={isRegistering ? (!signupData.name || signupData.password.length < 5) : (!signupData.email || signupData.password.length < 5)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-30 text-black font-black text-[10px] uppercase py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {emailLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isRegistering ? "CREATE PROFILE & SCAN DNA" : "CONFIRM TELEMETRY ACCESS"}</span>
                  )}
                </button>

                {/* Toggle Register vs Login */}
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setIsRegistering(!isRegistering);
                  }}
                  className="w-full text-center text-gray-500 hover:text-gray-300 text-[8px] font-bold uppercase tracking-wider block"
                >
                  {isRegistering ? "Already have a profile? Login" : "Need a professional profile? Register"}
                </button>
              </div>
            ) : (
              /* Welcome Core HUD buttons */
              <div className="space-y-4 max-w-sm mx-auto w-full">
                
                {/* Mini Role Preview Cards for emotional onboarding */}
                <div className="space-y-1.5">
                  <p className="text-[8px] text-amber-400 font-black tracking-widest uppercase text-center">🎯 Choose Your Tactical Focus</p>
                  <div className="flex gap-2">
                    {previewRoles.map(pr => (
                      <button
                        key={pr.id}
                        onClick={() => {
                          setSelectedRole(pr.id);
                          playSound('click', soundEnabled);
                        }}
                        className={`flex-1 bg-white/5 border rounded-2xl p-2.5 text-center transition-all duration-300 hover:scale-[1.03] cursor-pointer ${
                          selectedRole === pr.id 
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5 scale-[1.02]" 
                            : "border-white/5"
                        }`}
                      >
                        <span className="text-xl block mb-0.5">{pr.emoji}</span>
                        <span className="text-[9px] text-white font-black block leading-none">{pr.label}</span>
                        <span className="text-[6px] text-gray-500 block truncate mt-0.5">{pr.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Actions Grid */}
                <div className="space-y-2 max-w-xs mx-auto w-full">
                  {/* Google Button */}
                  <button
                    onClick={handleGoogleClick}
                    disabled={googleLoading}
                    className="w-full bg-[#0b0c0b]/80 hover:bg-white/5 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl py-3 px-4 flex items-center justify-center gap-2.5 text-xs font-bold text-white transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-lg backdrop-blur-md"
                  >
                    {googleLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-base leading-none">🔍</span>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                  
                  {/* Email Button */}
                  <button
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setEmailForm(true);
                      setIsRegistering(true);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-black text-[10px] uppercase py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Icon name="user" className="w-3.5 h-3.5" /> 
                    <span>Continue with Email</span>
                  </button>

                  {/* Practice Arena link (Guest mode renamed) */}
                  <button
                    onClick={() => handleAuthComplete("Guest")}
                    className="w-full text-center text-gray-400 hover:text-white text-[9px] font-black uppercase tracking-widest py-2 transition-all cursor-pointer hover:bg-white/5 rounded-xl border border-dashed border-white/5"
                  >
                    🏟️ Try Practice Arena (Demo)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: Daily AI Coaching Insight & Privacy Agreement */}
          <div className="space-y-3 pt-2">
            {/* Daily AI Insight card */}
            <div className="bg-gradient-to-r from-amber-500/5 via-[#0c0d0c] to-transparent border border-white/5 rounded-2xl p-3 max-w-sm mx-auto animate-fadeIn min-h-[50px] flex items-center gap-2.5 shadow-md">
              <span className="text-lg flex-shrink-0 animate-pulse">💡</span>
              <div className="space-y-0.5">
                <span className="text-[7px] text-amber-400 font-black uppercase tracking-wider block">Daily AI Intelligence Cue</span>
                <p className="text-[9px] leading-relaxed text-gray-300 italic">
                  "{dailyInsights[insightIndex]}"
                </p>
              </div>
            </div>

            {/* Terms text */}
            <p className="text-[7px] text-gray-600 text-center uppercase tracking-widest leading-none">
              By entering CricMind, you load biometric diagnostics and tactical overlays.
            </p>
          </div>

        </div>
      )}

      {/* SCREEN 3: ROLE SELECTION */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-between px-6 py-8 relative z-10 animate-fadeIn">
          <div className="space-y-1.5 pt-4 text-center">
            <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase">Ecosystem Step 1 of 3</span>
            <h2 className="text-2xl font-black text-white leading-tight">Choose Your Cricket Identity</h2>
            <p className="text-gray-400 text-xs">AI adjusts your telemetry parameters based on your core role.</p>
          </div>

          {/* Role cards list grid */}
          <div className="grid grid-cols-1 gap-2.5 my-auto max-w-sm mx-auto w-full">
            {[
              { id: "batter", label: "Batter", desc: "Yorker blocks, spin reads, cover drives", emoji: "🏏" },
              { id: "bowler", label: "Bowler", desc: "Outswing speed, seam line, death cutters", emoji: "🎯" },
              { id: "allrounder", label: "All-Rounder", desc: "Power finishes and steady bowling containers", emoji: "⚡" },
              { id: "keeper", label: "Wicketkeeper", desc: "Stump reflexes, take rates, close glovework", emoji: "🧤" },
              { id: "captain", label: "Captain", desc: "Dynamic wagon wheels, tactical placements", emoji: "🧠" }
            ].map(r => {
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`rounded-2xl p-3 border text-left flex items-center gap-3.5 transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500 scale-[1.02] shadow-lg shadow-amber-500/5 font-black" 
                      : "bg-[#0b0c0b] border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1 space-y-0.5">
                    <span className="text-xs font-black text-white block leading-none">{r.label}</span>
                    <span className="text-[9px] text-gray-400 block leading-normal">{r.desc}</span>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-black font-black">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setStep(4);
              playSound('click', soundEnabled);
              speakText("Role logged. Let's calibrate your skill scores.", true);
            }}
            className="w-full max-w-sm mx-auto bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] uppercase py-3.5 rounded-2xl shadow-lg cursor-pointer"
          >
            Configure Skills →
          </button>
        </div>
      )}

      {/* SCREEN 4: SKILL SETUP */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-between px-6 py-8 relative z-10 animate-fadeIn">
          <div className="space-y-1.5 pt-4 text-center">
            <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase">Ecosystem Step 2 of 3</span>
            <h2 className="text-2xl font-black text-white leading-tight">Calibrate Your Capabilities</h2>
            <p className="text-gray-400 text-xs">Calibrate visual skill sliders (No boring text forms!).</p>
          </div>

          {/* Visual Sliders and checklist */}
          <div className="space-y-4 my-auto max-w-sm mx-auto w-full bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl">
            <div className="space-y-3">
              <p className="text-[8px] text-amber-400 font-black tracking-widest uppercase">🏏 Biomechanical Strengths</p>
              
              {/* Sliders */}
              <div className="space-y-2">
                {[
                  { key: "timing", label: "Timing Precision" },
                  { key: "power", label: "Power Output" },
                  { key: "spinControl", label: "Spin Read Control" },
                  { key: "footwork", label: "Footwork Trigger" }
                ].map(s => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-300">
                      <span>{s.label}</span>
                      <span className="text-amber-400">{skills[s.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={skills[s.key]}
                      onChange={e => setSkills(prev => ({ ...prev, [s.key]: parseInt(e.target.value) }))}
                      className="w-full accent-amber-500 bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist buttons for weaknesses */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[8px] text-red-400 font-black tracking-widest uppercase">⚠️ Primary Technical Weakness</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "spin", label: "Spin sweep", emoji: "🌀" },
                  { id: "yorkers", label: "Yorker blocks", emoji: "⚡" },
                  { id: "shortball", label: "Short deliveries", emoji: "🚀" },
                  { id: "pressure", label: "Chase Pressure", emoji: "🧠" }
                ].map(w => {
                  const isSelected = weakness === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setWeakness(w.id);
                        playSound('click', soundEnabled);
                        speakText(`Weakness selected: ${w.label}`, true);
                      }}
                      className={`rounded-2xl p-2.5 text-center border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 justify-center ${
                        isSelected 
                          ? "bg-red-500/10 border-red-500 text-white animate-pulse" 
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <span>{w.emoji}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{w.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setStep(5);
              playSound('click', soundEnabled);
              setScanProgress(0);
            }}
            className="w-full max-w-sm mx-auto bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-[10px] uppercase py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            🧬 Scan My Cricket DNA
          </button>
        </div>
      )}

      {/* SCREEN 5: AI PROFILE SCANNER */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-between px-6 py-8 relative z-10 animate-fadeIn">
          <div className="space-y-1.5 pt-4 text-center">
            <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase">Ecosystem Calibration</span>
            <h2 className="text-2xl font-black text-white leading-tight animate-pulse">Biomechanical Analysis</h2>
            <p className="text-gray-400 text-xs">Generating your unique CricMind AI profile.</p>
          </div>

          {scanProgress < 100 ? (
            /* Immersive scanning HUD */
            <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 my-auto max-w-sm mx-auto w-full relative overflow-hidden h-44 flex flex-col justify-center">
              {/* Animated scan line */}
              <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80 animate-scan-line" />
              
              <div className="space-y-2 text-center relative z-10">
                <span className="text-3xl block animate-spin">🧬</span>
                <p className="text-xs font-black uppercase text-amber-400 tracking-wider">Analyzing Cricket DNA...</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase truncate max-w-full">{scanText}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-2 relative z-10">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150 rounded-full" 
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Dynamic DNA Profile Reveal Card */
            <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl my-auto max-w-sm mx-auto w-full animate-fadeIn space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest">🧬 Biomechanical DNA Decoded</span>
                <span className="text-[7px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase">DIAGNOSED</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5">
                  <span className="text-[7px] text-gray-500 uppercase block font-black mb-0.5">Cricket IQ Index</span>
                  <strong className="text-base text-white">{dnaProfile?.iq}</strong>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5">
                  <span className="text-[7px] text-gray-500 uppercase block font-black mb-0.5">Weakness Score</span>
                  <strong className="text-base text-red-400 font-black">{dnaProfile?.weaknessScore}%</strong>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center space-y-1">
                <span className="text-[7px] text-amber-400 uppercase font-black block tracking-wider">Batting/Bowling Archetype</span>
                <strong className="text-xs text-white font-black leading-none block uppercase">{dnaProfile?.archetype}</strong>
              </div>

              <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
                <span className="text-[7px] text-amber-400 uppercase block font-black tracking-widest">💡 Daily Coach Insight Cues</span>
                <p className="text-[10px] leading-relaxed italic text-gray-200">
                  "{dnaProfile?.insight}"
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (scanProgress >= 100) {
                setIsFinalizing(true);
              }
            }}
            disabled={scanProgress < 100}
            className="w-full max-w-sm mx-auto bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-30 text-black font-black text-[10px] uppercase py-3.5 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            🏟️ Enter CricMind AI
          </button>
        </div>
      )}

      {/* FULLSCREEN CYBER-STADIUM TRANSITION OVERLAY */}
      {isFinalizing && (
        <div className="absolute inset-0 bg-[#020502]/95 z-50 flex flex-col items-center justify-center px-8 space-y-8 animate-fadeIn">
          
          {/* Glowing sweeping radar circles */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer sonar ripples */}
            <div className="absolute inset-0 border border-amber-500/30 rounded-full animate-ping opacity-25" />
            <div className="absolute inset-4 border border-emerald-500/20 rounded-full animate-rotate-ring-slow" />
            <div className="absolute inset-8 border border-dashed border-amber-500/40 rounded-full animate-rotate-ring-fast" />
            
            {/* Sweep overlay lines */}
            <div className="absolute inset-2 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent rounded-full animate-spin" style={{ animationDuration: '3s' }} />

            <span className="text-4xl animate-bounce">🤖</span>
          </div>

          <div className="text-center space-y-3.5 w-full max-w-xs">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-wider text-white">Generating Ecosystem...</h3>
              <p className="text-[9px] font-black uppercase text-amber-400 tracking-widest animate-pulse h-4 truncate">
                {finalizeLog}
              </p>
            </div>

            {/* Custom linear progress loader */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-200"
                style={{ width: `${finalizeProgress}%` }}
              />
            </div>

            <span className="text-[8px] text-gray-500 font-bold uppercase block tracking-widest">
              TELEMETRY LOAD RATE: {finalizeProgress}%
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
