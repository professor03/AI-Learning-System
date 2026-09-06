import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { usePetSystem } from '../../hooks/usePetSystem';

interface WellnessSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MOODS = [
    { emoji: '😊', label: '開心', color: 'bg-green-100 text-green-600' },
    { emoji: '😐', label: '平靜', color: 'bg-blue-100 text-blue-600' },
    { emoji: '😫', label: '疲憊', color: 'bg-orange-100 text-orange-600' },
    { emoji: '😤', label: '焦慮', color: 'bg-red-100 text-red-600' },
    { emoji: '🤯', label: '崩潰', color: 'bg-purple-100 text-purple-600' },
];

const PETS = [
    { id: 'cat', name: 'Neko', emoji: '🐱', color: 'from-orange-400 to-amber-500' },
    { id: 'dog', name: 'Inu', emoji: '🐶', color: 'from-amber-700 to-amber-900' },
    { id: 'rabbit', name: 'Usagi', emoji: '🐰', color: 'from-pink-400 to-rose-500' },
];

export default function WellnessSidebar({ isOpen, onClose }: WellnessSidebarProps) {
    const {
        petLevel, petXP, petHealth, petHunger,
        selectedPet, setSelectedPet,
        mood, setMood
    } = useAppStore();

    usePetSystem(); // Ensure pet system is active

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                drag="x"
                dragConstraints={{ left: -320, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -100) {
                        onClose();
                    }
                }}
                className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[60] overflow-y-auto border-r border-slate-100 touch-pan-y"
            >
                <div className="p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span>🌿</span> 療育中心
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Pet Status Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700">夥伴狀態</h3>
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                Lv.{petLevel}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* Health */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">健康度</span>
                                    <span className="font-mono text-slate-700">{Math.round(petHealth)}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${petHealth}%` }}
                                    />
                                </div>
                            </div>

                            {/* Hunger */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">飽足感</span>
                                    <span className="font-mono text-slate-700">{Math.round(100 - petHunger)}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                                        style={{ width: `${100 - petHunger}%` }}
                                    />
                                </div>
                            </div>

                            {/* XP */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">經驗值</span>
                                    <span className="font-mono text-slate-700">{Math.round(petXP)} / {petLevel * 100}</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(petXP / (petLevel * 100)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pet Selector */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">選擇夥伴</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {PETS.map((pet) => (
                                <button
                                    key={pet.id}
                                    onClick={() => setSelectedPet(pet.id as any)}
                                    className={`relative p-3 rounded-xl border-2 transition-all ${selectedPet === pet.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="text-3xl mb-1">{pet.emoji}</div>
                                    <div className="text-xs font-medium text-slate-600">{pet.name}</div>
                                    {selectedPet === pet.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood Tracker */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">今日心情</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {MOODS.map((m) => (
                                <button
                                    key={m.label}
                                    onClick={() => setMood(m.label)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${mood === m.label
                                        ? `${m.color} ring-2 ring-offset-1 ring-blue-400 scale-110`
                                        : 'hover:bg-slate-50 grayscale hover:grayscale-0'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{m.emoji}</span>
                                    <span className="text-[10px] font-medium">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daily Quote */}
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-indigo-800 text-sm italic leading-relaxed">
                            "The expert in anything was once a beginner."
                        </p>
                        <p className="text-indigo-500 text-xs mt-2 font-medium text-right">
                            — Helen Hayes
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
