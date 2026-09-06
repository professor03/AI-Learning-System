import { useMemo } from 'react';
import { useMemoryStore } from '../store/useMemoryStore';
import { useTimerStore } from '../store/useTimerStore';
import { useAppStore } from '../store/useAppStore';

export const useAnalytics = () => {
    const { atoms, quizHistory } = useMemoryStore();
    const { history: timerHistory } = useTimerStore();
    const { studyTime, petXP } = useAppStore();

    const analytics = useMemo(() => {
        // 1. Memory Health (記憶健康度)
        const totalQuestions = quizHistory.reduce((acc: number, curr: any) => acc + curr.totalQuestions, 0);
        const correctAnswers = quizHistory.reduce((acc: number, curr: any) => acc + curr.correctCount, 0);
        const retentionRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        // Calculate Mastery Distribution
        const masteryDistribution = {
            master: atoms.filter(a => a.mastery >= 4).length,
            familiar: atoms.filter(a => a.mastery === 3).length,
            learning: atoms.filter(a => a.mastery > 0 && a.mastery <= 2).length,
            forgotten: atoms.filter(a => a.mastery === 0).length,
        };

        // Calculate "Risk Items" and Urgent Cards
        const now = Date.now();
        const urgentAtoms = atoms.filter(a => a.nextReview && a.nextReview <= now);
        const riskItems = urgentAtoms.length;
        const topUrgentCards = urgentAtoms.sort((a, b) => a.mastery - b.mastery).slice(0, 3).map(a => a.term);

        // 2. Focus Efficiency (專注效率)
        // 2. Focus Efficiency (專注效率)
        // Get last 7 days, filling 0 for missing days
        const focusTrends: { date: string; minutes: number }[] = [];
        const focusCheckDate = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(focusCheckDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            focusTrends.push({ date: dateStr, minutes: timerHistory[dateStr] || 0 });
        }

        // 3. Knowledge Density (知識網絡)
        const totalNodes = atoms.length;
        // Mock connection rate: In a real graph, this would be edges / nodes.
        // For now, we simulate it based on tags or references.
        const connectionRate = Math.round(totalNodes * 1.2);

        // 4. Consistency (習慣一致性)
        // Calculate Streak
        // Calculate Streak

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Simple backward count
        let checkDate = new Date();
        // If today has data, start from today. If not, start from yesterday.
        // If neither, streak is 0.
        let hasToday = (studyTime.history?.[today] || 0) > 0;
        let hasYesterday = (studyTime.history?.[yesterday] || 0) > 0;

        if (hasToday) {
            currentStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1); // Check yesterday next
        } else if (hasYesterday) {
            currentStreak = 0; // Technically streak is active but today is 0? 
            // Let's say streak is number of consecutive days ending today or yesterday.
            // If today is 0, but yesterday was 1, streak is 1 (pending today).
            checkDate.setDate(checkDate.getDate() - 1); // Start checking from yesterday
        } else {
            currentStreak = 0;
        }

        if (currentStreak > 0 || hasYesterday) {
            while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if ((studyTime.history?.[dateStr] || 0) > 0) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Generate 30-day Heatmap Data
        const heatmapData: { date: string; count: number }[] = [];
        const heatmapCheckDate = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(heatmapCheckDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            heatmapData.push({ date: dateStr, count: studyTime.history?.[dateStr] || 0 });
        }

        // AI Insights Generation
        const insights: string[] = [];
        if (retentionRate < 60 && totalQuestions > 10) {
            insights.push("⚠️ 記憶留存率偏低，建議使用「間隔複習」功能加強記憶。");
        }
        if (riskItems > 5) {
            insights.push(`📉 發現 ${riskItems} 個知識點處於「遺忘危險區」，建議立即複習。`);
        }
        if (studyTime.today > 120) {
            insights.push("🔥 今天非常專注！記得適度休息，避免大腦疲勞。");
        } else if (studyTime.today === 0 && new Date().getHours() > 20) {
            insights.push("💡 今天還沒有學習紀錄，要不要來個 25 分鐘番茄鐘？");
        }

        return {
            memory: {
                retentionRate,
                riskItems,
                totalQuestions,
                masteryDistribution,
                topUrgentCards
            },
            focus: {
                todayMinutes: studyTime.today,
                trends: focusTrends
            },
            knowledge: {
                totalNodes,
                connectionRate
            },
            consistency: {
                streak: currentStreak,
                totalXP: petXP,
                heatmapData
            },
            insights
        };
    }, [atoms, quizHistory, timerHistory, studyTime, petXP]);

    return analytics;
};
