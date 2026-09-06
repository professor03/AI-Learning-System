import { motion } from 'framer-motion';
import { useSmartGoals } from '../../hooks/useSmartGoals';
import { useAppStore } from '../../store/useAppStore';
import { useMemoryStore } from '../../store/useMemoryStore';

const DailyProgress = () => {
    const { goalMinutes, currentMinutes, progress, reason, mood } = useSmartGoals();
    const { notes } = useAppStore();
    const { dailyMissions } = useMemoryStore();

    const completedMissions = dailyMissions.filter(m => m.completed).length;
    const totalMissions = dailyMissions.length;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
            {/* Background Shapes */}
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-pink-500/20 blur-2xl" />

            <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">今日進度</h2>
                        <p className="text-indigo-200 text-sm mt-1">AI 智能目標調整中...</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-md border border-white/10">
                        <span className="text-2xl">{mood === '開心' ? '🔥' : mood === '疲憊' ? '💤' : '✨'}</span>
                        <span className="font-medium text-sm">{mood}模式</span>
                    </div>
                </div>
            </div>

            {/* Main Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>學習時長 ({currentMinutes} / {goalMinutes} min)</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-black/20 overflow-hidden backdrop-blur-sm border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] ${progress >= 100
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-pink-400 to-rose-500'
                            }`}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-xs text-indigo-100 bg-white/10 p-2 rounded-lg inline-flex items-center gap-2 border border-white/5"
                >
                    <span>💡</span>
                    <span>AI Insight: {reason}</span>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm text-center border border-white/5 hover:bg-white/20 transition-colors">
                    <div className="text-2xl font-bold">{currentMinutes}</div>
                    <div className="text-xs text-indigo-200">專注分鐘</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm text-center border border-white/5 hover:bg-white/20 transition-colors">
                    <div className="text-2xl font-bold">{notes.length}</div>
                    <div className="text-xs text-indigo-200">知識筆記</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm text-center border border-white/5 hover:bg-white/20 transition-colors">
                    <div className="text-2xl font-bold">{completedMissions}/{totalMissions}</div>
                    <div className="text-xs text-indigo-200">每日任務</div>
                </div>
            </div>
        </div>
    );
};

export default DailyProgress;
