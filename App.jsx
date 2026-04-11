import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import VideoProcessor from './components/VideoProcessor';
import { analyzeVideoIntegrity } from './services/geminiService';
import { AppStatus } from './types';
import LiveCamera from "./components/LiveCamera";

// --- FORENSIC LOG ENTRIES ---
const FORENSIC_LOG_SEQUENCE = [
  "[INIT] Bootstrapping Neural Forensics Engine v4.2...",
  "[INFO] Allocating GPU memory blocks...",
  "[SCAN] Parsing media container headers...",
  "[SCAN] Extracting keyframe indices...",
  "[PROC] Analyzing frame 1 — DCT coefficient mapping...",
  "[PROC] Analyzing frame 5 — Checking compression artifacts...",
  "[PROC] Analyzing frame 9 — Pixel-level noise profiling...",
  "[PROC] Analyzing frame 14 — GAN fingerprint sweep...",
  "[HASH] Computing perceptual hash (pHash) for frames 1–14...",
  "[HASH] Checking neural hashes against deepfake atlas...",
  "[ML]   Running EfficientNet-B7 inference pass...",
  "[ML]   Running XceptionNet anomaly detector...",
  "[ML]   Evaluating temporal coherence across sequence...",
  "[OSINT] Cross-referencing origin metadata...",
  "[OSINT] Querying circulation intel database...",
  "[FACE]  Running facial landmark drift analysis...",
  "[FACE]  Checking blink pattern & micro-expression consistency...",
  "[AUDIO] Decoding audio stream — spectral fingerprint match...",
  "[AUDIO] Phase correlation check between lips & waveform...",
  "[BLEND] Boundary artifact detector active — scanning edges...",
  "[BLEND] Semantic segmentation overlay applied...",
  "[SYN]  Synthesis vector reconstruction — confidence scoring...",
  "[RISK]  Aggregating anomaly scores across all modules...",
  "[OUT]  Generating final integrity report...",
  "[DONE] Analysis complete. Uploading verdict...",
];

// --- ENHANCED NEURAL BLINK, GRID & FORENSIC STYLES ---
const scannerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

  :root {
    --bg-idle: #020204;
    --violet-glow: #6d28d9;
    --glass: rgba(139, 92, 246, 0.03);
    --border: rgba(139, 92, 246, 0.15);
  }

  body {
    margin: 0;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background-color: var(--bg-idle);
    color: #ffffff;
    overflow-x: hidden;
  }

  @keyframes logo-neural-pulse {
    0%, 100% { opacity: 1; filter: brightness(1); text-shadow: 0 0 0px rgba(139, 92, 246, 0); }
    45% { opacity: 0.9; filter: brightness(1.2); text-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
    50% { opacity: 0.5; filter: brightness(2.8) contrast(1.3); text-shadow: 3px 0 12px rgba(255, 255, 255, 0.9), -3px 0 18px rgba(109, 40, 217, 1); }
    55% { opacity: 0.9; filter: brightness(1.2); text-shadow: 0 0 15px rgba(139, 92, 246, 0.4); }
  }

  .logo-animate { animation: logo-neural-pulse 4s infinite cubic-bezier(0.4, 0, 0.2, 1); }
  .theme-transition { transition: background 1.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 1s ease; }

  @keyframes radar-sweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }

  .loader-ring {
    position: absolute;
    border: 2px solid currentColor;
    border-radius: 50%;
    animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  /* Dynamic Themes */
  .theme-idle { background: radial-gradient(circle at 50% -20%, #2e1065 0%, #020204 60%); }
  
  .theme-red { 
    background: radial-gradient(circle at 50% 0%, #450a0a 0%, #020204 80%) !important; 
    --glass: rgba(255, 0, 0, 0.04); --border: rgba(255, 0, 0, 0.3);
  }
  .theme-yellow { 
    background: radial-gradient(circle at 50% 0%, #422006 0%, #020204 80%) !important; 
    --glass: rgba(255, 255, 0, 0.04); --border: rgba(255, 255, 0, 0.3);
  }
  .theme-green { 
    background: radial-gradient(circle at 50% 0%, #064e3b 0%, #020204 80%) !important; 
    --glass: rgba(0, 255, 0, 0.04); --border: rgba(0, 255, 0, 0.3);
  }

  .glass-card {
    background: var(--glass);
    backdrop-filter: blur(40px);
    border: 1px solid var(--border);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .ambient-orb {
    position: absolute; width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    filter: blur(80px); animation: pulse-orb 10s infinite alternate;
    pointer-events: none; z-index: 1;
  }

  @keyframes scan-line { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100%); opacity: 0; } }
  .scanning-overlay::after {
    content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: #ffffff; box-shadow: 0 0 20px #ffffff;
    animation: scan-line 3s linear infinite;
  }

  .custom-scroll::-webkit-scrollbar { width: 4px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

  .map-glow {
    background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    position: relative; border-radius: 2rem; overflow: hidden;
  }
  .pulse-node {
    position: absolute; width: 6px; height: 6px; background: #6d28d9; border-radius: 50%;
    box-shadow: 0 0 10px #6d28d9; animation: pulse-node-scale 2s infinite;
  }
  @keyframes pulse-node-scale { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3.5); opacity: 0; } }

  /* Neural Grid Canvas */
  .canvas-container {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  /* Technical Log Terminal */
  .tech-log-terminal {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 1rem;
    padding: 1rem 1.25rem;
    max-height: 220px;
    overflow-y: auto;
    position: relative;
  }
  .tech-log-terminal::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 40px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
    pointer-events: none;
    border-radius: 1rem 1rem 0 0;
    z-index: 2;
  }
  .tech-log-terminal::-webkit-scrollbar { width: 3px; }
  .tech-log-terminal::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 10px; }

  .log-line {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 10px;
    line-height: 1.7;
    opacity: 0;
    animation: log-appear 0.2s forwards;
  }
  @keyframes log-appear {
    from { opacity: 0; transform: translateX(-4px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .log-tag-init  { color: #818cf8; }
  .log-tag-scan  { color: #38bdf8; }
  .log-tag-proc  { color: #a78bfa; }
  .log-tag-hash  { color: #fb923c; }
  .log-tag-ml    { color: #34d399; }
  .log-tag-osint { color: #f472b6; }
  .log-tag-face  { color: #facc15; }
  .log-tag-audio { color: #60a5fa; }
  .log-tag-blend { color: #c084fc; }
  .log-tag-syn   { color: #f87171; }
  .log-tag-risk  { color: #fbbf24; }
  .log-tag-out   { color: #86efac; }
  .log-tag-done  { color: #4ade80; font-weight: 700; }
  .log-tag-info  { color: #94a3b8; }
  .log-cursor {
    display: inline-block;
    width: 6px;
    height: 11px;
    background: #8b5cf6;
    margin-left: 2px;
    animation: blink-cursor 0.8s step-end infinite;
    vertical-align: text-bottom;
  }
  @keyframes blink-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
`;
const App = () => {
    const [isLanding, setIsLanding] = useState(true);
    const [status, setStatus] = useState(AppStatus.IDLE);
    const [progress, setProgress] = useState(0);
    const [frames, setFrames] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [techLog, setTechLog] = useState([]);
    const intervalRef = useRef(null);
    const logIntervalRef = useRef(null);
    const canvasRef = useRef(null);
    const logEndRef = useRef(null);
    // --- COMPREHENSIVE THEME LOGIC ---
    const theme = useMemo(() => {
        if (!analysis)
            return { class: 'theme-idle', border: 'border-violet-500/20', text: 'text-white', scanner: 'text-violet-400' };
        const verdictStr = analysis.verdict.toUpperCase();
        const redKeywords = ['DEEPFAKE', 'AI', 'SYNTHETIC', 'MANIPULATED', 'COMPOSITE', 'GENERATED', 'NCII', 'ALTERED', 'DIGITAL', 'FAKE', 'FABRICATED', 'SATIRICAL', 'MANIPULATION'];
        const isRed = redKeywords.some(keyword => verdictStr.includes(keyword)) || analysis.isExplicit;
        const yellowKeywords = ['SUSPICIOUS', 'INCONSISTENT', 'ARTIFACT', 'UNCERTAIN'];
        const isYellow = yellowKeywords.some(keyword => verdictStr.includes(keyword));
        if (isRed)
            return {
                class: 'theme-red',
                border: 'border-red-500/50',
                text: 'text-red-500',
                scanner: 'text-red-600'
            };
        if (isYellow)
            return {
                class: 'theme-yellow',
                border: 'border-yellow-500/30',
                text: 'text-yellow-500',
                scanner: 'text-yellow-500'
            };
        return {
            class: 'theme-green',
            border: 'border-emerald-500/30',
            text: 'text-emerald-500',
            scanner: 'text-emerald-400'
        };
    }, [analysis]);
    const scannerColor = useMemo(() => {
        if (progress < 25) {
            return 'text-voilet-400';
        }
        else if (progress < 50) {
            return 'text-red-500';
        }
        else if (progress < 75) {
            return 'text-yellow-500';
        }
        else if (progress < 100) {
            return 'text-green-500';
        }
    }, [progress]);
    const handleClearUpload = useCallback(() => {
        if (intervalRef.current)
            clearInterval(intervalRef.current);
        setFrames([]);
        setAnalysis(null);
        setProgress(0);
        setError(null);
        setStatus(AppStatus.IDLE);
    }, []);
    const handleDownloadReport = () => {
        if (!analysis)
            return;
        const report = `
  SACHAI – FORENSIC & OSINT REPORT
  ================================

  FINAL VERDICT
  -------------
  ${analysis.verdict}

  INTEGRITY SCORE
  ---------------
  ${analysis.integrityScore}%

  RISK LEVEL
  ----------
  ${analysis.riskLevel}

  TECHNICAL SUMMARY
  -----------------
  ${analysis.explanation}

  DETECTED ANOMALIES
  ------------------
  ${analysis.anomalies?.map((a, i) => `${i + 1}. ${a.description} (Severity: ${a.severity}, Time: ${a.timestamp}s)`).join("\n") || "None detected"}

  OSINT & CIRCULATION INTELLIGENCE
  --------------------------------
  Probable Origin   : ${analysis.probableOrigin || "Unknown"}
  Content Theme    : ${analysis.contentTheme || "Unclassified"}
  OSINT Confidence : ${analysis.osintConfidence || "Low"}

  Likely Circulation Channels:
  ${analysis.circulationChannels?.join(", ") || "Undetermined"}

  SAFETY RECOMMENDATION
  ---------------------
  ${analysis.safetyRecommendation}

  Generated by SachAI – Neural Forensics Unit
  `;
        const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "SachAI_Forensic_Report.txt";
        link.click();
        URL.revokeObjectURL(url);
    };
    const handleFramesExtracted = useCallback(async (extractedFrames) => {
        setFrames(extractedFrames);
        setStatus(AppStatus.ANALYZING);
        setTechLog([]);

        // --- Technical Log Typewriter ---
        let logIdx = 0;
        logIntervalRef.current = setInterval(() => {
            if (logIdx < FORENSIC_LOG_SEQUENCE.length) {
                setTechLog(prev => [...prev, FORENSIC_LOG_SEQUENCE[logIdx]]);
                logIdx++;
            } else {
                clearInterval(logIntervalRef.current);
            }
        }, 420);

        let sim = 0;
        intervalRef.current = setInterval(() => {
            sim += 1;
            if (sim <= 98)
                setProgress(sim);
        }, 80);
        try {
            const result = await analyzeVideoIntegrity(extractedFrames);
            if (intervalRef.current)
                clearInterval(intervalRef.current);
            if (logIntervalRef.current)
                clearInterval(logIntervalRef.current);
            setProgress(100);
            setAnalysis(result);
            setStatus(AppStatus.COMPLETED);
        }
        catch (err) {
            if (intervalRef.current) 
                clearInterval(intervalRef.current);
            if (logIntervalRef.current)
                clearInterval(logIntervalRef.current);
            setError(err?.message || "Scanner Failure");
            setStatus(AppStatus.ERROR);
        }
    }, []);
    // --- NEURAL GRID + NEURON PARTICLE SYSTEM ---
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId;
        let w, h;

        const GRID_COLS = 28;
        const GRID_ROWS = 18;
        const NUM_PARTICLES = 55;
        let nodes = [];
        let particles = [];
        let time = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            buildGrid();
        };

        const buildGrid = () => {
            nodes = [];
            const colStep = w / GRID_COLS;
            const rowStep = h / GRID_ROWS;
            for (let r = 0; r <= GRID_ROWS; r++) {
                for (let c = 0; c <= GRID_COLS; c++) {
                    nodes.push({
                        baseX: c * colStep,
                        baseY: r * rowStep,
                        x: c * colStep,
                        y: r * rowStep,
                        pulse: Math.random() * Math.PI * 2,
                        pulseSpeed: 0.008 + Math.random() * 0.012,
                        active: Math.random() > 0.7,
                    });
                }
            }
            // Reset particles against new grid
            particles = Array.from({ length: NUM_PARTICLES }, () => spawnParticle(true));
        };

        const spawnParticle = (randomStart = false) => {
            // Pick a random node as source, travel to a neighbor
            const n = nodes[Math.floor(Math.random() * nodes.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.6 + Math.random() * 1.4;
            return {
                x: n.baseX,
                y: n.baseY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: randomStart ? Math.random() : 1,
                maxLife: 1,
                size: 1.2 + Math.random() * 2,
                hue: 260 + Math.random() * 60,
                trail: [],
            };
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            time += 0.012;

            const colStep = w / GRID_COLS;
            const rowStep = h / GRID_ROWS;

            // --- Draw grid lines ---
            ctx.lineWidth = 0.4;
            for (let r = 0; r <= GRID_ROWS; r++) {
                for (let c = 0; c <= GRID_COLS; c++) {
                    const idx = r * (GRID_COLS + 1) + c;
                    const node = nodes[idx];
                    node.pulse += node.pulseSpeed;
                    const wobble = Math.sin(node.pulse) * 3;
                    node.x = node.baseX + Math.sin(time * 0.4 + c * 0.3) * wobble;
                    node.y = node.baseY + Math.cos(time * 0.3 + r * 0.3) * wobble;

                    // Horizontal line to right neighbor
                    if (c < GRID_COLS) {
                        const rn = nodes[idx + 1];
                        const alpha = 0.04 + Math.abs(Math.sin(time + c * 0.2 + r * 0.15)) * 0.06;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(rn.x, rn.y);
                        ctx.stroke();
                    }
                    // Vertical line to bottom neighbor
                    if (r < GRID_ROWS) {
                        const bn = nodes[idx + (GRID_COLS + 1)];
                        const alpha = 0.04 + Math.abs(Math.sin(time + r * 0.2 + c * 0.15)) * 0.06;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(109,40,217,${alpha})`;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(bn.x, bn.y);
                        ctx.stroke();
                    }
                }
            }

            // --- Draw grid nodes ---
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!node.active) continue;
                const glow = 0.15 + Math.abs(Math.sin(node.pulse)) * 0.4;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139,92,246,${glow})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(139,92,246,0.6)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // --- Draw neuron particles ---
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > 18) p.trail.shift();

                // Draw trail
                for (let t = 1; t < p.trail.length; t++) {
                    const trailAlpha = (t / p.trail.length) * p.life * 0.55;
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${p.hue},80%,70%,${trailAlpha})`;
                    ctx.lineWidth = (t / p.trail.length) * p.size * 0.7;
                    ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y);
                    ctx.lineTo(p.trail[t].x, p.trail[t].y);
                    ctx.stroke();
                }

                // Draw particle head
                const headAlpha = p.life * 0.9;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue},85%,78%,${headAlpha})`;
                ctx.shadowBlur = 14;
                ctx.shadowColor = `hsla(${p.hue},80%,60%,0.8)`;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Steer toward nearest grid node
                let nearestDist = Infinity;
                let nearest = null;
                for (let n = 0; n < nodes.length; n++) {
                    const dx = nodes[n].x - p.x;
                    const dy = nodes[n].y - p.y;
                    const d = dx * dx + dy * dy;
                    if (d < nearestDist) { nearestDist = d; nearest = nodes[n]; }
                }
                if (nearest && nearestDist < (colStep * 1.5) ** 2) {
                    const pull = 0.04;
                    p.vx += (nearest.x - p.x) * pull * 0.01;
                    p.vy += (nearest.y - p.y) * pull * 0.01;
                }

                // Dampen & move
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.006;

                // Respawn
                if (p.life <= 0 || p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
                    particles[i] = spawnParticle();
                }
            }

            // --- Draw original swirling ribbon ---
            ctx.beginPath();
            ctx.lineWidth = 18;
            const gradient = ctx.createLinearGradient(0, 0, w, 0);
            gradient.addColorStop(0, 'rgba(109, 40, 217, 0)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(109, 40, 217, 0)');
            ctx.strokeStyle = gradient;
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgba(109, 40, 217, 0.6)';
            ctx.lineCap = 'round';
            ctx.moveTo(-100, h / 2);
            for (let x = 0; x < w + 100; x += 5) {
                const y = h / 2 +
                    Math.sin(x * 0.0012 + time * 0.55) * 180 +
                    Math.cos(x * 0.0008 - time * 0.44) * 100;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Auto-scroll tech log to bottom
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [techLog]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        };
    }, []);
    return (<div className={`min-h-screen ${isLanding ? 'theme-idle' : theme.class} transition-colors duration-1000 flex flex-col relative theme-transition`}>
      <style>{scannerStyles}</style>
      
      {/* PERSISTENT AMBIENT BACKGROUND */}
      <canvas ref={canvasRef} className="canvas-container"/>
      
      <div className="grain"/>
      
      {isLanding ? (<div className="flex-grow flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
          <div className="ambient-orb"/>
          <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-1000 max-w-4xl">
            <div className="inline-block px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 mb-4 backdrop-blur-md">
               <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.4em]">Advanced Media Forensic Analysis</span>
            </div>
            
            <div className="relative">
              <h1 className="logo-animate text-8xl md:text-[12rem] font-black tracking-tighter  leading-none bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">सचAI</h1>
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm font-bold text-violet-300/40 uppercase tracking-[0.8em]">SachAI by Rocket // 2026</p>
              <div className="flex flex-col gap-1 items-center">
                <p className="text-[10px] font-medium text-zinc-500 tracking-[0.2em] uppercase">Neural Forensics Unit</p>
                <p className="text-[9px] font-black text-red-500/50 tracking-[0.3em] uppercase animate-pulse">Digitally Altered Media Protection Active</p>
              </div>
            </div>

            <div className="pt-12">
              <button onClick={() => setIsLanding(false)} className="group relative px-16 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] active:scale-95">
                <div className="absolute inset-0 bg-violet-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
                <span className="relative group-hover:text-white transition-colors duration-300">Start Verification</span>
              </button>
            </div>
          </div>
        </div>) : (<>
          <nav className="glass-card border-b border-white/5 px-6 py-4 sticky top-0 z-50">
            <div className="max-w-[1800px] mx-auto flex flex-wrap justify-between items-center gap-4">
              <div className="cursor-pointer flex items-baseline gap-3" onClick={() => setIsLanding(true)}>
                <span className="logo-animate text-2xl font-black  tracking-tighter uppercase bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">सचAI</span>
                <span className="hidden sm:inline text-[10px] opacity-40 font-mono tracking-widest uppercase">Node_{status}</span>
              </div>

              {analysis && (<div className="flex-1 hidden xl:flex items-center justify-center gap-10 px-8 py-2 bg-white/[0.03] rounded-full border border-white/10">
                  <div className="flex flex-col"><span className="text-[7px] font-black opacity-30 uppercase tracking-[0.3em]">Origin</span><span className="text-[10px] font-bold text-violet-400">{analysis.probableOrigin || 'Scanning...'}</span></div>
                  <div className="w-[1px] h-4 bg-white/10"/>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black opacity-30 uppercase tracking-[0.3em]">Confidence</span>
                    <span className={`text-[10px] font-black uppercase ${theme.text}`}>{analysis.osintConfidence || 'Pending'}</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/10"/>
                  <div className="flex flex-col"><span className="text-[7px] font-black opacity-30 uppercase tracking-[0.3em]">Theme</span><span className="text-[10px] font-bold text-white/80">{analysis.contentTheme || 'General'}</span></div>
                </div>)}
              <div className="px-4 py-1.5 bg-white/5 rounded border border-white/10 text-[9px] font-bold uppercase tracking-widest text-violet-400">System_Active</div>
            </div>
          </nav>

          <main className="flex-grow max-w-[1800px] mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            <div className="lg:col-span-4 space-y-6">
              <div className={`glass-card p-6 rounded-3xl border ${theme.border}`}>
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-6">Evidence_Input</h3>
                {status === AppStatus.IDLE ? (<div className="space-y-4">
                  <VideoProcessor onFramesExtracted={handleFramesExtracted} onProcessingUpdate={setProgress} onError={setError}/>

                  <div className="text-center text-xs opacity-50">OR</div>

                  <LiveCamera onCapture={handleFramesExtracted}/>
                  </div>) : (<div className="space-y-6">
                    <div className={`aspect-video rounded-xl overflow-hidden border border-white/10 relative bg-black/40 ${status === AppStatus.ANALYZING ? 'scanning-overlay' : ''}`}>
                      <img src={frames[0]?.dataUrl} className="w-full h-full object-contain" alt="Evidence"/>
                    </div>
                    <button onClick={handleClearUpload} className="w-full py-3 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-lg hover:bg-white/5 transition-all text-zinc-400 hover:text-white">Clear Upload</button>
                  </div>)}
              </div>
              {analysis && (<div className={`glass-card p-6 rounded-3xl border ${theme.border} space-y-6 animate-in slide-in-from-left-4`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-violet-400"><span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"/> Counter Measures</h4>
                  <p className="text-sm font-medium leading-relaxed opacity-80 italic">{analysis.activeCountermeasure || analysis.safetyRecommendation}</p>
                  <div className="space-y-3 pt-2">
                    {analysis.isExplicit && (<a href="https://stopncii.org" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center w-full p-4 bg-white text-black rounded-2xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
                        <span className="relative text-[11px] font-black uppercase tracking-[0.2em]">Takedown from Web</span>
                      </a>)}
                    {(analysis.isExplicit || theme.class === 'theme-red') && (<a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full p-4 border border-red-500/40 text-red-500 rounded-2xl transition-all hover:bg-red-500/10 hover:border-red-500 active:scale-[0.98] group">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">File Legal Report</span>
                      </a>)}
                  </div>
                  
                  <button onClick={handleDownloadReport} className={`group relative w-full py-4 px-6 mt-4 flex items-center justify-center gap-3 
                      bg-transparent border ${theme.border} rounded-xl overflow-hidden 
                      transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] 
                      active:scale-[0.98]`}>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300"/>
                    <svg className={`w-4 h-4 ${theme.text} transition-transform duration-300 group-hover:-translate-y-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-200 group-hover:text-white transition-colors">Download Report</span>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"/>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"/>
                  </button>
                </div>)}
            </div>

            <div className="lg:col-span-8">
              <div className={`glass-card rounded-[2.5rem] p-6 md:p-12 min-h-[600px] flex flex-col border border-white/5 relative overflow-hidden theme-transition`}>
                {status === AppStatus.ANALYZING ? (<div className="flex-grow flex flex-col items-center justify-center space-y-8 py-12 relative z-10 w-full">
                    {/* Radar Scanner */}
                    <div className={`relative w-40 h-40 flex items-center justify-center transition-colors duration-1000 ${scannerColor}`}>
                      <div className="loader-ring w-full h-full opacity-20"/><div className="loader-ring w-3/4 h-3/4 opacity-40"/>
                      <div className="absolute w-full h-full border border-current opacity-10 rounded-full"/>
                      <div className="absolute w-full h-full border-t-2 border-current rounded-full" style={{ animation: 'radar-sweep 2s linear infinite' }}/>
                      <div className="flex flex-col items-center justify-center">
                        <div className="font-mono text-[10px] animate-pulse tracking-[0.3em] mb-1">SCANNING</div>
                        <div className="font-mono text-xl font-black">{progress}%</div>
                      </div>
                    </div>
                    <div className={`text-lg font-black tracking-[0.6em] uppercase transition-colors duration-1000 ${scannerColor}`}>Analysis In Progress</div>

                    {/* Technical Log Terminal */}
                    <div className="tech-log-terminal w-full max-w-2xl">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-500/10">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block"/>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70 inline-block"/>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70 inline-block"/>
                        <span className="ml-2 text-[9px] font-mono text-violet-400/60 uppercase tracking-widest">sachAI_forensic_engine // technical_log</span>
                      </div>
                      {techLog.filter(Boolean).map((line, i) => {
                        const tag = (typeof line === 'string' && line.match(/^\[([A-Z]+)\]/))?.[1]?.toLowerCase() || 'info';
                        return (
                          <div key={i} className="log-line">
                            <span className={`log-tag-${tag} shrink-0`}>{typeof line === 'string' ? line.match(/^(\[[A-Z]+\])/)?.[1] : ''}</span>
                            <span className="text-zinc-400">{typeof line === 'string' ? line.replace(/^\[[A-Z]+\]\s*/, '') : ''}</span>
                          </div>
                        );
                      })}
                      {techLog.length < FORENSIC_LOG_SEQUENCE.length && (
                        <div className="log-line">
                          <span className="log-tag-info">{'>'}</span>
                          <span className="log-cursor"/>
                        </div>
                      )}
                      <div ref={logEndRef}/>
                    </div>

                  </div>) : analysis ? (

                    /* ====== REDESIGNED ANALYSIS RESULTS ====== */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 space-y-8 overflow-y-auto custom-scroll pr-1">

                      {/* ── SECTION 1: VERDICT HERO ── */}
                      <div className={`relative rounded-3xl p-8 overflow-hidden border ${theme.border}`} style={{background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(255,255,255,0.02) 100%)'}}>
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 rounded-tl-3xl" style={{borderColor: 'currentColor', opacity: 0.3}}/>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 rounded-br-3xl" style={{borderColor: 'currentColor', opacity: 0.3}}/>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${theme.class === 'theme-red' ? 'bg-red-500' : theme.class === 'theme-yellow' ? 'bg-yellow-400' : 'bg-emerald-400'}`}/>
                              <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-40">Neural Forensics — Final Verdict</span>
                            </div>
                            <h2 className={`text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter ${theme.text}`}>{analysis.verdict}</h2>
                            <p className="text-sm font-medium text-zinc-400 mt-3 max-w-md leading-relaxed">{analysis.safetyRecommendation}</p>
                          </div>
                          {/* Score Ring */}
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <div className={`relative w-28 h-28 flex items-center justify-center rounded-full border-4 ${theme.class === 'theme-red' ? 'border-red-500/40' : theme.class === 'theme-yellow' ? 'border-yellow-400/40' : 'border-emerald-400/40'}`} style={{boxShadow: `0 0 30px ${theme.class === 'theme-red' ? 'rgba(239,68,68,0.2)' : theme.class === 'theme-yellow' ? 'rgba(234,179,8,0.2)' : 'rgba(52,211,153,0.2)'}`}}>
                              <div className="text-center">
                                <div className={`text-3xl font-black leading-none ${theme.text}`}>{analysis.integrityScore}%</div>
                                <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-1">SachAI Score</div>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${theme.border} ${theme.text}`}>{analysis.riskLevel || 'Risk Level'}</span>
                          </div>
                        </div>
                      </div>

                      {/* ── SECTION 2: TWO-COL GRID ── */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* Technical Analysis */}
                        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Technical Analysis</h4>
                          </div>
                          <p className="text-sm font-light leading-relaxed text-zinc-300">{analysis.explanation}</p>
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                              { label: 'Origin', value: analysis.probableOrigin || 'Unknown', icon: '🌐' },
                              { label: 'Theme', value: analysis.contentTheme || 'Unclassified', icon: '🏷️' },
                              { label: 'Confidence', value: analysis.osintConfidence || 'Low', icon: '🎯' },
                            ].map((item, i) => (
                              <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-center">
                                <div className="text-base mb-1">{item.icon}</div>
                                <div className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">{item.label}</div>
                                <div className={`text-[10px] font-bold ${i === 2 ? theme.text : 'text-zinc-200'} leading-tight`}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Detected Anomalies */}
                        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Detected Anomalies</h4>
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">{analysis.anomalies?.length || 0} found</span>
                          </div>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scroll">
                            {analysis.anomalies?.length > 0 ? analysis.anomalies.map((a, i) => (
                              <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${a.severity === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]'}`}/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white/90 leading-snug">{a.description}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">t:{a.timestamp}s</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${a.severity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-400/10 text-yellow-400'}`}>{a.severity}</span>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="flex items-center justify-center h-20 text-emerald-400/60 text-xs font-mono">No anomalies detected</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── SECTION 3: OSINT + CIRCULATION ── */}
                      <div className="glass-card rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center gap-2 mb-5">
                          <svg className="w-3.5 h-3.5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
                          <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest">OSINT & Circulation Intelligence</h4>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 map-glow h-44 border border-white/5 flex items-center justify-center relative bg-black/40">
                            <div className="pulse-node top-1/4 left-1/3"/><div className="pulse-node top-2/3 left-1/2"/>
                            <div className="pulse-node top-1/3 left-3/4"/><div className="pulse-node top-1/2 left-1/4"/>
                            <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.8em] text-center px-4">Global Signal Map</span>
                          </div>
                          <div className="flex-1 space-y-3">
                            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Likely Circulation Channels</p>
                            <div className="flex flex-wrap gap-2">
                              {(analysis.circulationChannels?.length > 0 ? analysis.circulationChannels : ['Telegram', 'X/Twitter', 'Instagram', 'Reddit']).map((ch, i) => (
                                <span key={i} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 ${theme.class === 'theme-red' ? 'bg-red-500/10 border-red-500/20 text-red-300' : theme.class === 'theme-yellow' ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-300' : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-300'}`}>{ch}</span>
                              ))}
                            </div>
                            <div className="pt-3 space-y-2">
                              {[
                                { label: 'Probable Origin', value: analysis.probableOrigin || 'Undetermined' },
                                { label: 'Content Theme', value: analysis.contentTheme || 'Unclassified' },
                              ].map((row, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                  <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{row.label}</span>
                                  <span className="text-[10px] font-bold text-zinc-200">{row.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  ) : (<div className="flex-grow flex flex-col items-center justify-center opacity-10 select-none">
                    <h2 className="logo-animate text-7xl md:text-[10rem] font-black italic tracking-tighter uppercase mb-4">सचAI</h2>
                  </div>)}
              </div>
            </div>
          </main>

          <footer className="p-8 mt-auto border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[9px] font-black opacity-30 tracking-[0.5em] uppercase gap-4">
              <div>SachAI by Rocket // India</div>
            </div>
          </footer>
        </>)}
    </div>);
};
export default App;
