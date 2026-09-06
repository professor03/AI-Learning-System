import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { DailyMission } from '../../types/memory';

interface MissionCardProps {
    mission: DailyMission;
}

export default function MissionCard({ mission }: MissionCardProps) {
    const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
    const isCompleted = mission.completed;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className={clsx(
                "relative overflow-hidden rounded-3xl p-5 transition-all duration-300 border",
                isCompleted
                    ? "bg-gradient-to-br from-amber-100/80 to-orange-100/80 border-amber-200 shadow-lg shadow-amber-500/10"
                    : "bg-white/80 backdrop-blur-xl border-white/60 shadow-sm hover:shadow-md hover:border-indigo-200"
            )}
        >
            {/* Background Glow */}
            <div className={clsx(
                "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-40",
                isCompleted ? "bg-amber-400" : "bg-indigo-400"
            )} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner",
                        isCompleted ? "bg-white/60 text-amber-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                        {mission.icon}
                    </div>
                    {isCompleted && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm"
                        >
                            COMPLETED
                        </motion.div>
                    )}
                </div>

                <h3 className={clsx(
                    "font-bold text-lg mb-1",
                    isCompleted ? "text-amber-900" : "text-gray-800"
                )}>
                    {mission.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {mission.description}
                </p>

                <div className="mt-auto">
                    <div className="flex justify-between text-xs font-medium mb-2">
                        <span className={isCompleted ? "text-amber-700" : "text-indigo-600"}>
                            {mission.progress} / {mission.target}
                        </span>
                        <span className="text-gray-400">+{mission.rewardXP} XP</span>
                    </div>

                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={clsx(
                                "h-full rounded-full shadow-sm",
                                isCompleted
                                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                    : "bg-gradient-to-r from-indigo-400 to-purple-500"
                            )}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
