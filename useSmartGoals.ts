import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

const BASE_STUDY_GOAL = 60; // minutes

const MOOD_FACTORS: Record<string, number> = {
    '開心': 1.1,
    '平靜': 1.0,
    '疲憊': 0.8,
    '焦慮': 0.9,
    '崩潰': 0.6,
};

export const useSmartGoals = () => {
    const { mood, studyTime } = useAppStore();

    const smartGoal = useMemo(() => {
        const factor = MOOD_FACTORS[mood] || 1.0;
        let reason = '';

        // Mood Adjustment Logic
        if (mood === '開心') reason = '心情不錯，今天多挑戰一點吧！(目標 +10%)';
        else if (mood === '疲憊') reason = '適度休息是為了走更長遠的路。(目標 -20%)';
        else if (mood === '崩潰') reason = '別給自己太大壓力，完成最低限度就好。(目標 -40%)';
        else if (mood === '焦慮') reason = '專注當下，穩步前進。(目標 -10%)';
        else reason = '保持平常心，按部就班完成目標。';

        // Calculate Goal
        const goalMinutes = Math.round(BASE_STUDY_GOAL * factor);

        // Progress
        const currentMinutes = studyTime.today || 0;
        const progress = Math.min(100, Math.round((currentMinutes / goalMinutes) * 100));

        return {
            goalMinutes,
            currentMinutes,
            progress,
            reason,
            mood
        };
    }, [mood, studyTime.today]);

    return smartGoal;
};
