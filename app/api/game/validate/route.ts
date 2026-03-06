import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId, guesses } = await req.json();

    const game = activeGames.get(sessionId);

    if (!game) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 400 },
      );
    }

    const isCorrect =
      guesses.length === game.solution.length &&
      guesses.every(
        (val: any, idx: number) => Number(val) === game.solution[idx],
      );

    if (isCorrect) {
      activeGames.delete(sessionId);
      return NextResponse.json({
        success: true,
        message: 'Neural Pattern Matched!',
        secretRule: game.secretRule,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Sequence Mismatch Detected.',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
