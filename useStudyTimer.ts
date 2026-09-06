import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const STUDY_PATHS = ['/notes', '/quiz', '/review', '/memory', '/research', '/vault', '/presentation'];
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const useStudyTimer = () => {
    const location = useLocation();
    const { updateStudyTime } = useAppStore();
    const lastActivityRef = useRef(Date.now());
    const intervalRef = useRef<number | null>(null);

    // Activity tracker
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
        };

        // Throttled event listeners could be better, but for simple timestamp update it's fine
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, []);

    // Timer logic
    useEffect(() => {
        // Check if current path is a study path
        const isStudyPage = STUDY_PATHS.some(path => location.pathname.startsWith(path));

        if (!isStudyPage) {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Start timer
        intervalRef.current = window.setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;

            // Only count if user is active (not idle)
            if (timeSinceLastActivity < IDLE_TIMEOUT) {
                updateStudyTime(1); // Add 1 minute
            }
        }, 60 * 1000); // Run every minute

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [location.pathname, updateStudyTime]);
};
