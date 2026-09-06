import { useAnalytics } from '../../hooks/useAnalytics';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useMemo } from 'react';
import Card from '../ui/Card';
import AIInsightPanel from '../analytics/AIInsightPanel';
import MemoryHealthChart from '../analytics/MemoryHealthChart';
import FocusEfficiencyChart from '../analytics/FocusEfficiencyChart';
import KnowledgeGalaxyChart from '../analytics/KnowledgeGalaxyChart';
import ConsistencyChart from '../analytics/ConsistencyChart';
import { motion } from 'framer-motion';

export default function AnalyticsView() {
    const analytics = useAnalytics();
    const { quizHistory, learningSessions } = useMemoryStore();

    const stats = useMemo(() => {
        const totalTime = learningSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const totalXP = learningSessions.reduce((acc, s) => acc + s.xpGained, 0);
        const avgScore = quizHistory.length > 0
            ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length)
            : 0;

        return { totalTime, totalXP, avgScore };
    }, [learningSessions, quizHistory]);


    return (
        <div className="space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 p-5">
                    <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">總學習時間</div>
                    <div className="text-3xl font-black text-blue-900">
                        {Math.floor(stats.totalTime / 60)}<span className="text-lg font-medium text-blue-600">h</span> {stats.totalTime % 60}<span className="text-lg font-medium text-blue-600">m</span>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 p-5">
                    <div className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">累積 XP</div>
                    <div className="text-3xl font-black text-purple-900">{stats.totalXP}</div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 p-5">
                    <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">平均測驗分數</div>
                    <div className="text-3xl font-black text-emerald-900">{stats.avgScore}%</div>
                </Card>
            </div>

            {/* AI Insights */}
            <AIInsightPanel insights={analytics.insights} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Row 1: Memory & Focus (Larger) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1"
                >
                    <MemoryHealthChart
                        retentionRate={analytics.memory.retentionRate}
                        riskItems={analytics.memory.riskItems}
                        totalQuestions={analytics.memory.totalQuestions}
                        masteryDistribution={analytics.memory.masteryDistribution}
                        topUrgentCards={analytics.memory.topUrgentCards}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <FocusEfficiencyChart data={analytics.focus.trends} />
                </motion.div>

                {/* Row 2: Knowledge & Consistency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <KnowledgeGalaxyChart
                        totalNodes={analytics.knowledge.totalNodes}
                        connectionRate={analytics.knowledge.connectionRate}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <ConsistencyChart
                        streak={analytics.consistency.streak}
                        totalXP={analytics.consistency.totalXP}
                        heatmapData={analytics.consistency.heatmapData}
                    />
                </motion.div>
            </div>
        </div>
    );
}
