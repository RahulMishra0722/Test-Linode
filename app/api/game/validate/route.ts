import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId, lane } = await req.json();
    const game = activeGames.get(sessionId);

    if (!game) {
      return NextResponse.json({ error: 'Session expired' }, { status: 400 });
    }

    // Checking if the player reached the core lane
    const isCorrect = game.solution.includes(lane);

    if (isCorrect) {
      activeGames.delete(sessionId);
      return NextResponse.json({
        success: true,
        message: 'CORE SYNCED',
        bonus: 100,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'SYSTEM COLLISION',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
