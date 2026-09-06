import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import type { KnowledgeAtom, MemoryStats, KnowledgeStock, QuizResult, DailyMission, LearningSession } from '../types/memory';

interface MemoryState {
    atoms: KnowledgeAtom[];
    stocks: Record<string, KnowledgeStock>; // Stock ID -> Stock data
    quizHistory: QuizResult[];
    dailyMissions: DailyMission[];
    learningSessions: LearningSession[];

    // Actions
    addAtom: (atom: Omit<KnowledgeAtom, 'id' | 'createdAt' | 'mastery' | 'streak' | 'stability' | 'difficulty' | 'elapsed_days' | 'scheduled_days' | 'reps' | 'lapses' | 'state' | 'lastReview' | 'nextReview'>) => void;
    updateAtom: (id: string, updates: Partial<KnowledgeAtom>) => void;
    deleteAtom: (id: string) => void;
    getDueAtoms: () => KnowledgeAtom[];
    getStats: () => MemoryStats;

    // Stock actions
    updateStock: (stockId: string, updates: Partial<KnowledgeStock>) => void;
    recordDividend: (stockId: string, dividend: number) => void;
    getStocks: () => KnowledgeStock[];

    // Phase 3 Actions
    addQuizResult: (result: QuizResult) => void;
    updateMissionProgress: (type: DailyMission['type'], amount: number) => void;
    logSession: (session: LearningSession) => void;
    checkDailyReset: () => void;

    // Debug/Dev
    resetMemory: () => void;
}

const DEFAULT_MISSIONS: DailyMission[] = [
    { id: 'mission-1', type: 'new_atoms', target: 5, progress: 0, completed: false, rewardXP: 50, title: '探索新知', description: '新增 5 個知識原子', icon: '🌱', date: '' },
    { id: 'mission-2', type: 'review_count', target: 10, progress: 0, completed: false, rewardXP: 30, title: '溫故知新', description: '完成 10 次複習', icon: '📝', date: '' },
    { id: 'mission-3', type: 'quiz_score', target: 1, progress: 0, completed: false, rewardXP: 100, title: '挑戰自我', description: '在測驗中獲得 80 分以上', icon: '🏆', date: '' },
];

export const useMemoryStore = create<MemoryState>()(
    persist(
        (set, get) => ({
            atoms: [],
            stocks: {},
            quizHistory: [],
            dailyMissions: [],
            learningSessions: [],

            addAtom: (atomData) => {
                const newAtom: KnowledgeAtom = {
                    id: uuidv4(),
                    ...atomData,
                    mastery: 0,
                    streak: 0,
                    stability: 0,
                    difficulty: 0,
                    elapsed_days: 0,
                    scheduled_days: 0,
                    reps: 0,
                    lapses: 0,
                    state: 'New',
                    lastReview: 0,
                    nextReview: Date.now(), // Due immediately
                    createdAt: Date.now(),
                };

                // Check for duplicates (simple term check)
                const exists = get().atoms.some(a => a.term.toLowerCase() === atomData.term.toLowerCase());
                if (exists) return; // Or handle merge logic later

                set((state) => ({
                    atoms: [...state.atoms, newAtom]
                }));

                // Track mission
                get().updateMissionProgress('new_atoms', 1);
            },

            updateAtom: (id, updates) => {
                set((state) => ({
                    atoms: state.atoms.map(atom =>
                        atom.id === id ? { ...atom, ...updates } : atom
                    )
                }));
            },

            deleteAtom: (id) => {
                set((state) => ({
                    atoms: state.atoms.filter(atom => atom.id !== id)
                }));
            },

            getDueAtoms: () => {
                const now = Date.now();
                return get().atoms.filter(atom => atom.nextReview <= now);
            },

            getStats: () => {
                const atoms = get().atoms;
                const now = Date.now();
                return {
                    totalAtoms: atoms.length,
                    atomsDue: atoms.filter(a => a.nextReview <= now).length,
                    masteredCount: atoms.filter(a => a.mastery >= 4).length,
                    newCount: atoms.filter(a => a.mastery === 0).length
                };
            },

            updateStock: (stockId, updates) => {
                set((state) => ({
                    stocks: {
                        ...state.stocks,
                        [stockId]: {
                            ...state.stocks[stockId],
                            ...updates
                        }
                    }
                }));
            },

            recordDividend: (stockId, dividend) => {
                const stock = get().stocks[stockId];
                if (!stock) return;

                set((state) => ({
                    stocks: {
                        ...state.stocks,
                        [stockId]: {
                            ...stock,
                            monthlyDividend: stock.monthlyDividend + dividend,
                            totalEarnings: stock.totalEarnings + dividend,
                            lastDividendDate: Date.now()
                        }
                    }
                }));
            },

            getStocks: () => {
                return Object.values(get().stocks);
            },

            addQuizResult: (result) => {
                set((state) => ({
                    quizHistory: [result, ...state.quizHistory]
                }));
                // Check missions
                if (result.score >= 80) {
                    get().updateMissionProgress('quiz_score', 1);
                }
            },

            updateMissionProgress: (type, amount) => {
                set((state) => ({
                    dailyMissions: state.dailyMissions.map(mission => {
                        if (mission.type === type && !mission.completed) {
                            const newProgress = Math.min(mission.progress + amount, mission.target);
                            return {
                                ...mission,
                                progress: newProgress,
                                completed: newProgress >= mission.target
                            };
                        }
                        return mission;
                    })
                }));
            },

            logSession: (session) => {
                set((state) => ({
                    learningSessions: [session, ...state.learningSessions]
                }));
            },

            checkDailyReset: () => {
                const lastReset = localStorage.getItem('last_daily_reset');
                const today = new Date().toDateString();

                if (lastReset !== today || get().dailyMissions.length === 0) {
                    // Reset or Initialize daily missions
                    set(() => ({
                        dailyMissions: DEFAULT_MISSIONS.map(m => ({
                            ...m,
                            date: today,
                            progress: 0,
                            completed: false
                        }))
                    }));
                    localStorage.setItem('last_daily_reset', today);
                }
            },

            resetMemory: () => {
                set({
                    atoms: [],
                    stocks: {},
                    quizHistory: [],
                    dailyMissions: DEFAULT_MISSIONS.map(m => ({ ...m, date: new Date().toDateString() })),
                    learningSessions: []
                });
                localStorage.setItem('last_daily_reset', new Date().toDateString());
            }
        }),
        {
            name: 'ai-student-memory', // Unique key for localStorage
        }
    )
);
