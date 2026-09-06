import { useTimerStore } from '../store/useTimerStore';
import type { PomodoroSessionType } from '../store/useTimerStore';

export interface PomodoroController {
  sessionType: PomodoroSessionType;
  secondsLeft: number;
  isRunning: boolean;
  completedToday: number;
  currentDate: string;
  history: Record<string, number>;
  start: () => void;
  pause: () => void;
  resetSession: () => void;
  skipBreak: () => void;
}

export const usePomodoro = (): PomodoroController => {
  const store = useTimerStore();

  return {
    sessionType: store.sessionType,
    secondsLeft: store.secondsLeft,
    isRunning: store.isRunning,
    completedToday: store.completedToday,
    currentDate: store.currentDate,
    history: store.history,
    start: store.start,
    pause: store.pause,
    resetSession: store.resetSession,
    skipBreak: store.skipBreak,
  };
};
