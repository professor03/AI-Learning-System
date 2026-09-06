import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';


interface FlashcardProps {
    term: string;
    definition: string;
    onRate: (rating: number) => void;
    className?: string;
}

export default function Flashcard({ term, definition, onRate, className }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleRate = (rating: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onRate(rating);
        setIsFlipped(false); // Reset for next card
    };

    return (
        <div className={clsx("perspective-1000 w-full max-w-md mx-auto aspect-[3/4] cursor-pointer", className)} onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="relative w-full h-full transition-all duration-500 transform-style-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front (Term) */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">Term</div>
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight">{term}</h3>
                    <p className="absolute bottom-8 text-sm text-gray-400 animate-pulse">點擊翻轉</p>
                </div>

                {/* Back (Definition) */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180">
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">Definition</div>
                        <p className="text-xl font-medium leading-relaxed">{definition}</p>
                    </div>

                    {/* Rating Controls */}
                    <div className="w-full grid grid-cols-4 gap-2 mt-auto pt-6 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => handleRate(1, e)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">😫</span>
                            <span className="text-xs text-red-400 font-bold">忘記</span>
                        </button>
                        <button
                            onClick={(e) => handleRate(2, e)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">😬</span>
                            <span className="text-xs text-orange-400 font-bold">困難</span>
                        </button>
                        <button
                            onClick={(e) => handleRate(3, e)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🙂</span>
                            <span className="text-xs text-blue-400 font-bold">記得</span>
                        </button>
                        <button
                            onClick={(e) => handleRate(5, e)}
                            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🤩</span>
                            <span className="text-xs text-green-400 font-bold">簡單</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
