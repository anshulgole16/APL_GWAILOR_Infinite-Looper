import React, { useState, useEffect } from 'react';

const STORAGE_KEY = "CRICMIND_GEMINI_KEY";

export default function ApiSettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const save = () => {
    localStorage.setItem(STORAGE_KEY, inputKey);
    setApiKey(inputKey);
    setStatus("✅ Saved successfully! CricMind AI is now connected to live Gemini models.");
    setTimeout(() => {
      setStatus("");
      onClose();
    }, 1500);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setInputKey("");
    setStatus("🗑️ API Key cleared. App switched back to high-fidelity AI simulator.");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-green-950 to-black border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full glow-gold">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display font-black text-white text-lg tracking-tight">Gemini API Settings</h3>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Configure your LLM model connection</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">Gemini API Key</label>
            <input
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] text-gray-400 leading-normal">
            💡 <span className="font-semibold text-gray-200">Pro Hackathon Tip:</span> If no key is entered, CricMind AI uses a built-in high-fidelity **AI Simulator** to demonstrate the "Killer Demo Flow" flawlessly!
          </div>

          {status && <p className="text-xs text-amber-400 font-semibold leading-snug">{status}</p>}

          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 rounded-xl text-xs transition-all tracking-wider uppercase shadow-lg shadow-amber-500/20"
            >
              Save API Key
            </button>
            <button
              onClick={clear}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs transition-all border border-red-500/30 uppercase"
            >
              Clear Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
