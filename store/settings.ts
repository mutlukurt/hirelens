import { create } from 'zustand';
import type { Settings } from '@/lib/db/types';
import * as db from '@/lib/db/idb';
import skillsDict from '@/lib/nlp/skills.json';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'system',
  reducedMotion: false,
  skillDictionary: skillsDict,
  updatedAt: Date.now(),
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      let settings = await db.getSettings();
      if (!settings) {
        settings = defaultSettings;
        await db.updateSettings(settings);
      }
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load settings', isLoading: false });
    }
  },

  updateSettings: async (partial: Partial<Settings>) => {
    try {
      const current = get().settings || defaultSettings;
      const updated: Settings = {
        ...current,
        ...partial,
        updatedAt: Date.now(),
      };
      await db.updateSettings(updated);
      set({ settings: updated });
    } catch (error) {
      set({ error: 'Failed to update settings' });
    }
  },

  resetSettings: async () => {
    try {
      await db.updateSettings(defaultSettings);
      set({ settings: defaultSettings });
    } catch (error) {
      set({ error: 'Failed to reset settings' });
    }
  },
}));
