import Card from '../ui/Card';

interface KnowledgeGalaxyChartProps {
    totalNodes: number;
    connectionRate: number;
}

export default function KnowledgeGalaxyChart({ totalNodes, connectionRate }: KnowledgeGalaxyChartProps) {
    return (
        <Card className="p-6 h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

            <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2 relative z-10">
                <span className="text-xl">🌌</span> 知識星系
            </h3>

            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-slate-400 text-xs mb-1">知識節點</div>
                    <div className="text-3xl font-bold text-blue-300">{totalNodes}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="text-slate-400 text-xs mb-1">連結密度</div>
                    <div className="text-3xl font-bold text-purple-300">{connectionRate}</div>
                </div>
            </div>

            <div className="mt-6 text-xs text-slate-400 relative z-10 leading-relaxed">
                您的知識網絡正在擴張中。節點代表知識原子，連結代表概念間的關聯。持續連結新舊知識以強化結構。
            </div>
        </Card>
    );
}
