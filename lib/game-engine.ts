export type Point = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Mirror = {
  id: string;
  position: Point;
  rotation: number; // 0, 45, 90, 135 (degrees)
};

export type Level = {
  id: string;
  source: { position: Point; direction: Direction };
  target: { position: Point };
  gridSize: number;
  mirrors: Mirror[];
};

export function generatePrismLevel(difficulty: number): Level {
  const gridSize = 5;
  const source = { position: { x: 0, y: 2 }, direction: 'RIGHT' as Direction };
  const target = { position: { x: 4, y: 2 } };

  // Generate some random initial mirrors
  const mirrors: Mirror[] = [];
  const numMirrors = 3;
  for (let i = 0; i < numMirrors; i++) {
    mirrors.push({
      id: `mirror-${i}`,
      position: {
        x: Math.floor(Math.random() * 3) + 1,
        y: Math.floor(Math.random() * 5),
      },
      rotation: Math.floor(Math.random() * 4) * 45,
    });
  }

  return {
    id: Math.random().toString(36).substring(7),
    source,
    target,
    gridSize,
    mirrors,
  };
}

export function calculateLaserPath(
  level: Level,
  userMirrors: Mirror[],
): Point[] {
  const path: Point[] = [level.source.position];
  let currentPos = { ...level.source.position };
  let currentDir = level.source.direction;
  const visited = new Set<string>();

  const maxSteps = 50;
  for (let i = 0; i < maxSteps; i++) {
    const nextPos = getNextPos(currentPos, currentDir);

    if (
      nextPos.x < 0 ||
      nextPos.x >= level.gridSize ||
      nextPos.y < 0 ||
      nextPos.y >= level.gridSize
    ) {
      path.push(nextPos);
      break;
    }

    path.push(nextPos);
    currentPos = nextPos;

    const mirror = userMirrors.find(
      (m) => m.position.x === currentPos.x && m.position.y === currentPos.y,
    );
    if (mirror) {
      const state = `${currentPos.x},${currentPos.y},${currentDir}`;
      if (visited.has(state)) break;
      visited.add(state);

      const nextDir = reflect(currentDir, mirror.rotation);
      if (!nextDir) break; // Absorbed or blocked
      currentDir = nextDir;
    }

    if (
      currentPos.x === level.target.position.x &&
      currentPos.y === level.target.position.y
    ) {
      break;
    }
  }

  return path;
}

function getNextPos(pos: Point, dir: Direction): Point {
  switch (dir) {
    case 'UP':
      return { x: pos.x, y: pos.y - 1 };
    case 'DOWN':
      return { x: pos.x, y: pos.y + 1 };
    case 'LEFT':
      return { x: pos.x - 1, y: pos.y };
    case 'RIGHT':
      return { x: pos.x + 1, y: pos.y };
  }
}

function reflect(dir: Direction, rotation: number): Direction | null {
  // Simple mirror reflection logic
  // Assume mirror is a line. Rotation 45 deg means / , 135 deg means \
  if (rotation === 45) {
    if (dir === 'RIGHT') return 'UP';
    if (dir === 'UP') return 'RIGHT';
    if (dir === 'LEFT') return 'DOWN';
    if (dir === 'DOWN') return 'LEFT';
  } else if (rotation === 135) {
    if (dir === 'RIGHT') return 'DOWN';
    if (dir === 'DOWN') return 'RIGHT';
    if (dir === 'LEFT') return 'UP';
    if (dir === 'UP') return 'LEFT';
  }
  return null; // For now, only 45 and 135 reflect. 0 and 90 might be flat mirrors?
}
