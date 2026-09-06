import { useState, useMemo, useEffect } from 'react';
import { useMemoryStore } from '../store/useMemoryStore';
import { useAppStore } from '../store/useAppStore';
import type { KnowledgeAtom, KnowledgeStock } from '../types/memory';
import { motion } from 'framer-motion';
import { calculateStock } from '../lib/stockUtils';
import StockPortfolio from '../components/memory/StockPortfolio';
import AddAssetModal from '../components/memory/AddAssetModal';

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(val);

export default function MemoryBank() {
    const { atoms, stocks, getStats, getDueAtoms, updateStock, addAtom } = useMemoryStore();
    const { notes, openReviewModal } = useAppStore();
    const stats = getStats();
    const dueAtoms = getDueAtoms();
    const [filter, setFilter] = useState('');
    const [isAddingAsset, setIsAddingAsset] = useState(false);
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

    // Refresh stocks when notes or atoms change
    useEffect(() => {
        if (notes.length > 0) {
            notes.forEach(note => {
                const existingStock = stocks[note.id];
                const updatedStock = calculateStock(note, atoms, existingStock);
                updateStock(note.id, updatedStock);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes, atoms]);

    const filteredAtoms = useMemo(() => {
        return atoms.filter((atom: KnowledgeAtom) => {
            const matchesFilter = atom.term.toLowerCase().includes(filter.toLowerCase()) ||
                atom.definition.toLowerCase().includes(filter.toLowerCase());
            const matchesStock = selectedStockId ? atom.sourceId === selectedStockId : true;
            return matchesFilter && matchesStock;
        });
    }, [atoms, filter, selectedStockId]);

    const netWorth = useMemo(() => {
        const atomValue = atoms.reduce((acc, atom) => acc + (atom.mastery * 1000) + 100, 0);
        const stockValue = Object.values(stocks).reduce((acc, stock) => acc + stock.totalEarnings, 0);
        return atomValue + stockValue;
    }, [atoms, stocks]);

    const investmentOpportunities = useMemo(() => {
        const opportunities: Record<string, { stock: KnowledgeStock, atoms: KnowledgeAtom[] }> = {};

        dueAtoms.forEach(atom => {
            const stock = stocks[atom.sourceId];
            if (stock) {
                if (!opportunities[atom.sourceId]) {
                    opportunities[atom.sourceId] = { stock, atoms: [] };
                }
                opportunities[atom.sourceId].atoms.push(atom);
            }
        });

        return Object.values(opportunities);
    }, [dueAtoms, stocks]);

    const handleStartReview = (atomsToReview: KnowledgeAtom[]) => {
        openReviewModal(atomsToReview);
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6 md:p-12 font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 tracking-tight">
                            知識銀行
                        </h1>
                        <p className="text-amber-500/80 text-xs tracking-[0.3em] uppercase mt-2 font-medium">
                            頂級財富管理
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => {
                                const terms = [
                                    { term: 'Compound Interest', def: 'Interest calculated on the initial principal, which also includes all of the accumulated interest.' },
                                    { term: 'Asset Allocation', def: 'An investment strategy that aims to balance risk and reward by apportioning a portfolio\'s assets.' },
                                ];
                                const random = terms[Math.floor(Math.random() * terms.length)];
                                addAtom({
                                    term: random.term,
                                    definition: random.def,
                                    sourceId: 'debug-manual',
                                });
                            }}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono rounded border border-slate-800 transition-colors"
                        >
                            + 測試存款
                        </button>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">淨資產</p>
                            <p className="text-3xl font-mono font-light text-slate-100 tracking-tighter">
                                <span className="text-amber-500/50 mr-1">$</span>{formatCurrency(netWorth)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative aspect-[1.586/1] w-full rounded-xl overflow-hidden shadow-2xl shadow-black/80 group perspective-1000"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c20] via-[#0f1115] to-black border border-slate-700/30 rounded-xl transform transition-transform duration-500 group-hover:scale-[1.01]">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                <div className="relative h-full p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-md shadow-lg opacity-90 border border-amber-300/20"></div>
                                            <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">AI LEARNER</span>
                                        </div>
                                        <span className="text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">無限卡</span>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="font-mono text-xl tracking-[0.15em] text-slate-300 drop-shadow-md">
                                            **** **** **** {atoms.length.toString().padStart(4, '0')}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div></div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">持卡人</p>
                                            <p className="text-sm font-bold text-slate-200 font-mono tracking-wider">USER</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#111318] p-5 rounded-lg border border-slate-800/60">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">總資產</p>
                                <p className="text-2xl font-light text-slate-200 mt-2 font-mono">{stats.totalAtoms}</p>
                            </div>
                            <div className="bg-[#111318] p-5 rounded-lg border border-slate-800/60">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">掌握率</p>
                                <p className="text-2xl font-light text-emerald-500/80 mt-2 font-mono">
                                    {Math.round((stats.masteredCount / (stats.totalAtoms || 1)) * 100)}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#111318] p-6 rounded-lg border border-slate-800/60">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                投資組合表現
                            </h2>
                            <StockPortfolio
                                onSelectStock={(id) => setSelectedStockId(selectedStockId === id ? null : id)}
                                selectedStockId={selectedStockId}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                        {/* Investment Opportunities - Compact Scrollable Folder View */}
                        <div className="bg-[#111318] rounded-lg border border-slate-800/60">
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-amber-500">💼</span>
                                        投資機會
                                    </h2>
                                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold border border-amber-500/20 tracking-wider">
                                        {investmentOpportunities.length} 個教材 • {investmentOpportunities.reduce((sum, { atoms }) => sum + atoms.length, 0)} 張待複習
                                    </span>
                                </div>
                            </div>

                            {/* Scrollable Material List */}
                            <div className="max-h-80 overflow-y-auto">
                                {investmentOpportunities.length > 0 ? (
                                    <div className="p-3 space-y-2">
                                        {investmentOpportunities.map(({ stock, atoms: reviewAtoms }) => {
                                            const isSelected = selectedStockId === stock.id;
                                            const totalAtoms = atoms.filter(a => a.sourceId === stock.id).length;

                                            return (
                                                <motion.div
                                                    key={stock.id}
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className={`rounded-lg border transition-all ${isSelected
                                                        ? 'bg-amber-900/10 border-amber-500/50'
                                                        : 'bg-[#0d0f12] border-slate-800 hover:border-slate-700'
                                                        }`}
                                                >
                                                    {/* Folder Header */}
                                                    <div
                                                        className="flex items-center justify-between p-3 cursor-pointer group"
                                                        onClick={() => setSelectedStockId(isSelected ? null : stock.id)}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                                {stock.icon}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className={`text-xs font-medium truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'
                                                                    }`}>
                                                                    📁 {stock.name}
                                                                </h3>
                                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                                    {totalAtoms} 張總資產 • {reviewAtoms.length} 張待複習
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right">
                                                                <p className="text-xs text-emerald-400 font-mono">
                                                                    +${reviewAtoms.length * 40}
                                                                </p>
                                                                <p className="text-[8px] text-slate-600 uppercase">收益</p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStartReview(reviewAtoms);
                                                                }}
                                                                disabled={reviewAtoms.length === 0}
                                                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold rounded border border-amber-500/50 transition-colors uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                複習
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Folder Content - Anki Cards List */}
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-slate-800"
                                                        >
                                                            <div className="p-3 bg-[#0a0b0d] space-y-1.5 max-h-48 overflow-y-auto">
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 sticky top-0 bg-[#0a0b0d] py-1">
                                                                    <span>📝</span>
                                                                    資料夾內容 ({totalAtoms} 張 Anki 卡片)
                                                                </p>

                                                                {atoms.filter(a => a.sourceId === stock.id).map((atom) => {
                                                                    const needsReview = reviewAtoms.some(ra => ra.id === atom.id);
                                                                    return (
                                                                        <div
                                                                            key={atom.id}
                                                                            className={`p-2 rounded border text-[10px] ${needsReview
                                                                                ? 'bg-amber-500/5 border-amber-500/30'
                                                                                : 'bg-[#0d0f12] border-slate-800'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-slate-200 truncate">
                                                                                        {atom.term}
                                                                                    </p>
                                                                                    <p className="text-slate-500 text-[9px] mt-0.5 line-clamp-2">
                                                                                        {atom.definition}
                                                                                    </p>
                                                                                </div>
                                                                                {needsReview && (
                                                                                    <span className="flex-shrink-0 text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold">
                                                                                        待複習
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <span className="text-4xl mb-3 opacity-20">📂</span>
                                        <p className="text-slate-500 font-light text-xs">沒有投資機會</p>
                                        <p className="text-[10px] text-slate-600 mt-1">上傳教材並鑄造資產後，它們會出現在這裡</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-slate-800">
                            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                                <h2 className="text-lg font-light text-slate-200 tracking-wide self-start sm:self-auto">
                                    資產帳本
                                </h2>
                                {selectedStockId && (
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsAddingAsset(true)}
                                            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold rounded border border-amber-500/50 transition-colors uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 h-14 sm:h-auto min-w-[80px]"
                                        >
                                            <span className="text-lg sm:text-sm">+</span>
                                            <span className="text-[10px] sm:text-xs leading-none">鑄造新資產</span>
                                        </button>
                                        <div className="relative flex-1 sm:flex-none">
                                            <input
                                                type="text"
                                                placeholder="搜尋資產..."
                                                value={filter}
                                                onChange={(e) => setFilter(e.target.value)}
                                                className="bg-[#111318] border border-slate-800 text-slate-300 text-xs rounded-none pl-10 pr-4 py-2 focus:border-amber-500/50 outline-none w-full sm:w-64 transition-all placeholder:text-slate-600 uppercase tracking-wider h-14 sm:h-auto"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">🔍</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedStockId ? (
                                <div className="bg-[#111318] rounded-lg border border-slate-800 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-[#0d0f12] border-b border-slate-800 text-slate-500 uppercase tracking-widest">
                                                    <th className="px-6 py-4 font-medium whitespace-nowrap">資產名稱</th>
                                                    <th className="px-6 py-4 font-medium whitespace-nowrap">等級</th>
                                                    <th className="px-6 py-4 font-medium whitespace-nowrap">ROI 係數</th>
                                                    <th className="px-6 py-4 font-medium whitespace-nowrap">成熟度</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {filteredAtoms.length > 0 ? (
                                                    filteredAtoms.map((atom) => (
                                                        <tr key={atom.id} className="hover:bg-slate-800/30 transition-colors group">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="font-medium text-slate-300 group-hover:text-amber-500 transition-colors">
                                                                    {atom.term}
                                                                </div>
                                                                <div className="text-[10px] text-slate-600 truncate max-w-[200px] mt-0.5">
                                                                    {atom.definition}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-slate-400"
                                                                            style={{ width: `${(atom.mastery / 5) * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-500 font-mono">{atom.mastery}/5</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                                                                {(atom.stability || 0).toFixed(2)}x
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono whitespace-nowrap">
                                                                {new Date(atom.nextReview).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-600 uppercase tracking-widest text-[10px]">
                                                            帳本中未找到資產
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 bg-[#111318] rounded-lg border border-dashed border-slate-800 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center mb-4 text-3xl opacity-50">
                                        💼
                                    </div>
                                    <h3 className="text-slate-300 font-light tracking-wide text-lg">選擇投資部位</h3>
                                    <p className="text-slate-500 text-xs mt-2 max-w-md uppercase tracking-widest">
                                        從您的投資組合中選擇一支股票以查看其資產帳本
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isAddingAsset && selectedStockId && (
                    <AddAssetModal
                        stockId={selectedStockId}
                        stockName={stocks[selectedStockId]?.name || '未知股票'}
                        onClose={() => setIsAddingAsset(false)}
                    />
                )}
            </div>
        </div>
    );
}
