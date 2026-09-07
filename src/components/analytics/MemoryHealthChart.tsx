import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';

interface MemoryHealthChartProps {
    retentionRate: number;
    riskItems: number;
    totalQuestions: number;
    masteryDistribution?: { master: number; familiar: number; learning: number; forgotten: number };
    topUrgentCards?: string[];
}

export default function MemoryHealthChart({ retentionRate, riskItems, masteryDistribution, topUrgentCards }: MemoryHealthChartProps) {
    const navigate = useNavigate();
    
    const hasData = masteryDistribution && (masteryDistribution.master + masteryDistribution.familiar + masteryDistribution.learning + masteryDistribution.forgotten > 0);
    
    const data = hasData ? [
        { name: '已內化 (Master)', value: masteryDistribution.master, color: '#10b981' },
        { name: '熟悉 (Familiar)', value: masteryDistribution.familiar, color: '#3b82f6' },
        { name: '學習中 (Learning)', value: masteryDistribution.learning, color: '#f59e0b' },
        { name: '遺忘風險 (Forgotten)', value: masteryDistribution.forgotten, color: '#ef4444' }
    ] : [
        { name: '無資料', value: 1, color: '#e2e8f0' }
    ];

    return (
        <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🧠</span> 記憶健康度與分佈
            </h3>

            <div className="flex flex-col items-center justify-between flex-1">
                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => [hasData ? `${value ?? 0} 張卡片` : '無資料', '數量']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-black text-gray-800">{retentionRate}%</span>
                        <span className="text-xs text-gray-500 font-medium">平均測驗正確率</span>
                    </div>
                </div>
                
                {/* Custom Legend */}
                {hasData && (
                    <div className="w-full flex flex-wrap justify-center gap-3 mt-2 text-[10px] font-medium text-gray-600">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span>已內化</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>熟悉</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>學習中</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>遺忘風險</div>
                    </div>
                )}

                <div className="w-full mt-6 space-y-3">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-xs text-red-600 font-bold uppercase mb-1">遺忘危險區</div>
                                <div className="text-xl font-black text-red-700">{riskItems} <span className="text-sm font-medium text-red-500">個知識點</span></div>
                            </div>
                            {riskItems > 0 && (
                                <button 
                                    onClick={() => navigate('/review')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-1"
                                >
                                    <span>🚨</span> 急救複習
                                </button>
                            )}
                        </div>
                        {topUrgentCards && topUrgentCards.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-200/50">
                                <span className="text-[10px] text-red-500 font-medium mb-1 block">最急迫需要複習：</span>
                                <div className="flex flex-wrap gap-1">
                                    {topUrgentCards.map((card, i) => (
                                        <span key={i} className="bg-white text-red-700 text-[10px] px-2 py-0.5 rounded border border-red-100 shadow-sm">
                                            {card.length > 8 ? card.slice(0,8) + '...' : card}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
