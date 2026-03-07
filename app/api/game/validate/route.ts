import { calculateLaserPath } from '@/lib/game-engine';
import { activeGames } from '@/lib/game-store';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId, mirrors } = await req.json();
    const game = activeGames.get(sessionId);

    if (!game) {
      return NextResponse.json({ error: 'Session expired' }, { status: 400 });
    }

    const path = calculateLaserPath(game.level, mirrors);
    const lastPoint = path[path.length - 1];

    const isSuccess =
      lastPoint.x === game.level.target.position.x &&
      lastPoint.y === game.level.target.position.y;

    if (isSuccess) {
      activeGames.delete(sessionId);
      return NextResponse.json({
        success: true,
        message: 'PRISM ALIGNED',
        path,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'PATH INCOMPLETE',
      path,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
