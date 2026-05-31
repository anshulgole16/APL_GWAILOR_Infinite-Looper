import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import Ticker from './components/Ticker';
import HomePage from './pages/HomePage';
import CoachPage from './pages/CoachPage';
import StrategyPage from './pages/StrategyPage';
import CommentaryPage from './pages/CommentaryPage';
import ScannerPage from './pages/ScannerPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';

const STORAGE_KEY = "CRICMIND_GEMINI_KEY";
const GEMINI_KEY = "AIzaSyAy8MnREk9z39XIWsv8INl6OYHGkqTk3Pk"; // Pro Hackathon key fallback

const getSavedApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) || GEMINI_KEY || "";
  }
  return "";
};

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("CRICMIND_ONBOARDED") === "true");
  const [page, setPage] = useState("home");
  const [coachMode, setCoachMode] = useState("batter");
  const [apiKey, setApiKey] = useState(getSavedApiKey());
  const [voiceActive, setVoiceActive] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("CRICMIND_ONBOARDED");
    localStorage.removeItem("CRICMIND_CURRENT_USER");
    localStorage.removeItem("CRICMIND_PLAYER_NAME");
    localStorage.setItem("CRICMIND_LOGGED_OUT", "true");
    setOnboarded(false);
    setPage("home");
  };

  const navBar = [
    { id: "home", label: "Home", icon: "home" },
    { id: "coach", label: "AI Coach", icon: "bot" },
    { id: "strategy", label: "Strategy", icon: "layout-grid" },
    { id: "commentary", label: "Live Mic", icon: "mic" },
    { id: "scanner", label: "Scan AI", icon: "camera" },
    { id: "dashboard", label: "Stats", icon: "trending-up" },
  ];

  const pageTitles = {
    home: "CricMind AI",
    coach: "AI Coach Room",
    strategy: "Tactics Room",
    commentary: "Live Commentary Room",
    scanner: "Stance Vision Room",
    dashboard: "Player Dashboard",
  };

  // Gracefully remove index initial loader once components compile
  useEffect(() => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  return (
    <div
      className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden select-none border-x border-white/10 bg-cricket-dark shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #020502 0%, #060e06 40%, #010301 100%)"
      }}
    >
      
      {!onboarded ? (
        <OnboardingPage onComplete={() => setOnboarded(true)} />
      ) : (
        <>
          {/* Main Top Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 flex-shrink-0 bg-black/40 backdrop-blur-md relative z-30">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏏</span>
              <span className="text-white font-display font-black text-base tracking-tight uppercase">{pageTitles[page]}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Voice toggle button */}
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${voiceActive ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-gray-500 bg-white/5 border border-white/5"}`}
                title="Toggle Voice Text Synthesis Playback"
              >
                <Icon name={voiceActive ? "volume-2" : "volume-x"} className="w-4 h-4" />
              </button>
              
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 bg-red-500/10 border border-red-500/20 hover:text-white hover:bg-red-500/30 transition-all cursor-pointer"
                title="Log Out & Lock Telemetry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dynamic Updates Ticker */}
          <Ticker />

          {/* Dynamic Routing Pages Content */}
          <div className="flex-1 overflow-hidden relative">
            {page === "home" && <HomePage setPage={setPage} coachMode={coachMode} setCoachMode={setCoachMode} />}
            {page === "coach" && <CoachPage coachMode={coachMode} apiKey={apiKey} voiceActive={voiceActive} setPage={setPage} setSelectedScenario={setSelectedScenario} />}
            {page === "strategy" && <StrategyPage apiKey={apiKey} selectedScenario={selectedScenario} setSelectedScenario={setSelectedScenario} />}
            {page === "commentary" && <CommentaryPage apiKey={apiKey} voiceActive={voiceActive} />}
            {page === "scanner" && <ScannerPage apiKey={apiKey} />}
            {page === "dashboard" && <DashboardPage setPage={setPage} coachMode={coachMode} />}
          </div>

          {/* Bottom Custom Nav Menu */}
          <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl flex-shrink-0 absolute bottom-0 left-0 right-0 z-30">
            <div className="flex flex-row justify-around w-full">
              {navBar.map(n => (
                <button
                  key={n.id}
                  onClick={() => setPage(n.id)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all relative ${
                    page === n.id ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {page === n.id && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md shadow-amber-500/50" />
                  )}
                  <Icon name={n.icon} className={`w-5 h-5 transition-all duration-300 ${page === n.id ? "scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""}`} />
                  <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
