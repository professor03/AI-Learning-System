import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SlideTheme } from '../lib/presentation-schema';

interface PresentationPreferences {
    defaultTheme: SlideTheme;
    defaultDuration: number; // in minutes
    showSpeakerNotes: boolean;
    autoGenerateCharts: boolean;
    enableMagicMotion: boolean;
}

interface PresentationState {
    preferences: PresentationPreferences;
    setPreference: <K extends keyof PresentationPreferences>(
        key: K,
        value: PresentationPreferences[K]
    ) => void;
    resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: PresentationPreferences = {
    defaultTheme: 'modern',
    defaultDuration: 5,
    showSpeakerNotes: true,
    autoGenerateCharts: true,
    enableMagicMotion: true,
};

export const usePresentationStore = create<PresentationState>()(
    persist(
        (set) => ({
            preferences: DEFAULT_PREFERENCES,
            setPreference: (key, value) =>
                set((state) => ({
                    preferences: { ...state.preferences, [key]: value },
                })),
            resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
        }),
        {
            name: 'presentation-preferences', // unique name for localStorage key
        }
    )
);
