"use client";

import { Button } from "@/components/ui/button";
import { calculateLaserPath, type Level, type Mirror } from "@/lib/game-engine";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export default function PrismGame() {
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'ACTIVE' | 'WON' | 'LOST'>('IDLE');
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [userMirrors, setUserMirrors] = useState<Mirror[]>([]);
  const [laserPath, setLaserPath] = useState<{ x: number, y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const startNewLevel = useCallback(async () => {
    setStatus('SYNCING');
    try {
      const res = await fetch("/api/game/start");
      const data = await res.json();
      setLevelData(data.level);
      setSessionId(data.sessionId);
      setUserMirrors(data.level.mirrors);
      setStatus('ACTIVE');
    } catch (err) {
      setMessage("Session generation failed.");
      setStatus('IDLE');
    }
  }, []);

  const rotateMirror = (id: string) => {
    if (status !== 'ACTIVE') return;
    setUserMirrors(prev => prev.map(m =>
      m.id === id ? { ...m, rotation: (m.rotation + 45) % 180 } : m
    ));
  };

  const currentPath = useMemo(() => {
    if (!levelData) return [];
    return calculateLaserPath(levelData, userMirrors);
  }, [levelData, userMirrors]);

  const validateSolution = async () => {
    if (!sessionId) return;
    setStatus('SYNCING');
    try {
      const res = await fetch("/api/game/validate", {
        method: "POST",
        body: JSON.stringify({ sessionId, mirrors: userMirrors })
      });
      const data = await res.json();
      if (data.success) {
        setScore(s => s + 100);
        setStatus('WON');
      } else {
        setMessage(data.message);
        setStatus('LOST');
      }
    } catch (err) {
      setMessage("Validation service error.");
      setStatus('ACTIVE');
    }
  };

  const getLinePoints = (path: { x: number, y: number }[]) => {
    return path.map(p => `${p.x * 60 + 30},${p.y * 60 + 30}`).join(" ");
  };

  return (
    <main className="min-h-screen bg-[#02040a] text-zinc-100 p-6 flex items-center justify-center font-sans grid-background select-none">
      <div className="scanlines" />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full relative z-10 flex flex-col gap-8">

        {/* HUD */}
        <div className="flex justify-between items-center glass-morphism p-4 rounded-3xl">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Prism Protocol</span>
            <span className="text-xl font-bold tracking-tight">Active Matrix</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Score</span>
              <span className="text-xl font-mono">{score}</span>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Board */}
        <div className="relative aspect-square glass-morphism rounded-3xl overflow-hidden p-6 flex items-center justify-center bg-black/20">

          {/* Grid Layout */}
          <div className="grid grid-cols-5 grid-rows-5 gap-0 relative w-full h-full border border-white/5 bg-white/[0.02]">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="border border-white/5 opacity-50" />
            ))}

            {/* Laser SVG Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 300 300"
            >
              <defs>
                <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <polyline
                points={getLinePoints(currentPath)}
                fill="none"
                stroke="#00ff80"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#laser-glow)"
                className="animate-laser"
              />
            </svg>

            {/* Source */}
            {levelData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ gridColumnStart: levelData.source.position.x + 1, gridRowStart: levelData.source.position.y + 1 }}
                className="flex items-center justify-center z-10 relative pointer-events-none"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center node-glow">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
              </motion.div>
            )}

            {/* Target */}
            {levelData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ gridColumnStart: levelData.target.position.x + 1, gridRowStart: levelData.target.position.y + 1 }}
                className="flex items-center justify-center z-10 relative pointer-events-none"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border-2 border-dashed border-purple-500/50 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-purple-400 blur-[2px]" />
                </div>
              </motion.div>
            )}

            {/* User Mirrors */}
            {userMirrors.map(m => (
              <motion.div
                key={m.id}
                style={{ gridColumnStart: m.position.x + 1, gridRowStart: m.position.y + 1 }}
                className="flex items-center justify-center z-20"
              >
                <motion.div
                  onClick={() => rotateMirror(m.id)}
                  animate={{ rotate: m.rotation }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 glass-morphism rounded-xl cursor-pointer flex items-center justify-center group overflow-hidden border-white/20"
                >
                  <div className="w-[80%] h-1 bg-white/40 group-hover:bg-white/80 transition-colors shadow-[0_0_10px_white]" />
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {status === 'IDLE' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#02040a]/80 backdrop-blur-xl"
              >
                <div className="text-center space-y-8 p-12">
                  <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase bg-gradient-to-br from-white to-zinc-600 bg-clip-text text-transparent">PRISM</h1>
                  <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">Crystal Alignment Required</p>
                  <Button
                    size="lg"
                    onClick={startNewLevel}
                    className="rounded-none border-2 border-white bg-white text-[#02040a] hover:bg-transparent hover:text-white transition-all px-12 py-8 text-xl font-black uppercase italic"
                  >
                    Initiate
                  </Button>
                </div>
              </motion.div>
            )}

            {(status === 'WON' || status === 'LOST') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
              >
                <div className="text-center p-8 glass-morphism rounded-3xl space-y-6">
                  {status === 'WON' ? (
                    <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  )}
                  <h2 className={cn("text-2xl font-black uppercase tracking-tight", status === 'WON' ? "text-emerald-400" : "text-red-400")}>
                    {status === 'WON' ? "Alignment Complete" : "Matrix Collision"}
                  </h2>
                  <p className="text-zinc-500 text-sm">{status === 'WON' ? "Signal synchronized with Node A-7." : message}</p>
                  <Button
                    onClick={startNewLevel}
                    className="w-full py-6 rounded-2xl bg-white text-black font-black uppercase"
                  >
                    New Sequence
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-zinc-600 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Controls // Rotate: Click Node</span>
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-right">
              Linode Sync Engine v1<br />
              Serverless Auth Active
            </span>
          </div>
          {status === 'ACTIVE' && (
            <Button
              onClick={validateSolution}
              size="lg"
              className="h-16 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/20"
            >
              Verify Alignment
            </Button>
          )}
        </div>

      </div>
    </main>
  );
}
