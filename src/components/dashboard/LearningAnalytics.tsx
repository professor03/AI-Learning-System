import { useMemo } from 'react';
import { useMemoryStore } from '../../store/useMemoryStore';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

export default function LearningAnalytics() {
    const { atoms, quizHistory, learningSessions } = useMemoryStore();

    const stats = useMemo(() => {
        const totalTime = learningSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const totalXP = learningSessions.reduce((acc, s) => acc + s.xpGained, 0);
        const avgScore = quizHistory.length > 0
            ? Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length)
            : 0;

        return { totalTime, totalXP, avgScore };
    }, [learningSessions, quizHistory]);

    const retentionData = useMemo(() => {
        // Group atoms by mastery level
        const counts = [0, 0, 0, 0, 0, 0]; // Levels 0-5
        atoms.forEach(a => counts[Math.min(a.mastery, 5)]++);
        return counts;
    }, [atoms]);

    return (
        <div className="space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">總學習時間</div>
                    <div className="text-3xl font-black text-blue-900">
                        {Math.floor(stats.totalTime / 60)}<span className="text-lg font-medium text-blue-600">h</span> {stats.totalTime % 60}<span className="text-lg font-medium text-blue-600">m</span>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
                    <div className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">累積 XP</div>
                    <div className="text-3xl font-black text-purple-900">{stats.totalXP}</div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">平均測驗分數</div>
                    <div className="text-3xl font-black text-emerald-900">{stats.avgScore}%</div>
                </Card>
            </div>

            {/* Retention Distribution */}
            <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">記憶留存分佈 (Mastery Distribution)</h3>
                <div className="flex items-end justify-between h-40 gap-2">
                    {retentionData.map((count, level) => {
                        const max = Math.max(...retentionData, 1);
                        const height = (count / max) * 100;
                        return (
                            <div key={level} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full flex items-end justify-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        className={`w-full max-w-[40px] rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity
                                            ${level === 0 ? 'bg-gray-300' : ''}
                                            ${level === 1 ? 'bg-red-400' : ''}
                                            ${level === 2 ? 'bg-orange-400' : ''}
                                            ${level === 3 ? 'bg-yellow-400' : ''}
                                            ${level === 4 ? 'bg-green-400' : ''}
                                            ${level === 5 ? 'bg-emerald-500' : ''}
                                        `}
                                    />
                                    <div className="absolute -top-6 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {count}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs font-medium text-gray-500">Lv {level}</div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Recent Activity (Simplified Heatmap) */}
            <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">最近學習活動</h3>
                <div className="space-y-3">
                    {learningSessions.slice(0, 5).map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                    {session.type === 'review' ? '🧠' : session.type === 'quiz' ? '📝' : '📖'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 capitalize">{session.type} Session</div>
                                    <div className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary-600">+{session.xpGained} XP</div>
                                <div className="text-xs text-gray-500">{session.durationMinutes} min</div>
                            </div>
                        </div>
                    ))}
                    {learningSessions.length === 0 && (
                        <div className="text-center text-gray-400 py-4">尚無學習記錄</div>
                    )}
                </div>
            </Card>
        </div>
    );
}
