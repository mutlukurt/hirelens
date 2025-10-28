import { create } from 'zustand';
import type { Match } from '@/lib/db/types';
import * as db from '@/lib/db/idb';

interface MatchesState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  loadMatches: () => Promise<void>;
  addMatch: (match: Match) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  getMatchesByCandidate: (candidateId: string) => Match[];
  getMatchesByJob: (jobId: string) => Match[];
  getBestMatchForCandidate: (candidateId: string) => Match | undefined;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  loadMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const matches = await db.getAllMatches();
      set({ matches, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load matches', isLoading: false });
    }
  },

  addMatch: async (match: Match) => {
    try {
      console.log('Adding match to store:', match);
      await db.addMatch(match);
      set((state) => {
        const newMatches = [...state.matches, match];
        console.log('Store updated, total matches:', newMatches.length);
        return { matches: newMatches };
      });
    } catch (error) {
      console.error('Failed to add match:', error);
      set({ error: 'Failed to add match' });
    }
  },

  deleteMatch: async (id: string) => {
    try {
      await db.deleteMatch(id);
      set((state) => ({
        matches: state.matches.filter((m) => m.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete match' });
    }
  },

  getMatchesByCandidate: (candidateId: string) => {
    return get().matches.filter((m) => m.candidateId === candidateId);
  },

  getMatchesByJob: (jobId: string) => {
    return get().matches.filter((m) => m.jobId === jobId);
  },

  getBestMatchForCandidate: (candidateId: string) => {
    const candidateMatches = get().matches.filter(
      (m) => m.candidateId === candidateId
    );
    if (candidateMatches.length === 0) return undefined;
    return candidateMatches.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  },
}));
