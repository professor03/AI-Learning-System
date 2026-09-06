import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KnowledgeAtom } from '../../types/memory';
import { useMemoryStore } from '../../store/useMemoryStore';

interface ReviewCardModalProps {
    atoms: KnowledgeAtom[];
    onReviewComplete: (atomId: string, quality: number) => void;
    onClose: () => void;
}

const RATING_OPTIONS = [
    { value: 0, label: '完全忘記', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-red-500' },
    { value: 2, label: '很難想起', color: 'bg-orange-500 hover:bg-orange-600', textColor: 'text-orange-500' },
    { value: 4, label: '想起來了', color: 'bg-green-500 hover:bg-green-600', textColor: 'text-green-500' },
    { value: 5, label: '秒記', color: 'bg-blue-500 hover:bg-blue-600', textColor: 'text-blue-500' },
];

export default function ReviewCardModal({ atoms, onReviewComplete, onClose }: ReviewCardModalProps) {
    const { updateMissionProgress } = useMemoryStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const currentAtom = atoms[currentIndex];
    const progress = `${currentIndex + 1} / ${atoms.length}`;

    const handleFlip = () => {
        if (!showResult) {
            setIsFlipped(!isFlipped);
        }
    };

    const handleRate = (quality: number) => {
        setShowResult(true);

        // Call the callback
        onReviewComplete(currentAtom.id, quality);

        // Move to next card or close
        setTimeout(() => {
            if (currentIndex < atoms.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
                setShowResult(false);
            } else {
                // All done
                updateMissionProgress('review_count', atoms.length);
                onClose();
            }
        }, 600);
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-mono text-sm border border-slate-700">
                            {progress}
                        </span>
                        <span className="text-slate-400 text-sm">
                            {isFlipped ? '📖 定義' : '💡 術語'}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            updateMissionProgress('review_count', atoms.length);
                            onClose();
                        }}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        ✕ 結束複習
                    </button>
                </div>

                {/* Card Container */}
                <div
                    className="relative h-96 mb-6 cursor-pointer perspective-1000"
                    onClick={handleFlip}
                >
                    <motion.div
                        className="relative w-full h-full"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front Face (Term) */}
                        <div
                            className="absolute inset-0 backface-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-amber-500/30 rounded-2xl shadow-2xl flex items-center justify-center p-8">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">術語 (Term)</p>
                                    <h2 className="text-3xl md:text-4xl font-bold text-amber-400">
                                        {currentAtom.term}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Back Face (Definition) */}
                        <div
                            className="absolute inset-0 backface-hidden"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-black border-2 border-emerald-500/30 rounded-2xl shadow-2xl flex items-center justify-center p-6 md:p-8">
                                <div className="text-center max-w-xl">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">定義 (Definition)</p>
                                    <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed break-words">
                                        {currentAtom.definition}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Hint */}
                {!isFlipped && !showResult && (
                    <p className="text-center text-slate-400 text-sm mb-4 animate-pulse">
                        💡 點擊卡片翻轉查看定義
                    </p>
                )}

                {/* Rating Buttons */}
                <AnimatePresence>
                    {isFlipped && !showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3"
                        >
                            {RATING_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRate(option.value);
                                    }}
                                    className={`${option.color} text-white px-6 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 hover:shadow-xl`}
                                >
                                    <div className="text-lg">{option.label}</div>
                                    <div className="text-xs opacity-80 mt-1">({option.value})</div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Feedback */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-center py-8"
                        >
                            <div className="text-6xl mb-4">✅</div>
                            <p className="text-2xl font-bold text-emerald-400">已記錄！</p>
                            <p className="text-slate-400 mt-2">正在準備下一張...</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Keyboard Hints */}
                <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
                    <span>💡 提示：點擊卡片翻轉</span>
                    {isFlipped && <span>| 選擇難度評分</span>}
                </div>
            </div>
        </div>
    );
}
