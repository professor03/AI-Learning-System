import { useMemoryStore } from '../../store/useMemoryStore';
import { getStockStats } from '../../lib/stockUtils';
import { motion } from 'framer-motion';

interface StockPortfolioProps {
    onSelectStock?: (stockId: string) => void;
    selectedStockId?: string | null;
}

export default function StockPortfolio({ onSelectStock, selectedStockId }: StockPortfolioProps) {
    const { getStocks } = useMemoryStore();

    const stockList = getStocks();
    const stats = getStockStats(stockList);

    // Calculate Top Mover based on Total Earnings (Yield)
    const topMover = [...stockList].sort((a, b) => b.totalEarnings - a.totalEarnings)[0];

    if (stockList.length === 0) {
        return (
            <div className="text-center py-8 text-slate-600 border border-dashed border-slate-800 rounded-lg">
                <p className="text-2xl mb-2 opacity-50">📊</p>
                <p className="font-light tracking-wide text-sm">NO ACTIVE POSITIONS</p>
                <p className="text-[10px] mt-1 uppercase tracking-widest">Upload notes to begin investing</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0d0f12] p-3 rounded border border-slate-800/60 flex flex-col justify-center min-h-[80px]">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight break-words">持倉<br /><span className="opacity-75">(POSITIONS)</span></p>
                    <p className="text-lg font-light text-slate-200 mt-1 font-mono">{stats.totalStocks}</p>
                </div>
                <div className="bg-[#0d0f12] p-3 rounded border border-slate-800/60 flex flex-col justify-center min-h-[80px]">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight break-words">市值<br /><span className="opacity-75">(MARKET CAP)</span></p>
                    <p className="text-lg font-light text-amber-500/90 mt-1 font-mono">${stats.totalValue}</p>
                </div>
                <div className="bg-[#0d0f12] p-3 rounded border border-slate-800/60 flex flex-col justify-center min-h-[80px]">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight break-words">月收益<br /><span className="opacity-75">(YIELD)</span></p>
                    <p className="text-lg font-light text-emerald-500/90 mt-1 font-mono">+${stats.monthlyReturn}</p>
                </div>
            </div>

            {/* Stock List */}
            <div className="space-y-2">
                {stockList
                    .sort((a, b) => b.performance - a.performance)
                    .map((stock) => {
                        const isSelected = selectedStockId === stock.id;
                        return (
                            <motion.div
                                key={stock.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => onSelectStock?.(stock.id)}
                                className={`p-4 rounded border transition-all cursor-pointer group ${isSelected
                                    ? 'bg-amber-500/10 border-amber-500/50'
                                    : 'bg-[#0d0f12] border-slate-800 hover:border-amber-500/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded bg-slate-800/50 flex items-center justify-center text-lg transition-all shrink-0 ${isSelected
                                            ? 'grayscale-0 opacity-100 text-amber-500'
                                            : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'
                                            }`}>
                                            {stock.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className={`font-medium text-sm transition-colors truncate ${isSelected ? 'text-amber-500' : 'text-slate-300 group-hover:text-amber-500'
                                                }`}>
                                                {stock.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">
                                                {stock.totalHoldings} SHARES • {stock.masteredHoldings} VESTED
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <p className={`text-sm font-mono ${stock.trend === 'up' ? 'text-emerald-500' :
                                            stock.trend === 'down' ? 'text-red-500' :
                                                'text-slate-500'
                                            }`}>
                                            {stock.performance}%
                                            {stock.trend === 'up' && ' ▲'}
                                            {stock.trend === 'down' && ' ▼'}
                                        </p>
                                        <p className="text-[10px] text-slate-600 font-mono">
                                            ROI ${stock.totalEarnings}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
            </div>

            {/* Top Performer Highlight */}
            {topMover && topMover.totalEarnings > 0 && (
                <div className="bg-gradient-to-r from-amber-500/5 to-transparent p-3 rounded border-l-2 border-amber-500/30">
                    <div className="flex items-center gap-3">
                        <span className="text-amber-500/50 text-xs uppercase tracking-widest leading-tight whitespace-nowrap md:whitespace-normal">最佳表現 (TOP MOVER)</span>
                        <span className="text-xs font-bold text-amber-500 flex-1 min-w-0 break-words">{topMover.name}</span>
                        <span className="text-xs font-mono text-emerald-500 ml-auto shrink-0">+${topMover.totalEarnings}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
