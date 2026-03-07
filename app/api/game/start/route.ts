import { generatePrismLevel } from '@/lib/game-engine';
import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function GET() {
  const level = generatePrismLevel(1);
  const sessionId = Math.random().toString(36).substring(7);

  activeGames.set(sessionId, {
    level,
    expiry: Date.now() + 300000, // 5 mins
  });

  return NextResponse.json({
    sessionId,
    level,
  });
}
