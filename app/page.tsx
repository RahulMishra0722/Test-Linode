"use client";

import { FinalLeaderboard } from '@/components/FinalLeaderboard';
import { GameSelectionCard } from '@/components/GameSelectionCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getStoredTournament, setStoredTournament, TournamentState } from '@/lib/db';
import { GAMES } from '@/lib/games';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Stage Configurations
const STAGES = [
  { id: 1, name: "The Top 25", target: 25, title: "Select Your Top 25 Games", subtitle: "Choose 25 games from the entire list to advance to the next round." },
  { id: 2, name: "The Top 10", target: 10, title: "Narrow It Down to 10", subtitle: "From your 25 selected favorites, pick the best 10." },
  { id: 3, name: "The Final 5", target: 5, title: "Select Your Top 5 Masterpieces", subtitle: "These 5 will be locked in as your ultimate hall of fame." },
  { id: 4, name: "Hall of Fame", target: 0, title: "Your Hall of Fame", subtitle: "The greatest games of all time, ranked by you." }
];

export default function RankingApp() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function init() {
      const data = await getStoredTournament();
      setState(data);
      // Auto-resume logic
      if (data.finalRankings.length === 5) setCurrentStage(4);
      else if (data.stage3Selections.length === 5) setCurrentStage(4); // Or maybe stage 3.5 sorting if we want active sorting
      else if (data.stage2Selections.length === 10) setCurrentStage(3);
      else if (data.stage1Selections.length === 25) setCurrentStage(2);
      else setCurrentStage(1);
    }
    init();
  }, []);

  // Derive which list of games to show
  const availableGames = useMemo(() => {
    if (!state) return [];
    if (currentStage === 1) return GAMES;
    if (currentStage === 2) return GAMES.filter(g => state.stage1Selections.includes(g.id));
    if (currentStage === 3) return GAMES.filter(g => state.stage2Selections.includes(g.id));
    return []; // Stage 4 handles its own data
  }, [currentStage, state]);

  // Derive current selections
  const currentSelections = useMemo(() => {
    if (!state) return [];
    return currentStage === 1 ? state.stage1Selections :
      currentStage === 2 ? state.stage2Selections :
        state.stage3Selections;
  }, [currentStage, state]);

  const filteredGames = useMemo(() => {
    if (!searchQuery) return availableGames;
    const lower = searchQuery.toLowerCase();
    return availableGames.filter(g => g.name.toLowerCase().includes(lower));
  }, [availableGames, searchQuery]);

  if (!state) return <div className="min-h-screen flex items-center justify-center text-white/50 animate-pulse tracking-wide">Loading...</div>;

  const stageConfig = STAGES[currentStage - 1];

  // Handlers
  const handleToggle = async (gameId: string) => {
    let newSelections = [...currentSelections];
    if (newSelections.includes(gameId)) {
      newSelections = newSelections.filter(id => id !== gameId);
    } else {
      if (newSelections.length >= stageConfig.target) return; // Prevent over-selecting
      newSelections.push(gameId);
    }

    const field = `stage${currentStage}Selections` as keyof TournamentState;
    const newState = { ...state, [field]: newSelections };

    // Auto-finalize top 5 since we removed the manual DND sorting step to keep it simple and beautiful
    if (currentStage === 3 && newSelections.length === 5) {
      newState.finalRankings = newSelections;
    }

    setState(newState);
    await setStoredTournament(newState);
  };

  const advanceStage = async () => {
    if (currentStage === 3) {
      triggerConfetti();
    }
    setCurrentStage(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery("");
  };

  const resetAll = async () => {
    if (!confirm("Are you sure you want to reset your entire tier list?")) return;
    const blank = { stage1Selections: [], stage2Selections: [], stage3Selections: [], finalRankings: [] };
    await setStoredTournament(blank);
    setState(blank);
    setCurrentStage(1);
  };

  const triggerConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#ffffff']
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ffffff']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const selectedCount = currentSelections.length;
  const isTargetMet = selectedCount === stageConfig.target;
  const progressPercent = (selectedCount / stageConfig.target) * 100;

  return (
    <main className="min-h-screen py-8 px-4 md:px-8 max-w-7xl mx-auto relative z-10 pointer-events-auto selection:bg-blue-500/30">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 font-['Press_Start_2P',_monospace]">
            <span className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] tracking-wide px-3 py-1.5 rounded border border-blue-500/20 dark:border-blue-500/30 uppercase">
              Phase {currentStage} / 4
            </span>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-foreground tracking-tight font-['Press_Start_2P',_monospace] mt-4 mb-2 leading-relaxed drop-shadow-sm">
            {stageConfig.title}
          </h1>
          <p className="text-muted text-sm mt-1 max-w-md">{stageConfig.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[320px]">
          {currentStage < 4 && (
            <>
              <div className="flex justify-between items-center text-[10px] uppercase font-['Press_Start_2P',_monospace] text-muted mb-2 tracking-wide">
                <span>{selectedCount} Selected</span>
                <span>{stageConfig.target - selectedCount} Left</span>
              </div>
              <div className="h-3 w-full bg-surface border border-border-color p-0.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${isTargetMet ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </>
          )}

          <div className="mt-4 flex gap-3 justify-end w-full font-['Press_Start_2P',_monospace] uppercase text-[10px] tracking-wide">
            {currentStage > 1 && (
              <button
                onClick={currentStage === 4 ? resetAll : () => setCurrentStage(prev => prev - 1)}
                className="px-4 py-3 border border-border-color text-foreground hover:bg-surface transition-colors"
              >
                {currentStage === 4 ? 'START OVER' : '← BACK'}
              </button>
            )}
            {currentStage < 4 && (
              <button
                onClick={advanceStage}
                disabled={!isTargetMet}
                className="flex-grow md:flex-grow-0 px-5 py-3 bg-blue-600 dark:bg-white text-white dark:text-black hover:bg-blue-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_rgba(37,99,235,0.39)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.3)] disabled:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]"
              >
                {currentStage === 3 ? 'FINISH' : `NEXT ROUND`}
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentStage < 4 ? (
          <motion.div
            key={`stage-${currentStage}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search Bar */}
            <div className="mb-6 relative max-w-md z-20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-color rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all pointer-events-auto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGames.map((game) => (
                <GameSelectionCard
                  key={game.id}
                  game={game}
                  isSelected={currentSelections.includes(game.id)}
                  onToggle={handleToggle}
                  disabled={!currentSelections.includes(game.id) && isTargetMet}
                />
              ))}
              {filteredGames.length === 0 && (
                <div className="col-span-full py-12 text-center text-white/40">
                  No games found matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-8"
          >
            <FinalLeaderboard rankedGameIds={state.finalRankings} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
