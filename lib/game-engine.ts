export type GridObstacle = {
  lane: number;
  type: 'wall' | 'core';
  id: string;
};

export type GridWave = {
  id: string;
  obstacles: GridObstacle[];
  speed: number;
};

export function generateWave(level: number): GridWave {
  const numObstacles = Math.min(Math.floor(level / 2) + 1, 3);
  const obstacles: GridObstacle[] = [];
  const usedLanes = new Set<number>();

  // Add obstacles (walls)
  for (let i = 0; i < numObstacles; i++) {
    let lane;
    do {
      lane = Math.floor(Math.random() * 3); // 0, 1, 2
    } while (usedLanes.has(lane));

    usedLanes.add(lane);
    obstacles.push({
      lane,
      type: 'wall',
      id: Math.random().toString(36).substring(7),
    });
  }

  // Add an energy core in an empty lane if possible
  if (usedLanes.size < 3) {
    let lane;
    do {
      lane = Math.floor(Math.random() * 3);
    } while (usedLanes.has(lane));

    obstacles.push({
      lane,
      type: 'core',
      id: 'core-' + Math.random().toString(36).substring(7),
    });
  }

  return {
    id: 'wave-' + Math.random().toString(36).substring(7),
    obstacles,
    speed: 1 + level * 0.1,
  };
}
