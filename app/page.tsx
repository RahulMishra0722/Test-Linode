"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  ChevronRight,
  Lock,
  RefreshCw,
  Trophy,
  Zap
} from "lucide-react";
import { useCallback, useState } from "react";

export default function NeuralSequenceGame() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost' | 'checking'>('idle');
  const [data, setData] = useState<{ sessionId: string, sequence: number[], patternName: string } | null>(null);
  const [guesses, setGuesses] = useState<string[]>(["", ""]);
  const [message, setMessage] = useState<string>("");
  const [secretRule, setSecretRule] = useState<string>("");
  const [score, setScore] = useState(0);

  const startNewGame = useCallback(async () => {
    setGameState('checking');
    try {
      const res = await fetch("/api/game/start");
      if (!res.ok) throw new Error("Failed to start");
      const json = await res.json();
      setData(json);
      setGuesses(["", ""]);
      setMessage("");
      setSecretRule("");
      setGameState('playing');
    } catch (err) {
      setMessage("Failed to establish neural link.");
      setGameState('idle');
    }
  }, []);

  const checkSolution = async () => {
    if (!data) return;
    setGameState('checking');

    try {
      const res = await fetch("/api/game/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: data.sessionId,
          guesses: guesses.map(g => parseInt(g))
        })
      });
      const json = await res.json();

      if (json.success) {
        setGameState('won');
        setSecretRule(json.secretRule);
        setScore(s => s + 100);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#ffffff']
        });
      } else {
        setGameState('lost');
        setMessage(json.message || "Sequence Mismatch.");
      }
    } catch (err) {
      setMessage("Transmission error.");
      setGameState('playing');
    }
  };

  return (
    <main className="min-h-screen bg-[#030303] text-zinc-100 flex items-center justify-center p-6 selection:bg-purple-500/30 font-sans">
      {/* Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* HUD */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500 font-mono">Neural Explorer v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold font-mono">{score}</span>
              </div>
            </div>
          </div>

          <Card className="glass border-white/10 bg-transparent rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                {gameState === 'idle' ? 'Ready to Sync?' : data?.patternName}
              </CardTitle>
              <CardDescription className="text-zinc-500 italic">
                {gameState === 'idle' ? 'Decipher the sequence hidden in the server logs.' : 'Complete the pattern accurately to bypass the firewall.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-12 py-8">
              <AnimatePresence mode="wait">
                {gameState === 'idle' ? (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-center"
                  >
                    <Button
                      size="lg"
                      onClick={startNewGame}
                      className="rounded-full px-8 py-6 bg-white text-black hover:bg-zinc-200 transition-all text-base font-bold group"
                    >
                      Initialize Link
                      <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    {/* Sequence Display */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {data?.sequence.map((num, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors shadow-inner"
                        >
                          {num}
                        </motion.div>
                      ))}

                      {/* Interaction Area */}
                      <div className="flex items-center gap-4">
                        {guesses.map((g, i) => (
                          <motion.div
                            key={`guess-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                          >
                            <Input
                              type="number"
                              disabled={gameState !== 'playing'}
                              value={g}
                              onChange={(e) => {
                                const newGuesses = [...guesses];
                                newGuesses[i] = e.target.value;
                                setGuesses(newGuesses);
                              }}
                              placeholder="?"
                              className={cn(
                                "w-16 h-16 md:w-20 md:h-20 text-center text-2xl md:text-3xl font-bold rounded-2xl bg-purple-500/10 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20 transition-all placeholder:text-purple-500/30",
                                gameState === 'won' && "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
                                gameState === 'lost' && "bg-red-500/20 border-red-500/50 text-red-400"
                              )}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Meta UI / Results */}
                    <div className="min-h-[60px] flex flex-col items-center justify-center gap-4">
                      {gameState === 'playing' && (
                        <Button
                          onClick={checkSolution}
                          disabled={guesses.some(g => !g)}
                          className="rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-8"
                        >
                          Verify Logic
                        </Button>
                      )}

                      {gameState === 'checking' && (
                        <div className="flex items-center gap-3 text-zinc-500 font-mono text-xs uppercase tracking-tighter">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Consulting Server...
                        </div>
                      )}

                      {gameState === 'won' && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center space-y-3"
                        >
                          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 py-1.5 px-4 rounded-full font-bold">
                            SUCCESS
                          </Badge>
                          <p className="text-zinc-500 text-sm font-mono tracking-tight">
                            Pattern Decoded: <span className="text-zinc-300 font-bold">{secretRule}</span>
                          </p>
                          <Button variant="ghost" size="sm" onClick={startNewGame} className="text-xs text-zinc-600 hover:text-white uppercase tracking-widest gap-2">
                            Next Wave <ChevronRight className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      )}

                      {gameState === 'lost' && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center space-y-4"
                        >
                          <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {message}
                          </div>
                          <Button variant="outline" size="sm" onClick={startNewGame} className="rounded-full border-white/10 hover:bg-white/5 text-xs font-bold px-6">
                            Retry Sequence
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="grid grid-cols-2 gap-4">
            <InfoBox
              icon={<Lock className="w-3 h-3" />}
              label="Serverless Logic"
              content="Rules are generated on-the-fly and hidden from client inspection."
            />
            <InfoBox
              icon={<Zap className="w-3 h-3" />}
              label="Instant Validation"
              content="Sessions are verified server-side with zero trust persistence."
            />
          </div>
        </motion.div>

        {/* Trace Info */}
        <div className="mt-12 text-center">
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-white/[0.02] px-3 py-1 rounded-full border border-white/[0.05]">
            Session ID: {data?.sessionId || "DORMANT"} // Logic: Next.js + Bun
          </span>
        </div>
      </div>
    </main>
  );
}

function InfoBox({ icon, label, content }: { icon: React.ReactNode, label: string, content: string }) {
  return (
    <div className="glass p-4 rounded-2xl space-y-1">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className="text-[10px] leading-relaxed text-zinc-400 font-medium">{content}</p>
    </div>
  );
}
