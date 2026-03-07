import { Game } from '@/lib/games';
import { motion } from 'framer-motion';

export interface GameCardProps {
  game: Game;
  rating: number;
  onRatingChange: (id: string, rating: number) => void;
}

export function GameCard({ game, rating, onRatingChange }: GameCardProps) {
  const isRated = rating !== undefined && rating > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
      className={`glass-morphism rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 relative overflow-hidden group ${isRated
          ? 'ring-1 ring-blue-500/30 bg-blue-500/5'
          : 'neon-border hover:bg-white/[0.02]'
        }`}
    >
      <div className="flex items-start justify-between w-full z-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 p-2 flex items-center justify-center border border-white/5 shadow-lg flex-shrink-0">
            <img
              src={`https://www.google.com/s2/favicons?domain=${game.domain}&sz=128`}
              alt={`${game.name} icon`}
              className="w-10 h-10 object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDE1YTIgMiAwIDAgMS0yIDJIMTVsLTEgM2gtNGwtMS0zSDVhMiAyIDAgMCAxLTItMloiPjwvcGF0aD48cGF0aCBkPSJtMTAgOCAyIDIgMi0yIj48L3BhdGg+PC9zdmc+';
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white/90 leading-tight">
              {game.name}
            </h3>
            <span className="text-white/40 text-xs font-medium tracking-wide mt-1 block">RELEASED {game.releaseYear}</span>
          </div>
        </div>

        {isRated && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg flex-shrink-0 border border-blue-500/30"
          >
            {rating}
          </motion.div>
        )}
      </div>

      <div className="w-full mt-auto z-10 relative pt-2">
        <div className="flex justify-between w-full gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
            const isActive = score === rating;
            return (
              <button
                key={score}
                onClick={() => onRatingChange(game.id, score)}
                className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.5)] z-10'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
