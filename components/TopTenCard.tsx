import { Game } from '@/lib/games';
import { motion } from 'framer-motion';

interface TopTenProps {
  rankedGames: { game: Game; rating: number }[];
}

export function TopTenCard({ rankedGames }: TopTenProps) {
  const top10 = rankedGames
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
      className="max-w-3xl mx-auto w-full glass-morphism rounded-3xl p-8 md:p-12 relative overflow-hidden"
    >
      <div className="text-center mb-12 relative z-10">
        <motion.h2
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
        >
          Your Top 10
        </motion.h2>
        <p className="text-white/50 mt-3 text-sm font-medium">RANKINGS LOCKED IN</p>
      </div>

      <div className="space-y-3 relative z-10">
        {top10.map((entry, idx) => (
          <motion.div
            key={entry.game.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-xl relative transition-all hover:bg-white/[0.03] ${idx === 0
                ? 'bg-blue-500/10 border border-blue-500/20 py-6'
                : 'bg-white/[0.01] border border-white/5'
              }`}
          >
            <div className={`font-black w-8 text-center flex-shrink-0 ${idx === 0 ? 'text-3xl text-blue-400' : 'text-xl text-white/30'
              }`}>
              {idx + 1}
            </div>

            <div className="w-12 h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
              <img
                src={`https://www.google.com/s2/favicons?domain=${entry.game.domain}&sz=64`}
                alt=""
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex-grow min-w-0 pr-4">
              <div className="font-semibold text-base md:text-lg truncate text-white/90">
                {entry.game.name}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{entry.game.releaseYear}</div>
            </div>

            <div className="font-bold text-xl text-white flex-shrink-0 bg-white/10 px-3 py-1 rounded-lg">
              {entry.rating.toFixed(1)}
            </div>
          </motion.div>
        ))}

        {top10.length === 0 && (
          <div className="text-center text-white/40 py-12 text-sm">
            You haven't rated any games yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
