"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Terminal,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Obstacle = { lane: number, type: 'wall' | 'core', id: string };
type Wave = { id: string, obstacles: Obstacle[], speed: number };

export default function SynthGrid() {
  const [status, setStatus] = useState<'IDLE' | 'SYNCING' | 'ACTIVE' | 'COLLISION' | 'SUCCESS'>('IDLE');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [currentWave, setCurrentWave] = useState<Wave | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [message, setMessage] = useState("");

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWave = useCallback(async (currentLevel: number, sid: string) => {
    try {
      const res = await fetch(`/api/game/start?level=${currentLevel}&sessionId=${sid}`);
      const data = await res.json();
      setCurrentWave(data.wave);
      setSessionId(data.sessionId);
      setStatus('ACTIVE');
    } catch (e) {
      setMessage("LINK INTERRUPTED");
      setStatus('IDLE');
    }
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setLane(1);
    setStatus('SYNCING');
    fetchWave(1, "");
  };

  const moveLane = (dir: 'L' | 'R') => {
    if (status !== 'ACTIVE') return;
    if (dir === 'L' && lane > 0) setLane(lane - 1);
    if (dir === 'R' && lane < 2) setLane(lane + 1);
  };

  const handleWaveEnd = async () => {
    if (status !== 'ACTIVE') return;

    const core = currentWave?.obstacles.find(o => o.type === 'core');
    const wallCollision = currentWave?.obstacles.some(o => o.type === 'wall' && o.lane === lane);

    if (wallCollision) {
      setStatus('COLLISION');
      setMessage("SYSTEM CRITICAL: COLLISION DETECTED");
      return;
    }

    if (core && core.lane === lane) {
      setScore(s => s + 100);
      setStatus('SUCCESS');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#ff00ff']
      });
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setStatus('SYNCING');
        fetchWave(nextLevel, sessionId);
      }, 1500);
    } else {
      // Missed core but didn't hit wall
      setStatus('SUCCESS');
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setStatus('SYNCING');
        fetchWave(nextLevel, sessionId);
      }, 1000);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveLane('L');
      if (e.key === 'ArrowRight') moveLane('R');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lane, status]);

  return (
    <main className="min-h-screen relative flex items-center justify-center p-6 crt-flicker">
      <div className="scanline" />

      {/* 3D Grid Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="grid-floor absolute inset-0 bottom-[-50%] top-1/2" />
        <div className="grid-floor absolute inset-0 top-[-50%] bottom-1/2 rotate-180" />
      </div>

      <div className="max-w-4xl w-full relative z-10 flex flex-col gap-8">

        {/* HUD */}
        <div className="flex justify-between items-center px-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] text-neon-blue font-bold uppercase tracking-widest">System Level</span>
            <span className="text-2xl font-black neon-text">v0.{level}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-neon-pink animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Neural Link</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-neon-blue/30 text-neon-blue uppercase px-3 py-1 bg-neon-blue/5">
              {status}
            </Badge>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neon-pink font-bold uppercase tracking-widest">Score Pulse</span>
            <span className="text-2xl font-black neon-text text-neon-pink">{score}</span>
          </div>
        </div>

        {/* Main Stage */}
        <div className="relative h-[400px] md:h-[500px] w-full bg-black/40 border-y border-white/10 overflow-hidden flex perspective-[1000px]">

          {/* Lanes */}
          {[0, 1, 2].map(i => (
            <div key={i} className={cn(
              "flex-1 border-x border-white/5 relative",
              lane === i && "bg-neon-blue/5"
            )}>
              {/* Lane Indicator */}
              {lane === i && (
                <motion.div
                  layoutId="player"
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 w-12 h-12"
                >
                  <div className="w-full h-full neon-border rounded-xl bg-neon-blue/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-neon-blue animate-pulse" />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-2 bg-neon-blue/40 blur-md rounded-full mt-2" />
                </motion.div>
              )}
            </div>
          ))}

          {/* Active Wave */}
          <AnimatePresence>
            {status === 'ACTIVE' && currentWave && (
              <motion.div
                key={currentWave.id}
                initial={{ y: -500, opacity: 0 }}
                animate={{ y: 600, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: Math.max(0.5, 2 - (level * 0.1)),
                  ease: "linear"
                }}
                onAnimationComplete={handleWaveEnd}
                className="absolute inset-x-0 h-full pointer-events-none"
              >
                {currentWave.obstacles.map(o => (
                  <div
                    key={o.id}
                    className="absolute h-12"
                    style={{
                      left: `${(o.lane * 33.33) + 16.66}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {o.type === 'wall' ? (
                      <div className="w-20 h-8 bg-neon-pink/40 border-2 border-neon-pink rounded-lg shadow-[0_0_20px_#ff00ff]" />
                    ) : (
                      <div className="w-12 h-12 bg-neon-purple/40 border-2 border-neon-purple rounded-full shadow-[0_0_20px_#bc13fe] flex items-center justify-center animate-spin-slow">
                        <Cpu className="w-5 h-5 text-neon-purple" />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlays */}
          <AnimatePresence>
            {status === 'IDLE' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <div className="text-center space-y-6">
                  <h1 className="text-6xl font-black italic tracking-tighter text-white neon-text mb-2">SYNTH-GRID</h1>
                  <p className="text-neon-blue/60 text-xs font-bold uppercase tracking-widest">NEURAL INTERFACE INITIALIZED</p>
                  <Button
                    onClick={startGame}
                    className="rounded-none border-2 border-neon-blue bg-transparent hover:bg-neon-blue hover:text-black transition-all px-12 py-8 text-xl font-black uppercase tracking-widest italic"
                  >
                    SYNC LINK
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'COLLISION' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-md"
              >
                <div className="text-center space-y-6 max-w-sm px-6">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
                  <h1 className="text-3xl font-black text-red-500 uppercase tracking-tighter">DATA CRASH</h1>
                  <p className="text-red-400/60 text-xs font-mono">{message}</p>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={startGame}
                      className="rounded-none border-2 border-red-500 bg-red-500 text-white hover:bg-white hover:text-red-500 transition-all py-6 font-black uppercase"
                    >
                      REBOOT SYSTEM
                    </Button>
                    <span className="text-[10px] text-red-500/40 font-bold uppercase">Final Score: {score}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Hint */}
        <div className="flex justify-between items-center opacity-40 group hover:opacity-100 transition-opacity">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 border border-white/20 rounded flex items-center justify-center bg-white/5">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-tighter">Move Left</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 border border-white/20 rounded flex items-center justify-center bg-white/5">
                <ChevronRight className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-tighter">Move Right</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <Terminal className="w-4 h-4 text-neon-blue" />
            <span className="text-[8px] font-bold uppercase text-zinc-500 tracking-tighter leading-none">
              Logic: Bun Serverless + React Framer<br />
              Host: Linode Cloud Node v4.2
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}
