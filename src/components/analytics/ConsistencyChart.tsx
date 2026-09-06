import Card from '../ui/Card';

interface ConsistencyChartProps {
    streak: number;
    totalXP: number;
    heatmapData?: { date: string; count: number }[];
}

export default function ConsistencyChart({ streak, totalXP, heatmapData }: ConsistencyChartProps) {
    // Determine color based on study time count (minutes)
    const getColorClass = (count: number) => {
        if (count === 0) return 'bg-orange-100';
        if (count < 30) return 'bg-orange-300';
        if (count < 60) return 'bg-orange-400';
        if (count < 120) return 'bg-orange-500';
        return 'bg-orange-600';
    };

    return (
        <Card className="p-6 h-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-orange-900 mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-xl">🔥</span> 學習慣性
                    </span>
                    <span className="text-sm font-medium text-orange-700 bg-orange-200/50 px-3 py-1 rounded-full">
                        連續 {streak} 天
                    </span>
                </h3>

                {heatmapData && heatmapData.length > 0 && (
                    <div className="mb-4">
                        <div className="text-xs text-orange-800/70 font-medium mb-2">過去 30 天學習活躍度</div>
                        <div className="flex flex-wrap gap-1.5">
                            {heatmapData.map((day, i) => (
                                <div 
                                    key={i} 
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${getColorClass(day.count)} transition-all hover:ring-2 hover:ring-orange-400 cursor-help`}
                                    title={`${day.date}: ${day.count} 分鐘`}
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-orange-700/60 font-medium">
                            <span>少</span>
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-100"></div>
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-300"></div>
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-400"></div>
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-500"></div>
                            <div className="w-2.5 h-2.5 rounded-sm bg-orange-600"></div>
                            <span>多</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-center justify-between bg-white/60 p-3 rounded-xl border border-orange-200/50">
                <span className="text-sm text-orange-800 font-medium">總累積經驗值</span>
                <span className="text-xl font-black text-orange-600">{totalXP} <span className="text-sm font-bold">XP</span></span>
            </div>
        </Card>
    );
}
