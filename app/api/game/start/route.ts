import { generateGame } from '@/lib/game-engine';
import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function GET() {
  const game = generateGame();
  const sessionId = Math.random().toString(36).substring(7);

  activeGames.set(sessionId, {
    solution: game.solution,
    secretRule: game.secretRule,
    expiry: Date.now() + 300000,
  });

  return NextResponse.json({
    sessionId,
    sequence: game.sequence,
    patternName: game.name,
  });
}
