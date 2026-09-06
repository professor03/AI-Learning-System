import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toISODate } from '../lib/format';
import { useAppStore } from './useAppStore';

export type PomodoroSessionType = 'focus' | 'short-break' | 'long-break';

export const SESSION_DURATIONS: Record<PomodoroSessionType, number> = {
    focus: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
};

interface TimerState {
    sessionType: PomodoroSessionType;
    secondsLeft: number;
    isRunning: boolean;
    completedToday: number;
    currentDate: string;
    history: Record<string, number>;

    // Actions
    start: () => void;
    pause: () => void;
    resetSession: () => void;
    skipBreak: () => void;
    tick: () => void;
    setSessionType: (type: PomodoroSessionType) => void;
    checkDailyReset: () => void;
    resetGlobalTimer: () => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            sessionType: 'focus',
            secondsLeft: SESSION_DURATIONS.focus,
            isRunning: false,
            completedToday: 0,
            currentDate: toISODate(new Date()),
            history: {},

            start: () => set({ isRunning: true }),
            pause: () => set({ isRunning: false }),

            resetSession: () => {
                const { sessionType } = get();
                set({
                    isRunning: false,
                    secondsLeft: SESSION_DURATIONS[sessionType]
                });
            },

            skipBreak: () => {
                const { sessionType } = get();
                if (sessionType !== 'focus') {
                    set({
                        sessionType: 'focus',
                        secondsLeft: SESSION_DURATIONS.focus,
                        isRunning: false
                    });
                }
            },

            setSessionType: (type) => set({
                sessionType: type,
                secondsLeft: SESSION_DURATIONS[type],
                isRunning: false
            }),

            tick: () => {
                const { secondsLeft, sessionType, completedToday } = get();

                // 1. Check for completion
                if (secondsLeft <= 1) {
                    const isFocus = sessionType === 'focus';
                    const nextCompleted = isFocus ? completedToday + 1 : completedToday;

                    // Determine next session
                    let nextType: PomodoroSessionType = 'focus';
                    if (isFocus) {
                        const needsLongBreak = nextCompleted % 4 === 0;
                        nextType = needsLongBreak ? 'long-break' : 'short-break';

                        // Trigger Pet Reward
                        useAppStore.getState().triggerPet();
                    }

                    set({
                        secondsLeft: SESSION_DURATIONS[nextType],
                        sessionType: nextType,
                        completedToday: nextCompleted,
                        isRunning: true // Auto-start next session
                    });

                } else {
                    // 2. Tick down
                    set({ secondsLeft: secondsLeft - 1 });

                    // 3. Track Study Time (Every minute)
                    if (sessionType === 'focus' && (secondsLeft - 1) % 60 === 0) {
                        useAppStore.getState().updateStudyTime(1);
                    }
                }
            },

            checkDailyReset: () => {
                const today = toISODate(new Date());
                const { currentDate, completedToday, history } = get();

                if (currentDate !== today) {
                    const newHistory = { ...history };
                    if (completedToday > 0) {
                        // Convert completed pomodoros to minutes (25 min each)
                        const minutesCompleted = completedToday * 25;
                        newHistory[currentDate] = (newHistory[currentDate] || 0) + minutesCompleted;
                    }
                    set({
                        currentDate: today,
                        completedToday: 0,
                        history: newHistory
                    });
                }
            },

            resetGlobalTimer: () => {
                set({
                    sessionType: 'focus',
                    secondsLeft: SESSION_DURATIONS.focus,
                    isRunning: false,
                    completedToday: 0,
                    currentDate: toISODate(new Date()),
                    history: {}
                });
            }
        }),
        {
            name: 'ai-learning-pomodoro-global',
        }
    )
);
