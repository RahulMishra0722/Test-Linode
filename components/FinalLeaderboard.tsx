import { GAMES } from '@/lib/games';
import { motion } from 'framer-motion';

interface FinalLeaderboardProps {
  rankedGameIds: string[]; // Expected to be 5 IDs
}

export function FinalLeaderboard({ rankedGameIds }: FinalLeaderboardProps) {
  // Map IDs back to full Game objects
  const finalGames = rankedGameIds.map(id => GAMES.find(g => g.id === id)).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
      className="max-w-3xl mx-auto w-full glass-morphism rounded-3xl p-8 md:p-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <motion.h2
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
        >
          Your Top 5 Masterpieces
        </motion.h2>
        <p className="text-blue-400 mt-3 text-sm font-bold uppercase tracking-widest">HALL OF FAME</p>
      </div>

      <div className="space-y-4 relative z-10">
        {finalGames.map((game, idx) => {
          if (!game) return null;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`flex items-center gap-5 p-5 rounded-2xl relative transition-all hover:bg-slate-50 dark:hover:bg-white/[0.04] ${idx === 0
                ? 'bg-gradient-to-r from-blue-600/10 dark:from-blue-600/20 to-transparent border border-blue-500/30 py-8 shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50'
                : 'bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10'
                }`}
            >
              <div className={`font-black w-10 text-center flex-shrink-0 ${idx === 0 ? 'text-4xl text-blue-500 dark:text-blue-400 drop-shadow-md' : 'text-2xl text-slate-400 dark:text-white/40'
                }`}>
                #{idx + 1}
              </div>

              <div className={`rounded-xl bg-surface p-2 flex items-center justify-center flex-shrink-0 shadow-md ${idx === 0 ? 'w-16 h-16' : 'w-12 h-12'}`}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${game.domain}&sz=128`}
                  alt=""
                  className={`${idx === 0 ? 'w-12 h-12' : 'w-8 h-8'} object-contain`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-grow min-w-0 pr-4">
                <div className={`font-bold truncate text-foreground ${idx === 0 ? 'text-2xl' : 'text-lg'}`}>
                  {game.name}
                </div>
                <div className={`text-muted mt-1 font-medium ${idx === 0 ? 'text-sm' : 'text-xs'}`}>
                  RELEASED {game.releaseYear}
                </div>
              </div>

              {idx === 0 && (
                <div className="absolute top-0 right-0 p-3 text-4xl transform rotate-12 drop-shadow-lg">
                  👑
                </div>
              )}
            </motion.div>
          );
        })}

        {finalGames.length === 0 && (
          <div className="text-center text-muted py-12 text-sm">
            Something went wrong. No games selected.
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <button
          onClick={() => {
            const el = document.createElement('textarea');
            el.value = `My Top 5 Games of All Time:\n\n${finalGames.map((g, i) => `${i + 1}. ${g?.name}`).join('\n')}\n\nGenerated with GameRanker`;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert("Copied to clipboard!");
          }}
          className="px-6 py-3 rounded-xl bg-surface text-foreground font-medium hover:bg-surface-hover transition-colors border border-border-color text-sm"
        >
          Copy to Clipboard
        </button>
      </motion.div>
    </motion.div>
  );
}
