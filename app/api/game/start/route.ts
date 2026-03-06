import { generateWave } from '@/lib/game-engine';
import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const level = parseInt(searchParams.get('level') || '1');
  const sessionId =
    searchParams.get('sessionId') || Math.random().toString(36).substring(7);

  const wave = generateWave(level);

  activeGames.set(sessionId, {
    solution: wave.obstacles
      .filter((o) => o.type === 'core')
      .map((o) => o.lane),
    secretRule: `Level ${level} Wave`,
    expiry: Date.now() + 60000, // 1 min per wave
  });

  return NextResponse.json({
    sessionId,
    wave,
    level,
  });
}
