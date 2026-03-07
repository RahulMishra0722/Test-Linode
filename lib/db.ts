import { get, set } from 'idb-keyval';

const STORE_KEY = 'game-tournament-v1';

export interface TournamentState {
  stage1Selections: string[]; // IDs of the 25 games selected from ALL
  stage2Selections: string[]; // IDs of the 10 games selected from 25
  stage3Selections: string[]; // IDs of the 5 games selected from 10
  finalRankings: string[]; // Ordered IDs, 1st to 5th place
}

const DEFAULT_STATE: TournamentState = {
  stage1Selections: [],
  stage2Selections: [],
  stage3Selections: [],
  finalRankings: [],
};

export async function getStoredTournament(): Promise<TournamentState> {
  try {
    const val = await get<TournamentState>(STORE_KEY);
    return val || DEFAULT_STATE;
  } catch (err) {
    console.error('Failed to get from IndexedDB:', err);
    return DEFAULT_STATE;
  }
}

export async function setStoredTournament(
  state: TournamentState,
): Promise<void> {
  try {
    await set(STORE_KEY, state);
  } catch (err) {
    console.error('Failed to save to IndexedDB:', err);
  }
}
