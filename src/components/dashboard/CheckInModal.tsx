import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function CheckInModal() {
    const { isCheckInOpen, setCheckInOpen, performCheckIn, lastCheckInDate } = useAppStore();
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    useEffect(() => {
        setIsCheckedIn(lastCheckInDate === new Date().toISOString().split('T')[0]);
    }, [lastCheckInDate, isCheckInOpen]);

    const handleCheckIn = () => {
        const result = performCheckIn();
        if (result.success) {
            setIsCheckedIn(true);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500', '#ffffff']
            });

            // Auto close after 2.5 seconds
            setTimeout(() => {
                setCheckInOpen(false);
            }, 2500);
        }
    };

    return (
        <AnimatePresence>
            {isCheckInOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden relative"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setCheckInOpen(false)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 bg-black/20 hover:bg-black/30 rounded-full p-1 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header Image / Gradient */}
                        <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="text-7xl animate-bounce drop-shadow-lg">📅</div>
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">每日簽到</h2>

                            {!isCheckedIn ? (
                                <>
                                    <p className="text-gray-500 mb-8 leading-relaxed">
                                        保持學習習慣！<br />
                                        簽到即可獲得 <span className="font-bold text-amber-500 text-lg">20 XP</span>
                                    </p>
                                    <button
                                        onClick={handleCheckIn}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        立即簽到
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-500 mb-6">
                                        你今天已經完成簽到了！<br />明天再來吧！
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-2xl mb-8 bg-green-50 py-3 rounded-xl border border-green-100">
                                        <span>✅</span>
                                        <span>已完成</span>
                                    </div>
                                    <button
                                        onClick={() => setCheckInOpen(false)}
                                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        關閉
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
