import { useState, useRef } from "react";

// Voice Speech-To-Text hook
export function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Microphone Speech Recognition is not supported by your current browser. Please try Chrome, Edge, or Safari.");

    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.onresult = e => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    r.start();
    setListening(true);
  };

  const stopListening = () => {
    recRef.current?.stop();
    setListening(false);
  };

  return { listening, startListening, stopListening };
}

// Voice Text-To-Speech Synthesis helper
export function speakText(text, voiceActive) {
  if (!window.speechSynthesis || !voiceActive) return;
  
  // Stop currently playing sounds first
  window.speechSynthesis.cancel();

  // Clean up markdown text prior to reading
  const cleanText = text
    .replace(/[#*`_]/g, "")
    .replace(/🔍|🏋️|⚡|🌟|💪|🎯|📋|🎲|🏆/g, "")
    .substring(0, 300); // Read first 300 characters for high speed responsive playback

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-IN"; // English with Indian accent for natural cricket coaches/commentators
  utterance.rate = 1.05;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
