import { useEffect, useRef } from 'react';
import { useTimerStore } from '../store/useTimerStore';

export const useGlobalTimer = () => {
    const { isRunning, tick, checkDailyReset } = useTimerStore();
    const intervalRef = useRef<number | null>(null);

    // Daily Reset Check
    useEffect(() => {
        checkDailyReset();
        const dailyChecker = setInterval(checkDailyReset, 60 * 1000); // Check every minute
        return () => clearInterval(dailyChecker);
    }, [checkDailyReset]);

    // Timer Tick
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                tick();
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, tick]);
};
