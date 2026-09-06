export interface KnowledgeAtom {
    /** Unique UUID for the atom */
    id: string;
    /** The core concept term (e.g., "Mitochondria") */
    term: string;
    /** The definition or context */
    definition: string;
    /** ID of the source note this was extracted from */
    sourceId: string;
    /** Current mastery level (0-5) */
    mastery: number;
    /** Number of consecutive correct answers (Legacy) */
    streak: number;
    /** FSRS: Stability */
    stability: number;
    /** FSRS: Difficulty */
    difficulty: number;
    /** FSRS: Days elapsed since last review */
    elapsed_days: number;
    /** FSRS: Days scheduled until next review */
    scheduled_days: number;
    /** FSRS: Number of repetitions */
    reps: number;
    /** FSRS: Number of lapses (forgotten) */
    lapses: number;
    /** FSRS: Current learning state */
    state: 'New' | 'Learning' | 'Review' | 'Relearning';
    /** Timestamp of the last review */
    lastReview: number;
    /** Timestamp of when the next review is due */
    nextReview: number;
    /** Creation timestamp */
    createdAt: number;
}

export interface MemoryStats {
    totalAtoms: number;
    atomsDue: number;
    masteredCount: number;
    newCount: number;
}

export interface KnowledgeStock {
    id: string;                    // Stock ID (same as Note ID)
    name: string;                  // Stock name (Note title)
    sourceId: string;              // Reference to Note ID
    icon: string;                  // Stock icon (auto-assigned or custom)

    // Holdings
    totalHoldings: number;         // Total atoms from this Note
    masteredHoldings: number;      // Atoms with mastery >= 4

    // Dividends
    monthlyDividend: number;       // Dividends earned this month
    totalEarnings: number;         // All-time total earnings
    lastDividendDate: number;      // Timestamp of last dividend

    // Performance
    performance: number;           // Average mastery percentage (0-100%)
    trend: 'up' | 'down' | 'stable'; // Performance trend
}

export interface StockStats {
    totalStocks: number;
    totalValue: number;            // Sum of all totalEarnings
    topPerformer: KnowledgeStock | null;
    monthlyReturn: number;         // Sum of all monthlyDividend
}

export interface QuizResult {
    id: string;
    date: number;
    score: number; // Percentage 0-100
    totalQuestions: number;
    correctCount: number;
    wrongAnswers: { atomId: string; userAnswer: string; correctAnswer: string }[];
    type: 'review' | 'exam' | 'quiz';
}

export interface DailyMission {
    id: string;
    type: 'review_count' | 'quiz_score' | 'new_atoms';
    target: number;
    progress: number;
    completed: boolean;
    rewardXP: number;
    date: string; // YYYY-MM-DD for daily reset
    title: string;
    description: string;
    icon: string;
}

export interface LearningSession {
    id: string;
    date: number;
    durationMinutes: number;
    type: 'review' | 'quiz' | 'study';
    xpGained: number;
}
