import { create } from 'zustand';
import type { Candidate } from '@/lib/db/types';
import * as db from '@/lib/db/idb';

interface CandidatesState {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
  loadCandidates: () => Promise<void>;
  addCandidate: (candidate: Candidate) => Promise<void>;
  updateCandidate: (candidate: Candidate) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  getCandidateById: (id: string) => Candidate | undefined;
}

export const useCandidatesStore = create<CandidatesState>((set, get) => ({
  candidates: [],
  isLoading: false,
  error: null,

  loadCandidates: async () => {
    set({ isLoading: true, error: null });
    try {
      const candidates = await db.getAllCandidates();
      set({ candidates, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load candidates', isLoading: false });
    }
  },

  addCandidate: async (candidate: Candidate) => {
    try {
      await db.addCandidate(candidate);
      set((state) => ({
        candidates: [...state.candidates, candidate],
      }));
    } catch (error) {
      set({ error: 'Failed to add candidate' });
    }
  },

  updateCandidate: async (candidate: Candidate) => {
    try {
      await db.updateCandidate(candidate);
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === candidate.id ? candidate : c
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to update candidate' });
    }
  },

  deleteCandidate: async (id: string) => {
    try {
      await db.deleteCandidate(id);
      set((state) => ({
        candidates: state.candidates.filter((c) => c.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete candidate' });
    }
  },

  getCandidateById: (id: string) => {
    return get().candidates.find((c) => c.id === id);
  },
}));
