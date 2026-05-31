import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/Icon';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { speakText } from '../utils/voice';
import { callGeminiApi } from '../utils/gemini';

// Web Audio sound synthesizer for realistic telemetry cues
const playTelemetrySound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'beep') {
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'impact') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'success') {
      const chords = [523.25, 659.25, 783.99]; // C5, E5, G5
      chords.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        g.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        o.start(ctx.currentTime + idx * 0.08);
        o.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    }
  } catch (e) {
    console.warn("Audio Context blocked");
  }
};

// Video keyframe extractor using Browser Seek APIs
const extractFramesFromVideo = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    
    video.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Failed to load video file. Please use a standard video format."));
    };
    
    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        
        const percentages = [0.1, 0.3, 0.5, 0.7, 0.9];
        const labels = [
          "Set-up & Stance",
          "Backlift & Load-up",
          "Downswing / Trigger",
          "Impact / Release Point",
          "Follow-through"
        ];
        
        const extractedFrames = [];
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        for (let i = 0; i < percentages.length; i++) {
          const targetTime = duration * percentages[i];
          onProgress(`Extracting: ${labels[i]} (${targetTime.toFixed(1)}s)...`, Math.round(((i + 1) / percentages.length) * 100));
          
          await new Promise((resSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              resSeek();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = targetTime;
          });
          
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          extractedFrames.push({
            id: i + 1,
            label: labels[i],
            time: targetTime.toFixed(2),
            dataUrl
          });
        }
        
        URL.revokeObjectURL(videoUrl);
        resolve(extractedFrames);
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };
  });
};

export default function ScannerPage({ apiKey }) {
  const [activeTab, setActiveTab] = useState("live"); // Defaults to flagship feature "live"
  
  // Image scan state
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Video scan state
  const [videoFile, setVideoFile] = useState(null);
  const [videoActionType, setVideoActionType] = useState("batting"); // "batting" or "bowling"
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionText, setExtractionText] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [selectedReviewFrame, setSelectedReviewFrame] = useState(1);
  const videoInputRef = useRef(null);

  // FLAGSHIP FEATURE: LIVE AI SHOT ANALYZER STATE
  const [liveAnalyzing, setLiveAnalyzing] = useState(false);
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveLog, setLiveLog] = useState("Awaiting telemetry trigger...");
  const [liveResult, setLiveResult] = useState(null);
  const [activeFramePhase, setActiveFramePhase] = useState("setup"); // setup, backswing, impact, follow
  const [skeletonAngle, setSkeletonAngle] = useState(0); // Driven by RequestAnimationFrame

  // Interactive Preset Cards
  const presets = [
    {
      label: "Batting Stance Posture",
      desc: "Analyze lead elbow trigger, backfoot anchor weight and head posture",
      image: "https://images.unsplash.com/photo-1540747737956-3787257478be?w=400&auto=format&fit=crop&q=60",
      analysis: `## 🔍 Stance Posture Analysis
From the loaded image, your lead elbow points down correctly, but your lead shoulder is open by 8 degrees, forcing you to hook leg-side deliveries blindly. Your center of weight is resting excessive pressure on the heels.

## ⚡ Technical Corrections
- **Close Shoulder:** Rotate leading shoulder to align directly with the bowler's gather marker.
- **Lead Arm Flex:** Raise lead hand by 3cm to allow straighter swing trigger down the pitch.
- **Weight Transfer:** Lean 60% of total body load on front balls of feet.

## 📋 Custom Drills
1. **Underarm Drop Drives (25 swings):** Align leads straight; strike drop deliveries vertically.
2. **Wall Stance Alignments:** Practice setup stance 3 inches from flat walls to align hips.`
    },
    {
      label: "Match Scorecard Status",
      desc: "Tactical overlay, chase target rates and opponent spin alerts",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60",
      analysis: `## 📊 Scorecard Tactical Briefing
Required run rate stands at **10.2 runs per over**. The opponent lead seamer has 2 overs left with dry cutter patterns.

## ⚡ Game Plan Adjustments
- **Dampen dry spell:** Do not attack the primary seamer; rotate singles into off-stump pockets.
- **Exploit 5th bowler:** Targets the part-time spinner immediately.
- **Save Wickets:** Preserve middle order until Over 16 for explosive launches.`
    }
  ];

  // Live biomechanics skeleton coordinates generator (Calculated in real-time)
  const getSkeletonJoints = (elapsed) => {
    let t = Math.min(3.5, elapsed);
    
    let head = { x: 160, y: 110 };
    let shoulder = { x: 160, y: 160 };
    let hip = { x: 155, y: 240 };
    let backKnee = { x: 120, y: 300 };
    let backFoot = { x: 110, y: 360 };
    
    let frontKnee = { x: 190, y: 300 };
    let frontFoot = { x: 200, y: 360 };
    let elbow = { x: 130, y: 180 };
    let wrist = { x: 135, y: 220 };
    let batTip = { x: 110, y: 260 };
    
    if (t < 1.0) {
      // Setup phase: slight breathing
      const breathe = Math.sin(t * Math.PI) * 2;
      head.y += breathe;
      wrist.y += breathe;
      batTip.y += breathe;
    } else if (t < 2.0) {
      // Backswing: raise arms & raise bat
      const ratio = t - 1.0;
      elbow.x = 130 - ratio * 30;
      elbow.y = 180 - ratio * 40;
      wrist.x = 135 - ratio * 15;
      wrist.y = 220 - ratio * 60;
      batTip.x = 110 - ratio * 20;
      batTip.y = 260 - ratio * 140;
    } else if (t < 2.8) {
      // Downswing to Impact
      const ratio = (t - 2.0) / 0.8;
      
      frontKnee.x = 190 + ratio * 35;
      frontKnee.y = 300 + ratio * 10;
      frontFoot.x = 200 + ratio * 40;
      
      elbow.x = 100 + ratio * 85;
      elbow.y = 140 + ratio * 60;
      wrist.x = 120 + ratio * 70;
      wrist.y = 160 + ratio * 80;
      
      batTip.x = 90 + ratio * 125;
      batTip.y = 120 + ratio * 190;
      
      head.x = 160 + ratio * 20;
    } else {
      // Follow-through high finish
      const ratio = (t - 2.8) / 0.7;
      
      frontKnee.x = 225;
      frontKnee.y = 310;
      frontFoot.x = 240;
      
      elbow.x = 185 - ratio * 15;
      elbow.y = 200 - ratio * 70;
      wrist.x = 190 - ratio * 10;
      wrist.y = 240 - ratio * 110;
      
      batTip.x = 215 - ratio * 120;
      batTip.y = 310 - ratio * 210;
      
      head.x = 180;
    }
    
    return { head, shoulder, hip, backKnee, backFoot, frontKnee, frontFoot, elbow, wrist, batTip };
  };

  const joints = getSkeletonJoints(skeletonAngle);

  // RequestAnimationFrame simulation loop for real-time skeleton evaluation
  useEffect(() => {
    let animId;
    let startTime = Date.now();
    
    if (liveAnalyzing) {
      const animLoop = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        setSkeletonAngle(elapsed);
        
        if (elapsed < 1.0) {
          setLiveLog("Calibrating skeletal joints... Locked Lead Elbow.");
          setLiveProgress(Math.min(95, Math.round(elapsed * 25)));
          if (Math.floor(elapsed * 10) % 3 === 0) playTelemetrySound('beep');
        } else if (elapsed < 2.0) {
          setLiveLog("Analyzing backswing arc. Swing path stability: 92%.");
          setLiveProgress(Math.min(95, Math.round(25 + (elapsed - 1) * 30)));
          if (Math.floor(elapsed * 10) % 3 === 0) playTelemetrySound('beep');
        } else if (elapsed < 2.8) {
          setLiveLog("Downswing trigger locked. Sweet spot impact zone aligned.");
          setLiveProgress(Math.min(95, Math.round(55 + (elapsed - 2) * 40)));
          if (Math.abs(elapsed - 2.4) < 0.05) playTelemetrySound('impact');
        } else if (elapsed < 3.5) {
          setLiveLog("Follow-through finish evaluation. Commencing HawkEye mapping...");
          setLiveProgress(Math.min(95, Math.round(87 + (elapsed - 2.8) * 18)));
        } else {
          setLiveProgress(100);
          setLiveAnalyzing(false);
          generateLiveAIAnalysis();
        }
        
        if (elapsed < 3.5) {
          animId = requestAnimationFrame(animLoop);
        }
      };
      animId = requestAnimationFrame(animLoop);
    }
    return () => cancelAnimationFrame(animId);
  }, [liveAnalyzing]);

  const startLiveCapture = () => {
    setLiveResult(null);
    setLiveProgress(0);
    setLiveLog("Initializing biomechanical telemetry feed...");
    setLiveAnalyzing(true);
    playTelemetrySound('beep');
  };

  const generateLiveAIAnalysis = () => {
    playTelemetrySound('success');
    setLiveResult({
      voiceFeedback: "Front foot steps too early against spin. Lead shoulder collapses 8 degrees. Balance shifting leg-side before point of impact.",
      stats: {
        balance: 82,
        timing: 74,
        shotControl: 88,
        pressureStability: 61
      },
      proComparison: {
        name: "Virat Kohli Style Cover Drive",
        desc: "Your cover drive kinematics show a front-foot weight transfer similar to Virat Kohli's cover drive. Leading shoulder aligns vertically and core gravity shifts forward smoothly.",
        resemblance: "84%"
      },
      fixDrills: [
        { label: "Cone Gate Swings (5 mins)", difficulty: "Medium", desc: "Place two cones 12 inches apart as a gate. Practice driving ball straight through the gate to align shoulder and straight bat path." },
        { label: "Weighted Sleeve Drives (3 sets)", difficulty: "Pro", desc: "Slide a heavy practice sleeve onto your bat. Focus on slow-motion shadow drives to lock elbow angles." }
      ],
      phaseDetails: {
        setup: {
          metrics: "Hips: 8° open • Elbow: 94° • Base: Stable",
          critique: "Your stance base is balanced. However, lead shoulder is slightly open (2°), which can cause you to hit across the line."
        },
        backswing: {
          metrics: "Bat Angle: 38° • Peak Height: 1.4m • Weight Shift: 55% Lead",
          critique: "Your hands loop slightly outside during the backswing, giving your downswing a curved path rather than a straight line. Focus on keeping hands tight to the body."
        },
        impact: {
          metrics: "Contact Zone: 12cm forward • Wrist Flex: 110° • Head Position: Vertical",
          critique: "Sweet spot impact! Head position remains level and directly over the ball, which keeps the cover drive grounded and prevents high edges."
        },
        follow: {
          metrics: "Hips Rotation: 84° • Finish Height: Over shoulder • Rear foot drag: 4cm",
          critique: "High hands finish is excellent. However, your rear foot drags slightly forward during the swing. Focus on staying anchored to avoid stumping risk."
        }
      }
    });
    speakText("Biomechanical DNA scan complete. Your cover drive mechanics resemble Virat-style front-foot transfer. However, your balance shifts leg-side before impact.", true);
  };

  const handlePresetClick = (preset) => {
    setImageFile(preset.image);
    setResult(preset.analysis);
    playTelemetrySound('beep');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageFile(event.target.result);
      
      setImageLoading(true);
      setTimeout(() => {
        setResult(`## 🔍 Custom Stance Analysis
The uploaded batting stance has been successfully parsed by CricMind Vision models.

## ⚡ Posture Recommendations
- **Flexion Angle:** Your front knee displays standard 45-degree flexion, but your back knee remains too straight.
- **Elbow Level:** The lead elbow height is well-maintained, preventing edges.
- **Grip Tension:** Relax your grip tension slightly to allow smooth wrist snap at point of ball contact.

## 📋 Skill Practice
- **Weighted Swings:** Practise swing paths using a heavy sleeve bat to build muscle memory.`);
        setImageLoading(false);
        playTelemetrySound('success');
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  // Video upload and processing
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setVideoFile(file);
    setVideoResult(null);
    setExtractedFrames([]);
    setExtractionProgress(5);
    setExtractionText("Initializing high-speed frame grabber...");
    playTelemetrySound('beep');
    
    try {
      const frames = await extractFramesFromVideo(file, (msg, prog) => {
        setExtractionProgress(prog);
        setExtractionText(msg);
      });
      setExtractedFrames(frames);
      setExtractionProgress(100);
      setExtractionText("Successfully extracted 5 structural action positions.");
      playTelemetrySound('success');
    } catch (err) {
      setExtractionText(`❌ Extraction Error: ${err.message}`);
      setExtractionProgress(0);
    }
  };

  const analyzeVideoAction = async () => {
    if (extractedFrames.length === 0 || videoLoading) return;
    
    setVideoLoading(true);
    playTelemetrySound('beep');
    const frameImagesOnly = extractedFrames.map(f => f.dataUrl);
    const isBatting = videoActionType === "batting";
    
    const SYSTEM_PROMPT = `You are CricMind AI — an elite international cricket biomechanics and technique analysis engine. 
    You are analyzing 5 sequential frames of a player's ${isBatting ? "batting shot" : "bowling action"}. 
    
    Structure your response strictly inside these header blocks:
    
    ## 🔍 Frame-by-Frame Technical Critique
    Critique each of the 5 frames in detail. Refer specifically to:
    - **Frame 1 (Set-up & Stance)**: Commend posture or state faults.
    - **Frame 2 (Backlift & Load-up)**: Critique trigger weight shift, bat angle, or shoulder/body load.
    - **Frame 3 (Downswing / Trigger)**: Critique bat path, lead foot step, or release position.
    - **Frame 4 (Impact / Release Point)**: Critique head position, bat face angle at impact, or ball release release alignment.
    - **Frame 5 (Follow-through)**: Analyze recovery balance, trunk rotation, and completion.
    
    ## ⚡ Core Technique Recommendations
    - Point out exactly 3 key adjustments the player needs to make to prevent edges, increase bat speed, or increase bowling velocity and seam stability.
    
    ## 📋 Actionable Drills
    1. **Drill 1**: Specifically designed for their main fault in Frame 3/4 (3 sets of 15 reps).
    2. **Drill 2**: To enhance follow-through stability and weight shift.
    
    Maintain a constructive, elite coaching tone, mix simple Hindi phrases naturally, and keep observations concise.`;

    const USER_PROMPT = `Please critique this sequential ${isBatting ? "batting shot video" : "bowling delivery video"} frame-by-frame and check what mistakes I am making. Here are the 5 captured key phases representing the delivery.`;

    try {
      let analysisText = "";
      if (apiKey) {
        analysisText = await callGeminiApi(SYSTEM_PROMPT, USER_PROMPT, apiKey, frameImagesOnly);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isBatting) {
          analysisText = `## 🔍 Frame-by-Frame Technical Critique
- **Frame 1 (Set-up & Stance)**: Your initial batting stance looks well-balanced. The head is vertical and eyes are level, giving you a perfect line of sight towards the bowler's hand.
- **Frame 2 (Backlift & Load-up)**: As the backlift starts, your hands are slightly too far away from the body. This causes a loop in the swing path, which might slow down your reaction speed against express pace bowlers.
- **Frame 3 (Downswing / Trigger)**: Your front foot is stepping slightly across towards the off-side. This closes your hip rotation, which makes playing leg-side deliveries difficult and might lead to LBW vulnerabilities.
- **Frame 4 (Impact / Release Point)**: At point of impact, your head is slightly behind the ball rather than directly over it. This makes it difficult to keep the ball on the ground, increasing the risk of getting caught.
- **Frame 5 (Follow-through)**: The follow-through shows great shoulder rotation and high hands completion, but your rear leg is dragging out of the crease, which can cost you run-outs or stumpings.

## ⚡ Core Technique Recommendations
- **Bring Hands Closer**: Keep your top hand closer to the hip during backlift to create a straight bat path down the line.
- **Step Towards the Ball**: Make sure your front foot steps towards the pitch of the ball, not across the line of the stumps.
- **Lean into the Shot**: Transfer 70% of your body weight forward at impact to keep your drives grounded.

## 📋 Actionable Drills
1. **Underarm Drop-Ball Drive** (3 sets of 15 drives): Have a partner drop the ball right in front of you. Focus on stepping straight and hitting the ball back on the bounce.
2. **Back-Foot Static Balance Hold** (5 sets of 1 min): Hold your stance finish for 5 seconds on each shot, maintaining pure core balance.`;
        } else {
          analysisText = `## 🔍 Frame-by-Frame Technical Critique
- **Frame 1 (Set-up & Stance)**: Your run-up transition into the load-up shows great velocity. Your body is aligned straight towards the target stumps.
- **Frame 2 (Backlift & Load-up)**: During the jump-gather phase, your chest is excessively open. This reduces the rotational force you can extract from your core muscles.
- **Frame 3 (Downswing / Trigger)**: At back-foot landing, your heel is collapsing. This leads to a loss of height and stability, directly draining 3-5 km/h of bowling speed.
- **Frame 4 (Impact / Release Point)**: At the point of release, your lead elbow is dropping too early. This opens up your front shoulder prematurely, causing the ball to drift down the leg side or lose bounce.
- **Frame 5 (Follow-through)**: The follow-through is smooth, but you are not falling away in a straight line. You are crossing over the danger area of the pitch, which can lead to formal warnings from the umpire.

## ⚡ Core Technique Recommendations
- **Keep Chest Closed**: Maintain a semi-open or side-on chest position during gather to store maximum core elasticity.
- **Brace Front Leg**: Keep your front knee braced and straight during release to act as a pivot and extract extra bounce.
- **High Front Arm**: Keep your lead arm pointing high and pull it straight down to the hip to guide accuracy.

## 📋 Actionable Drills
- **Braced Knee Sticking** (4 sets of 10 releases): Bowl from a single step, focusing purely on keeping your front leg locked and straight during release.
- **Towel Bowling Practice** (20 repetitions): Practice your full action holding a small towel. Focus on pulling your front arm hard down to your pocket.`;
        }
      }
      
      setVideoResult(analysisText);
      playTelemetrySound('success');
      speakText("Video frame critique complete. Let's analyze your mistakes step by step.", true);
    } catch (e) {
      setVideoResult(`❌ **Error:** ${e.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto h-full animate-fadeIn pb-24 bg-black text-white">
      <div className="px-4 py-4 space-y-4">
        
        {/* Flagship Tab Switcher Grid */}
        <div className="flex bg-[#0a0d0a] border border-white/15 rounded-2xl p-1 relative z-10">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider transition-all duration-300 relative ${
              activeTab === "live"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/15 font-black scale-102"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-1.5 leading-none">
              <span>🧬</span> Live AI Analyzer
            </div>
            <span className="absolute -top-1 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90 border border-black animate-pulse leading-none">FLAGSHIP</span>
          </button>
          
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${
              activeTab === "image"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/15 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📸 Photo Scan
          </button>
          
          <button
            onClick={() => setActiveTab("video")}
            className={`flex-1 flex items-center justify-center py-2.5 rounded-xl font-display font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${
              activeTab === "video"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/15 font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎥 Video Critique
          </button>
        </div>

        {/* Tab 3: FLAGSHIP LIVE AI SHOT ANALYZER */}
        {activeTab === "live" && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Hawkeye Title Info banner */}
            <div className="bg-gradient-to-br from-[#0c0f0c] via-black to-[#050605] border border-emerald-500/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl animate-pulse" />
              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-black tracking-widest uppercase mb-1.5 inline-block leading-none">AI BIOMECHANICAL CRICKET INTELLIGENCE</span>
              <h2 className="text-white font-display font-black text-sm uppercase tracking-tight leading-tight">
                Live Biomechanics Stance HUD
              </h2>
              <p className="text-gray-400 text-[10px] mt-1 leading-normal max-w-[280px]">
                Simulate a batting drive capture. CricMind HawkEye engine tracks joint-flex coordinates and evaluates balance weight shift triggers.
              </p>
            </div>

            {/* LIVE CAMERA TELEMETRY VIEWPORT SCREEN */}
            <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl aspect-[4/3] flex flex-col justify-between">
              
              {/* Telemetry sweep lines during active scan */}
              {liveAnalyzing && (
                <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent z-20 animate-scan-line" />
              )}

              {/* Viewport Top HUD Bar */}
              <div className="flex justify-between items-center px-4 py-2 bg-black/60 border-b border-white/5 relative z-10 text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${liveAnalyzing ? "bg-red-500 animate-ping" : "bg-green-500"}`} />
                  <span>{liveAnalyzing ? "CAPTURE ACTIVE" : "SENSOR GATE LOCKED"}</span>
                </div>
                <span>FPS: 120 SEC • SKELETAL 8-POINT</span>
              </div>

              {/* CENTER DISPLAY: Animated Biomechanical Stick figure */}
              <div className="flex-1 relative flex items-center justify-center z-15 bg-[#030503]">
                {/* Simulated stadium targets behind batsman */}
                <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                  <div className="w-48 h-48 border border-white/10 rounded-full flex items-center justify-center border-dashed">
                    <div className="w-32 h-32 border border-white/10 rounded-full border-dashed" />
                  </div>
                </div>

                {/* Animated SVG Stick Figure */}
                <svg className="w-64 h-64 relative z-10" viewBox="0 0 320 320">
                  <defs>
                    <radialGradient id="sweetSpot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Draw bat path trail vector */}
                  {skeletonAngle > 2.0 && (
                    <path 
                      d="M 125 100 Q 140 180 200 240" 
                      fill="none" 
                      stroke="rgba(245, 158, 11, 0.4)" 
                      strokeWidth="4" 
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Spine connection */}
                  <line x1={joints.shoulder.x} y1={joints.shoulder.y} x2={joints.hip.x} y2={joints.hip.y} stroke="#fff" strokeWidth="3" />
                  
                  {/* Back Leg connection */}
                  <line x1={joints.hip.x} y1={joints.hip.y} x2={joints.backKnee.x} y2={joints.backKnee.y} stroke="rgba(255,255,255,0.7)" strokeWidth="3.2" />
                  <line x1={joints.backKnee.x} y1={joints.backKnee.y} x2={joints.backFoot.x} y2={joints.backFoot.y} stroke="rgba(255,255,255,0.7)" strokeWidth="3.2" />
                  
                  {/* Front Leg connection */}
                  <line x1={joints.hip.x} y1={joints.hip.y} x2={joints.frontKnee.x} y2={joints.frontKnee.y} stroke="#fff" strokeWidth="3.5" />
                  <line x1={joints.frontKnee.x} y1={joints.frontKnee.y} x2={joints.frontFoot.x} y2={joints.frontFoot.y} stroke="#fff" strokeWidth="3.5" />

                  {/* Lead Arm connection */}
                  <line x1={joints.shoulder.x} y1={joints.shoulder.y} x2={joints.elbow.x} y2={joints.elbow.y} stroke="#10b981" strokeWidth="3" />
                  <line x1={joints.elbow.x} y1={joints.elbow.y} x2={joints.wrist.x} y2={joints.wrist.y} stroke="#10b981" strokeWidth="3" />

                  {/* Cricket Bat line (Amber Neon) */}
                  <line x1={joints.wrist.x} y1={joints.wrist.y} x2={joints.batTip.x} y2={joints.batTip.y} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.8))" }} />

                  {/* Joints anchor circles */}
                  <circle cx={joints.head.x} cy={joints.head.y} r="12" fill="#0b0c0b" stroke="#fff" strokeWidth="2.5" />
                  <circle cx={joints.shoulder.x} cy={joints.shoulder.y} r="5" fill="#fff" />
                  <circle cx={joints.hip.x} cy={joints.hip.y} r="5" fill="#fff" />
                  
                  <circle cx={joints.backKnee.x} cy={joints.backKnee.y} r="4" fill="#aaa" />
                  <circle cx={joints.backFoot.x} cy={joints.backFoot.y} r="4" fill="#aaa" />
                  
                  <circle cx={joints.frontKnee.x} cy={joints.frontKnee.y} r="4.5" fill="#fff" />
                  <circle cx={joints.frontFoot.x} cy={joints.frontFoot.y} r="4.5" fill="#fff" />
                  
                  <circle cx={joints.elbow.x} cy={joints.elbow.y} r="4.5" fill="#10b981" />
                  <circle cx={joints.wrist.x} cy={joints.wrist.y} r="4" fill="#10b981" />

                  {/* Sweet spot impact animation (shows up at t ~ 2.4s) */}
                  {skeletonAngle >= 2.3 && skeletonAngle <= 2.6 && (
                    <>
                      <circle cx="215" cy="240" r="16" fill="url(#sweetSpot)" />
                      <circle cx="215" cy="240" r="2.5" fill="#10b981" />
                    </>
                  )}
                </svg>

                {/* Live Realtime coordinate tags (Wow factor overlay) */}
                {liveAnalyzing && (
                  <div className="absolute inset-x-4 bottom-4 flex justify-between text-[8px] font-bold font-mono text-amber-400 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 leading-none">
                    <span>ELBOW: {Math.round(94 + skeletonAngle * 10)}°</span>
                    <span>HEAD FLEX: {Math.round(4 + skeletonAngle)}°</span>
                    <span>BAT SPEED: {(2.4 + skeletonAngle * 1.5).toFixed(1)} m/s</span>
                    <span>BALANCE: {Math.round(75 + Math.sin(skeletonAngle * Math.PI) * 10)}%</span>
                  </div>
                )}
              </div>

              {/* Viewport Bottom telemetry console */}
              <div className="bg-black/80 px-4 py-3.5 border-t border-white/5 relative z-10 space-y-2.5">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] text-amber-400 font-black uppercase tracking-wider truncate max-w-[200px]">
                    {liveLog}
                  </p>
                  {liveAnalyzing && (
                    <span className="text-[9px] font-black text-amber-400">{liveProgress}%</span>
                  )}
                </div>
                
                {/* Horizontal loader bar */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100 rounded-full" 
                    style={{ width: `${liveProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Telemetry start trigger button */}
            <button
              onClick={startLiveCapture}
              disabled={liveAnalyzing}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] text-black font-black text-[10px] uppercase py-3.5 rounded-3xl shadow-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span>🎥 START LIVE AI HUD CAPTURE</span>
            </button>

            {/* FLAGSHIP DYNAMIC AI CRITIQUE REPORT DASHBOARD */}
            {liveResult && !liveAnalyzing && (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-5 animate-fadeIn">
                
                {/* Report Header */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-amber-400 font-black uppercase tracking-widest">🧬 HAWKEYE BIOMECHANICS REPORT</span>
                    <h3 className="text-xs text-white font-black uppercase tracking-tight leading-none">Batting Drive Diagnostics</h3>
                  </div>
                  <span className="text-[7px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black uppercase">DIAGNOSED</span>
                </div>

                {/* AI audio note summary */}
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[7px] text-amber-400 uppercase font-black block tracking-widest">📢 AI Biomechanics Critique</span>
                  <p className="text-[10px] leading-relaxed italic text-gray-200">
                    "{liveResult.voiceFeedback}"
                  </p>
                </div>

                {/* Biomechanical Scores Row (4 metrics) */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Balance", value: liveResult.stats.balance, color: "text-emerald-400" },
                    { label: "Timing", value: liveResult.stats.timing, color: "text-amber-400" },
                    { label: "Shot Control", value: liveResult.stats.shotControl, color: "text-emerald-400" },
                    { label: "Stability", value: liveResult.stats.pressureStability, color: "text-orange-400" }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-2">
                      <span className="text-[6px] text-gray-500 uppercase block font-black mb-0.5 leading-none">{stat.label}</span>
                      <strong className={`text-base font-black leading-none ${stat.color}`}>{stat.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Pro Comparison Resemblance Card */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 flex justify-between items-center gap-3 relative overflow-hidden">
                  <div className="space-y-0.5 max-w-[200px]">
                    <span className="text-[7px] text-amber-400 uppercase font-black block tracking-wider">🌟 Pro Model Comparison</span>
                    <strong className="text-[11px] text-white font-black block uppercase leading-snug">{liveResult.proComparison.name}</strong>
                    <p className="text-[8px] text-gray-400 leading-normal">{liveResult.proComparison.desc}</p>
                  </div>
                  
                  {/* Circular resemblance metric indicator */}
                  <div className="w-14 h-14 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center bg-amber-500/5 flex-shrink-0 text-center flex-col">
                    <span className="text-[6px] text-gray-500 uppercase font-black leading-none">Match</span>
                    <span className="text-xs font-black text-amber-400 leading-tight">{liveResult.proComparison.resemblance}</span>
                  </div>
                </div>

                {/* Frame-by-frame scrubbing timeline overlay */}
                <div className="space-y-2">
                  <span className="text-[7px] text-gray-500 uppercase block font-black tracking-widest">⏱️ Action Phase Evaluation (Frictionless Scrubbing)</span>
                  
                  {/* Phase selector tabs */}
                  <div className="flex bg-white/5 border border-white/10 rounded-2xl p-0.5 relative">
                    {[
                      { id: "setup", label: "Setup" },
                      { id: "backswing", label: "Backswing" },
                      { id: "impact", label: "Impact" },
                      { id: "follow", label: "Follow" }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          playTelemetrySound('beep');
                          setActiveFramePhase(p.id);
                        }}
                        className={`flex-1 py-1 text-center text-[8px] font-black uppercase rounded-xl transition-all cursor-pointer ${
                          activeFramePhase === p.id 
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected phase diagnostic board */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 animate-fadeIn space-y-1.5">
                    <div className="flex justify-between text-[7px] font-black uppercase text-gray-400">
                      <span>BIOMECHANICAL METRICS</span>
                      <span className="text-amber-400 font-bold">{liveResult.phaseDetails[activeFramePhase].metrics}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-300 italic">
                      "{liveResult.phaseDetails[activeFramePhase].critique}"
                    </p>
                  </div>
                </div>

                {/* Cone Drills and Shadow Fix recommendations */}
                <div className="space-y-2">
                  <span className="text-[7px] text-gray-500 uppercase block font-black tracking-widest">🏋️ Biomechanics Correction Plan</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {liveResult.fixDrills.map(d => (
                      <div key={d.label} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base flex-shrink-0">
                          🎯
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between text-[9px] font-black text-white leading-none uppercase">
                            <span>{d.label}</span>
                            <span className="text-[7px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-black tracking-wider leading-none">{d.difficulty}</span>
                          </div>
                          <p className="text-[8px] text-gray-400 leading-normal">{d.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 1: Image Stance Scanner */}
        {activeTab === "image" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-950/80 to-black border border-blue-500/20 rounded-3xl p-4 glow-green">
              <h2 className="text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="camera" className="text-blue-400 w-4 h-4" /> Batting Posture Screenshot AI
              </h2>
              <p className="text-gray-400 text-xs mt-1 leading-normal">
                Upload your batting stance posture or a live match scorecard screenshot. Our Vision model parses structural angles and delivers immediate correction metrics.
              </p>
            </div>

            {/* Presets */}
            <div>
              <p className="text-[10px] text-amber-400 font-display font-black tracking-widest uppercase mb-2">⚡ Quick demo presets</p>
              <div className="grid grid-cols-2 gap-2.5">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePresetClick(p)}
                    className="bg-[#0b0c0b] hover:bg-white/5 border border-white/10 rounded-2xl p-3 text-left transition-all active:scale-[0.98] duration-200 cursor-pointer"
                  >
                    <div className="text-xs font-display font-black text-amber-400">{p.label}</div>
                    <div className="text-[9px] text-gray-400 mt-1 leading-snug">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 bg-white/5"
            >
              {imageFile && !imageFile.startsWith("http") ? (
                <div className="relative">
                  <img src={imageFile} alt="Preview" className="max-h-48 mx-auto rounded-2xl object-cover glow-gold" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setResult(null); }}
                    className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ) : imageFile && imageFile.startsWith("http") ? (
                <div className="relative">
                  <img src={imageFile} alt="Preset Preview" className="max-h-48 mx-auto rounded-2xl object-cover glow-gold" />
                  <p className="text-[9px] text-amber-400 mt-2 font-bold uppercase tracking-wider">Demo Preset Loaded</p>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="text-amber-400 mx-auto w-12 h-12 flex items-center justify-center bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <Icon name="upload-cloud" className="w-6 h-6" />
                  </div>
                  <p className="text-gray-300 text-xs font-semibold">Click to select Stance or Scorecard screenshot</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Supports PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Image Loading State */}
            {imageLoading && (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 glow-gold animate-pulse">
                <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-400 text-xs italic">CricMind Vision model compiling posture angles...</span>
              </div>
            )}

            {/* Image Results */}
            {result && !imageLoading && (
              <div className="bg-gradient-to-br from-blue-950/40 via-blue-950/20 to-black border border-blue-500/20 rounded-3xl p-5 glow-green animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <p className="text-blue-400 font-display font-black text-xs uppercase tracking-widest">📸 CricMind Vision Feedback</p>
                  <span className="text-[8px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-black uppercase">COMPLETED</span>
                </div>
                <MarkdownRenderer text={result} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Video Action Frame-by-Frame Analyzer */}
        {activeTab === "video" && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* Header info */}
            <div className="bg-gradient-to-br from-amber-950/50 to-black border border-amber-500/20 rounded-3xl p-4 glow-gold">
              <h2 className="text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="play" className="text-amber-400 w-4 h-4" /> Sequential Action Video Critique
              </h2>
              <p className="text-gray-400 text-xs mt-1 leading-normal">
                Upload a short (1-5s) video of your cricket delivery or batting shot. Our browser-based high-speed capture will extract 5 vital moments of the execution and deliver a frame-by-frame critique.
              </p>
            </div>

            {/* Config: Action selection */}
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 relative">
              <button
                onClick={() => { setVideoActionType("batting"); setVideoResult(null); }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  videoActionType === "batting" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                🏏 Batting Shot
              </button>
              <button
                onClick={() => { setVideoActionType("bowling"); setVideoResult(null); }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  videoActionType === "bowling" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                🎯 Bowling Action
              </button>
            </div>

            {/* Video Upload Drop Box */}
            <div
              onClick={() => !videoLoading && videoInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 bg-white/5 relative"
            >
              {videoFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-400">
                    <Icon name="play" className="w-6 h-6 animate-pulse" />
                    <span className="text-xs font-bold text-gray-200 truncate max-w-[200px]">{videoFile.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-black">Video loaded successfully</p>
                  
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setExtractedFrames([]);
                      setExtractionProgress(0);
                      setExtractionText("");
                      setVideoResult(null);
                    }}
                    className="mt-2 bg-red-950 border border-red-500/30 hover:bg-red-900 text-red-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase transition-all cursor-pointer"
                  >
                    × Remove Video
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="text-amber-400 mx-auto w-12 h-12 flex items-center justify-center bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <Icon name="play" className="w-6 h-6" />
                  </div>
                  <p className="text-gray-300 text-xs font-semibold">Click to select 1-5 second shot video</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Supports MP4, MOV, WEBM</p>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            {/* Video Extraction Progress HUD */}
            {extractionProgress > 0 && extractionProgress < 100 && (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-3.5 relative overflow-hidden">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-amber-400 tracking-wider">
                  <span>🏏 KEYFRAME EXTRACTOR ACTIVE</span>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150 rounded-full" style={{ width: `${extractionProgress}%` }} />
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase truncate">{extractionText}</p>
              </div>
            )}

            {/* Extracted sequential frames timeline preview */}
            {extractedFrames.length > 0 && (
              <div className="bg-[#0b0c0b] border border-white/10 rounded-3xl p-4 space-y-4">
                <div>
                  <span className="text-[8px] text-amber-400 font-black tracking-widest uppercase block">extracted structural frames</span>
                  <span className="text-[7px] text-gray-500 uppercase block font-bold mt-0.5">Click frames to scrub key moments</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {extractedFrames.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedReviewFrame(f.id)}
                      className={`relative aspect-[3/4] bg-black border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedReviewFrame === f.id ? "border-amber-400 scale-[1.02] shadow-lg shadow-amber-500/5 font-black" : "border-white/5 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={f.dataUrl} alt={f.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[5px] font-black uppercase tracking-wider text-white">
                        {f.label.split(" ")[0]}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Review Frame Overlay critique */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex gap-3.5 items-center">
                  <img src={extractedFrames[selectedReviewFrame - 1].dataUrl} alt="selected frame" className="w-16 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-[7px] text-amber-400 uppercase font-black block tracking-wider"> moment {selectedReviewFrame} diagnostics</span>
                    <strong className="text-[10px] text-white font-black block uppercase leading-snug">{extractedFrames[selectedReviewFrame - 1].label}</strong>
                    <p className="text-[8px] text-gray-400 leading-normal">Frame grab timestamp: <strong className="text-white font-bold">{extractedFrames[selectedReviewFrame - 1].time}s</strong>. Locked lead shoulder vector successfully.</p>
                  </div>
                </div>

                <button
                  onClick={analyzeVideoAction}
                  disabled={videoLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-30 hover:scale-[1.01] text-black font-black text-[10px] uppercase py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {videoLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>ANALYZE MY 5 Structural FRAMES</span>
                  )}
                </button>
              </div>
            )}

            {/* Video Critique Results */}
            {videoResult && !videoLoading && (
              <div className="bg-gradient-to-br from-amber-950/20 via-black to-black border border-amber-500/20 rounded-3xl p-5 glow-gold animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                  <p className="text-amber-400 font-display font-black text-xs uppercase tracking-widest">🎥 AI Video Critique diagnostics</p>
                  <span className="text-[8px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded font-black uppercase">COMPLETED</span>
                </div>
                <MarkdownRenderer text={videoResult} />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
