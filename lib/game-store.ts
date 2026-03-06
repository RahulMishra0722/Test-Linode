export const activeGames = new Map<
  string,
  {
    solution: number[];
    secretRule: string;
    expiry: number;
  }
>();

// Cleanup expired games every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [id, game] of activeGames.entries()) {
      if (game.expiry < now) activeGames.delete(id);
    }
  }, 60000);
}
