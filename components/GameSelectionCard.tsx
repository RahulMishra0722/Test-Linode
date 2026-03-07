import { Game } from '@/lib/games';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface GameSelectionCardProps {
  game: Game;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function GameSelectionCard({ game, isSelected, onToggle, disabled }: GameSelectionCardProps) {
  return (
    <motion.button
      layout
      onClick={() => {
        if (!disabled || isSelected) onToggle(game.id);
      }}
      className={`relative text-left w-full glass-morphism rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300 overflow-hidden group outline-none
        ${isSelected
          ? 'ring-2 ring-blue-500 bg-blue-500/10'
          : disabled
            ? 'opacity-40 cursor-not-allowed grayscale-[0.5]'
            : 'hover:bg-surface-hover hover:ring-1 hover:ring-border-color hover:-translate-y-1'
        }
      `}
    >
      <div className="flex items-center gap-4 w-full z-10">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface p-2 flex items-center justify-center border border-border-color shadow-lg flex-shrink-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${game.domain}&sz=128`}
            alt={`${game.name} icon`}
            className="w-10 h-10 object-contain drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDE1YTIgMiAwIDAgMS0yIDJIMTVsLTEgM2gtNGwtMS0zSDVhMiAyIDAgMCAxLTItMloiPjwvcGF0aD48cGF0aCBkPSJtMTAgOCAyIDIgMi0yIj48L3BhdGg+PC9zdmc+'; // gamepad fallback
            }}
          />
        </div>
        <div className="flex-grow min-w-0 pr-6">
          <h3 className="font-bold text-base text-foreground leading-tight truncate">
            {game.name}
          </h3>
          <span className="text-muted text-xs font-medium tracking-wide mt-1 block">
            {game.releaseYear}
          </span>
        </div>
      </div>

      {/* Checkbox Indicator */}
      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-colors
        ${isSelected
          ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
          : 'border-border-color text-transparent group-hover:border-muted bg-surface'
        }
      `}>
        <Check size={14} strokeWidth={3} className={isSelected ? 'opacity-100' : 'opacity-0'} />
      </div>
    </motion.button>
  );
}
