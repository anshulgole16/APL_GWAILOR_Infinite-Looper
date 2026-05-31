import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import RadarChart from '../components/RadarChart';
import { speakText } from '../utils/voice';
import { db, firebase } from '../utils/firebase';

export default function DashboardPage({ setPage, coachMode }) {
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem("CRICMIND_PLAYER_PHOTO") || null;
  });

  // Fetch from Firebase Firestore on mount to sync across browsers/sessions
  useEffect(() => {
    if (db) {
      db.collection("player_profiles").doc("current_user").get().then(doc => {
        if (doc.exists && doc.data().photo) {
          const cloudPhoto = doc.data().photo;
          if (cloudPhoto !== localStorage.getItem("CRICMIND_PLAYER_PHOTO")) {
            localStorage.setItem("CRICMIND_PLAYER_PHOTO", cloudPhoto);
            setProfilePhoto(cloudPhoto);
          }
        }
      }).catch(e => console.warn("Firestore profile photo fetch ignored or empty credentials:", e.message));
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      localStorage.setItem("CRICMIND_PLAYER_PHOTO", base64);
      setProfilePhoto(base64);
      speakText("Profile picture updated successfully.", true);

      // Push to Firestore Cloud Database in real-time
      if (db && firebase) {
        db.collection("player_profiles").doc("current_user").set({
          photo: base64,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.warn("Firestore cloud photo sync failed:", err.message));
      }
    };
    reader.readAsDataURL(file);
  };

  const radarData = {
    Batting: 74,
    Bowling: 58,
    Fielding: 65,
    Strategy: 80,
    Mental: 76
  };

  const skillBars = [
    { name: "Sweep Shot vs Spin", value: 48, color: "#f43f5e", trend: "↓ 4%", query: "I struggle against spin bowling", duration: "8 mins", diff: "Medium", yield: "+6%" },
    { name: "Yorker Down-Jam", value: 52, color: "#eab308", trend: "↓ 2%", query: "Mujhe yorker khelne main problem hoti hai", duration: "10 mins", diff: "Expert", yield: "+8%" },
    { name: "Extra Cover Drive", value: 84, color: "#10b981", trend: "↑ 12%", query: "How to execute extra cover drive?", duration: "6 mins", diff: "Medium", yield: "+12%" },
    { name: "Running Between Wickets", value: 89, color: "#10b981", trend: "↑ 8%", query: "Improve running speed", duration: "5 mins", diff: "Easy", yield: "+5%" },
  ];

  const achievements = [
    { label: "Spin Survivor", emoji: "🏏", desc: "Read 20+ spin variations", unlocked: true },
    { label: "Yorker Crusher", emoji: "⚡", desc: "Block 10 Bumrah yorkers", unlocked: true },
    { label: "Tactical Mind", emoji: "🧠", desc: "Draft 5 match strategy plans", unlocked: true },
    { label: "7-Day Consistent", emoji: "🔥", desc: "Maintained a 7-day streak", unlocked: false },
  ];

  const trainingTimeline = [
    { title: "Yorker Down-Jam Practice", time: "Yesterday, 4:32 PM", score: "82% Accuracy", type: "drill" },
    { title: "Cover Drive Technique Scan", time: "3 days ago", score: "92% Balanced Stance", type: "scan" },
    { title: "IPL Playoff Chase Setup", time: "5 days ago", score: "IND Target 192 Plan", type: "strategy" },
  ];

  return (
    <div className="overflow-y-auto h-full animate-fadeIn pb-24 bg-black text-white">
      <div className="px-4 py-4 space-y-4">
        
        {/* 1. Active Player Profile & XP Card (Addictive Progression) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b0c0b] border border-white/10 p-5 shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 90% 10%, #f59e0b 0%, transparent 60%)" }} />
          
          <div className="relative z-10 flex items-center gap-3.5">
            {/* Clickable Profile Photo */}
            <div 
              onClick={() => document.getElementById("profile-photo-picker").click()}
              className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg border border-white/10 text-black font-display font-black text-base flex-shrink-0 cursor-pointer overflow-hidden group"
              title="Click to change profile picture"
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Player Profile" className="w-full h-full object-cover" />
              ) : (
                "AG"
              )}
              {/* Hover Edit overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-bold font-display uppercase text-center leading-none">
                Edit 📷
              </div>
            </div>
            
            <input 
              id="profile-photo-picker"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-display font-black text-sm uppercase tracking-tight leading-none">{localStorage.getItem("CRICMIND_PLAYER_NAME") || "Anshul Gole"}</p>
                <span className="text-[7px] bg-green-500/10 text-green-400 border border-green-500/30 px-1.5 py-0.2 rounded font-black tracking-wider uppercase">+12% GROWTH</span>
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                Role: <strong className="text-amber-400 font-bold uppercase">{coachMode}</strong>
              </p>
              
              {/* Level XP progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[7px] font-black uppercase text-gray-500 tracking-wider">
                  <span>Level 8</span>
                  <span>73% to Level 9</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "73%" }} />
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-amber-400 font-display font-black text-2xl leading-none animate-pulse">7</p>
              <p className="text-gray-500 text-[7px] font-black uppercase tracking-widest mt-0.5 flex items-center justify-end gap-0.5">
                Streak <Icon name="flame" className="w-3 h-3 text-orange-500" />
              </p>
            </div>
          </div>

          {/* 2. Stats Row - 2x2 Mobile Grid (No compressed cutoff) */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-white/5">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center">
              <p className="text-white font-display font-black text-sm leading-none">12</p>
              <p className="text-gray-500 text-[8px] mt-1 font-bold uppercase tracking-wider leading-none">Drills Completed</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center">
              <p className="text-white font-display font-black text-sm leading-none">8</p>
              <p className="text-gray-500 text-[8px] mt-1 font-bold uppercase tracking-wider leading-none">Match Strategies</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center">
              <p className="text-white font-display font-black text-sm leading-none">34</p>
              <p className="text-gray-500 text-[8px] mt-1 font-bold uppercase tracking-wider leading-none">Commentary Plays</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 text-center">
              <p className="text-green-400 font-display font-black text-sm leading-none">92%</p>
              <p className="text-gray-500 text-[8px] mt-1 font-bold uppercase tracking-wider leading-none">Consistency Rate</p>
            </div>
          </div>
        </div>

        {/* 3. Skills Radar & Current Skill Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Radar map panel */}
          <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 flex flex-col justify-between shadow-lg">
            <p className="text-xs font-display font-black text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Icon name="shield" className="text-amber-400 w-4 h-4 animate-pulse" /> Telemetry Skills Radar
            </p>
            <RadarChart data={radarData} />
          </div>

          {/* Skill Bars with directional trend arrows */}
          <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-lg">
            <p className="text-xs font-display font-black text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Icon name="award" className="text-amber-400 w-4 h-4" /> Current Performance Levels
            </p>
            <div className="space-y-3.5">
              {skillBars.map(s => {
                const isDown = s.trend.includes("↓");
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-gray-300 uppercase tracking-wider flex items-center gap-1">
                        {s.name} 
                        <span className={`text-[8px] font-black ${isDown ? "text-red-400" : "text-green-400"}`}>{s.trend}</span>
                      </span>
                      <span style={{ color: s.color }} className="font-black">{s.value}%</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                      {/* Animated progressive bar fill */}
                      <div className="h-full rounded-full transition-all duration-700 ease-in-out" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Custom SVG Dismissal & Pitch Weakness Heatmap (Sports-Tech IQ) */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="compass" className="text-amber-400 w-4 h-4" /> AI Dismissal & Pitch Weakness Heatmap
            </p>
            <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-black uppercase">CRITICAL ZONE</span>
          </div>

          <div className="relative flex justify-center py-2 bg-black/40 rounded-2xl border border-white/5">
            <svg viewBox="0 0 100 80" className="w-full max-h-48">
              {/* Pitch representation */}
              <rect x="30" y="5" width="40" height="70" rx="2" fill="#854d0e" opacity="0.3" stroke="#a16207" strokeWidth="0.5" />
              
              {/* Wickets */}
              <line x1="46" y1="75" x2="54" y2="75" stroke="#fbbf24" strokeWidth="1.5" />
              
              {/* Stumps line */}
              <line x1="50" y1="5" x2="50" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,2" />
              
              {/* Weakness Landing Spot outside Off Stump (Red) */}
              <circle cx="58" cy="48" r="8" fill="#f43f5e" opacity="0.25" />
              <circle cx="58" cy="48" r="5" fill="#f43f5e" opacity="0.45" />
              <circle cx="58" cy="48" r="2.5" fill="#f43f5e" opacity="0.75" />
              <text x="63" y="44" fontSize="3" fill="#f43f5e" fontWeight="black">⚠️ Outswing Weakness</text>
              
              {/* Spin sweep landing spot on stumps (Orange) */}
              <circle cx="48" cy="62" r="7" fill="#fbbf24" opacity="0.2" />
              <circle cx="48" cy="62" r="4.5" fill="#fbbf24" opacity="0.35" />
              <circle cx="48" cy="62" r="2" fill="#fbbf24" opacity="0.6" />
              <text x="32" y="66" fontSize="3" fill="#fbbf24" fontWeight="black">🌀 Spin Trap</text>
            </svg>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-[10px] text-gray-400 space-y-1">
            <span className="text-[8px] text-amber-400 uppercase font-black block">💡 AI Technical Reading</span>
            <p className="leading-relaxed italic">
              "Your off-side timing improves after settling for 15+ balls. Avoid slashing outswingers early before your eye is fully locked."
            </p>
          </div>
        </div>

        {/* 5. Weakness Fix Center (Low Saturation Maroon Redesigned) */}
        <div className="bg-rose-950/15 border border-rose-500/20 rounded-3xl p-4 shadow-lg space-y-3">
          <div>
            <p className="text-rose-400 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="alert-triangle" className="text-rose-400 w-4 h-4 animate-bounce" /> Weakness Fix Center
            </p>
            <p className="text-gray-400 text-[10px] leading-normal mt-1">
              Biomechanical models detect that your timing vs spin and block rate vs yorkers are below safe parameters. Launch fixes:
            </p>
          </div>

          <div className="space-y-2">
            {skillBars.filter(s => s.value < 60).map(s => (
              <div key={s.name} className="bg-black/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs transition-all hover:border-rose-500/30">
                <div className="space-y-1">
                  <span className="text-gray-200 font-bold text-xs">{s.name}</span>
                  <div className="flex gap-2 text-[8px] text-gray-500 font-black uppercase">
                    <span>⏱️ {s.duration}</span>
                    <span>•</span>
                    <span className="text-amber-500">{s.diff}</span>
                    <span>•</span>
                    <span className="text-green-400">{s.yield} yield</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    speakText(`Opening practice drills for ${s.name}`, true);
                    setPage("coach");
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  🛠️ Fix Drill
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Branded CricMind Performance Index Section */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="activity" className="text-amber-400 w-4 h-4" /> CricMind Performance Index
              </h4>
              <p className="text-gray-500 text-[9px] mt-0.5">Calculated from dynamic match readiness parameters</p>
            </div>
            
            <div className="text-right">
              <span className="text-2xl font-display font-black text-amber-400 leading-none">71</span>
              <span className="text-[8px] text-green-400 block font-black uppercase">↑ 4.5% This Week</span>
            </div>
          </div>
          
          <div className="h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: "71%" }} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500 font-bold uppercase pt-1">
            <span>🏆 League Rank: <strong className="text-white">Top 18% Amateur</strong></span>
            <span>🧠 Confidence Level: <strong className="text-green-400">HIGH (90%)</strong></span>
          </div>
        </div>

        {/* 7. Gamified Achievements Shelf (Retention Booster) */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-lg space-y-3">
          <p className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="award" className="text-amber-400 w-4 h-4" /> Gamified Achievements Shelf
          </p>
          
          <div className="grid grid-cols-4 gap-1.5">
            {achievements.map(a => (
              <div 
                key={a.label} 
                className={`rounded-2xl p-2 text-center border flex flex-col items-center justify-center transition-all duration-300 ${
                  a.unlocked 
                    ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 text-white" 
                    : "bg-white/5 border-white/5 text-gray-600 opacity-40"
                }`}
                title={a.desc}
              >
                <span className="text-lg mb-1">{a.emoji}</span>
                <span className="text-[8px] font-black uppercase tracking-wider truncate max-w-full leading-none">{a.label.split(" ")[0]}</span>
                <span className="text-[6px] text-gray-500 font-bold uppercase mt-0.5 leading-none">{a.unlocked ? "Unlocked" : "Locked"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Recent Training Timeline */}
        <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 shadow-lg space-y-3">
          <p className="text-xs font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="layout-grid" className="text-amber-400 w-4 h-4" /> Recent Training Timeline
          </p>
          
          <div className="space-y-3 pl-2 border-l border-white/10 ml-1">
            {trainingTimeline.map((t, idx) => (
              <div key={idx} className="relative space-y-0.5 animate-fadeIn">
                {/* Timeline node */}
                <div className="absolute -left-[12.5px] top-1 w-2 h-2 rounded-full bg-amber-500 border border-black" />
                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-bold text-white leading-none">{t.title}</p>
                  <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase font-black text-gray-400 scale-90">{t.type}</span>
                </div>
                <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase">
                  <span>{t.time}</span>
                  <span className="text-green-400 font-black">{t.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
