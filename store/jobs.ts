import { create } from 'zustand';
import type { Job } from '@/lib/db/types';
import * as db from '@/lib/db/idb';

interface JobsState {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  loadJobs: () => Promise<void>;
  addJob: (job: Job) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,

  loadJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await db.getAllJobs();
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load jobs', isLoading: false });
    }
  },

  addJob: async (job: Job) => {
    try {
      await db.addJob(job);
      set((state) => ({
        jobs: [...state.jobs, job],
      }));
    } catch (error) {
      set({ error: 'Failed to add job' });
    }
  },

  updateJob: async (job: Job) => {
    try {
      await db.updateJob(job);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
      }));
    } catch (error) {
      set({ error: 'Failed to update job' });
    }
  },

  deleteJob: async (id: string) => {
    try {
      await db.deleteJob(id);
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete job' });
    }
  },

  getJobById: (id: string) => {
    return get().jobs.find((j) => j.id === id);
  },
}));
