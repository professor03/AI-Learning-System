import { create } from 'zustand';
import type { LectureNotes, MaterialType, PetType, QuizQuestion, StudyPlanItem, ResearchResult } from '../types';
import type { KnowledgeAtom } from '../types/memory';

interface AppState {
  uploadType: MaterialType;
  setUploadType: (type: MaterialType) => void;
  studyPlan: StudyPlanItem[];
  setStudyPlan: (plan: StudyPlanItem[]) => void;
  selectedPet: PetType;
  setSelectedPet: (pet: PetType) => void;
  notes: LectureNotes[];
  addNote: (note: LectureNotes) => void;
  quizzes: Record<string, QuizQuestion[]>;
  addQuiz: (noteId: string, questions: QuizQuestion[]) => void;
  researchResults: Record<string, ResearchResult[]>;
  addResearch: (topic: string, results: ResearchResult[]) => void;
  petTrigger: number; // Timestamp to trigger pet wake up
  triggerPet: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Global Context
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  currentLocation: string;
  setCurrentLocation: (loc: string) => void;
  isInitialized: boolean;
  initApp: () => void;

  // Chat State
  isChatOpen: boolean;
  setChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;

  // Focus Mode
  isFocusMode: boolean;
  setFocusMode: (isFocus: boolean) => void;


  // Pet State
  isPetActive: boolean;
  setPetActive: (active: boolean) => void;
  petMood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening' | 'sad';
  petMessage: string | null;
  setPetMood: (mood: 'idle' | 'thinking' | 'happy' | 'confused' | 'listening' | 'sad') => void;
  setPetMessage: (message: string | null | undefined) => void;

  // User Mood
  mood: string;
  setMood: (mood: string) => void;

  // Study Time Tracking
  studyTime: {
    today: number; // minutes
    history: Record<string, number>; // date -> minutes
  };
  updateStudyTime: (minutes: number) => void;

  // Symbiotic Core
  petHealth: number; // 0-100
  petHunger: number; // 0-100
  petXP: number;
  petLevel: number;
  lastFeedTime: number | null; // Timestamp of last feeding
  updatePetStats: (stats: Partial<{ health: number; hunger: number; xp: number; level: number }>) => void;
  rewardPet: (xpAmount: number, hungerReduction: number) => void;
  gainXP: (amount: number) => void;
  feedPet: () => { success: boolean; message: string; cooldownRemaining?: number };

  // Daily Check-in
  lastCheckInDate: string | null;
  performCheckIn: () => { success: boolean; message: string; xpAwarded?: number };
  isCheckInOpen: boolean;
  setCheckInOpen: (isOpen: boolean) => void;

  resetData: () => void;
  // Review Modal State
  reviewModal: {
    isOpen: boolean;
    atoms: KnowledgeAtom[];
  };
  openReviewModal: (atoms: KnowledgeAtom[]) => void;
  closeReviewModal: () => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
}

// Helper to load from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Helper for date string
const getTodayString = () => new Date().toISOString().split('T')[0];

export const useAppStore = create<AppState>((set, get) => ({
  uploadType: 'ppt',
  setUploadType: (type) => set({ uploadType: type }),
  studyPlan: loadFromStorage('ai-student-studyPlan', []),
  setStudyPlan: (plan) => {
    set({ studyPlan: plan });
    saveToStorage('ai-student-studyPlan', plan);
  },
  selectedPet: 'cat',
  setSelectedPet: (pet) => set({ selectedPet: pet }),
  notes: loadFromStorage('ai-student-notes', []),
  addNote: (note) => {
    const newNotes = [...get().notes, note];
    set({ notes: newNotes });
    saveToStorage('ai-student-notes', newNotes);
  },
  quizzes: loadFromStorage('ai-student-quizzes', {}),
  addQuiz: (noteId, questions) => {
    const newQuizzes = { ...get().quizzes, [noteId]: questions };
    set({ quizzes: newQuizzes });
    saveToStorage('ai-student-quizzes', newQuizzes);
  },
  researchResults: loadFromStorage('ai-student-research', {}),
  addResearch: (topic, results) => {
    const newResults = { ...get().researchResults, [topic]: results };
    set({ researchResults: newResults });
    saveToStorage('ai-student-research', newResults);
  },
  petTrigger: 0,
  triggerPet: () => set({ petTrigger: Date.now() }),

  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Global Context
  activeNoteId: null,
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  currentLocation: 'Dashboard',
  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  isInitialized: false,
  initApp: () => {
    const state = get();
    if (state.isInitialized) return;
    
    // Procrastination Check
    if (state.lastCheckInDate) {
      const lastCheckIn = new Date(state.lastCheckInDate).getTime();
      const now = Date.now();
      const hoursSince = (now - lastCheckIn) / (1000 * 60 * 60);
      
      if (hoursSince >= 48) {
        const newHealth = Math.max(0, state.petHealth - 20);
        set({
          petHealth: newHealth,
          petMood: 'sad',
          petMessage: '你已經超過兩天沒來複習了...我好沒精神 😿'
        });
        saveToStorage('ai-student-petHealth', newHealth);
      }
    }
    
    set({ isInitialized: true });
  },

  // Chat
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),

  // Focus Mode
  isFocusMode: false,
  setFocusMode: (isFocus) => set({ isFocusMode: isFocus }),

  // Review Modal
  reviewModal: {
    isOpen: false,
    atoms: [],
  },
  openReviewModal: (atoms) => set({ reviewModal: { isOpen: true, atoms } }),
  closeReviewModal: () => set({ reviewModal: { isOpen: false, atoms: [] } }),

  // Onboarding
  onboardingStep: loadFromStorage('ai-student-onboarding', 0),
  setOnboardingStep: (step) => {
    set({ onboardingStep: step });
    saveToStorage('ai-student-onboarding', step);
  },

  // Pet
  isPetActive: false,
  setPetActive: (active) => set({ isPetActive: active }),
  petMood: 'idle',
  setPetMood: (mood) => set({ petMood: mood }),
  petMessage: null,
  setPetMessage: (message) => set({ petMessage: message || null }),

  // User Mood
  mood: loadFromStorage('ai-student-mood', '平靜'),
  setMood: (mood) => {
    set({ mood });
    saveToStorage('ai-student-mood', mood);
  },

  // Study Time
  studyTime: loadFromStorage('ai-student-studyTime', { today: 0, history: {} }),
  updateStudyTime: (minutes) => {
    set((state) => {
      const today = getTodayString();
      const currentHistory = state.studyTime.history || {};

      // Check if we need to reset for a new day (if last record isn't today)
      // Actually, logic is simpler: just add to today's count if date matches, else reset
      // But we rely on history keys.

      const newTodayTime = (state.studyTime.today || 0) + minutes;
      const newHistory = { ...currentHistory, [today]: newTodayTime };

      const newState = {
        studyTime: {
          today: newTodayTime,
          history: newHistory
        }
      };
      saveToStorage('ai-student-studyTime', newState.studyTime);
      return newState;
    });
  },

  // Symbiotic Core
  petHealth: loadFromStorage('ai-student-petHealth', 100),
  petHunger: loadFromStorage('ai-student-petHunger', 0),
  petXP: loadFromStorage('ai-student-petXP', 0),
  petLevel: loadFromStorage('ai-student-petLevel', 1),
  lastFeedTime: loadFromStorage('ai-student-lastFeedTime', null),
  updatePetStats: (stats) => {
    set((state) => {
      const newState = {
        petHealth: stats.health !== undefined ? Math.max(0, Math.min(100, stats.health)) : state.petHealth,
        petHunger: stats.hunger !== undefined ? Math.max(0, Math.min(100, stats.hunger)) : state.petHunger,
        petXP: stats.xp !== undefined ? stats.xp : state.petXP,
        petLevel: stats.level !== undefined ? stats.level : state.petLevel,
      };
      saveToStorage('ai-student-petHealth', newState.petHealth);
      saveToStorage('ai-student-petHunger', newState.petHunger);
      saveToStorage('ai-student-petXP', newState.petXP);
      saveToStorage('ai-student-petLevel', newState.petLevel);
      return newState;
    });
  },
  rewardPet: (xpAmount: number, hungerReduction: number) => {
    set((state) => {
      const newXP = state.petXP + xpAmount;
      const newHunger = Math.max(0, state.petHunger - hungerReduction);
      const nextLevelXP = state.petLevel * 100; // Simple leveling curve

      let newLevel = state.petLevel;
      let finalXP = newXP;
      let petMessage = `+${xpAmount} XP 📚`;

      // Check for level up
      if (newXP >= nextLevelXP) {
        newLevel = state.petLevel + 1;
        finalXP = newXP - nextLevelXP; // Carry over excess XP
        petMessage = `🎉 恭喜！我升級到 Lv.${newLevel} 了！`;
      }

      const newState = {
        petXP: finalXP,
        petLevel: newLevel,
        petHunger: newHunger,
        petMessage: petMessage,
        petMood: 'happy' as const,
      };

      saveToStorage('ai-student-petXP', newState.petXP);
      saveToStorage('ai-student-petLevel', newState.petLevel);
      saveToStorage('ai-student-petHunger', newState.petHunger);
      return newState;
    });
  },
  gainXP: (amount) => {
    set((state) => {
      const newXP = state.petXP + amount;
      const nextLevelXP = state.petLevel * 100; // Simple leveling curve
      if (newXP >= nextLevelXP) {
        const levelUpState = {
          petXP: newXP - nextLevelXP,
          petLevel: state.petLevel + 1,
          petMessage: "升級了！我變得更聰明了！ 🎉"
        };
        saveToStorage('ai-student-petXP', levelUpState.petXP);
        saveToStorage('ai-student-petLevel', levelUpState.petLevel);
        return levelUpState;
      }
      saveToStorage('ai-student-petXP', newXP);
      return { petXP: newXP };
    });
  },
  feedPet: () => {
    const state = get();
    const now = Date.now();
    const cooldownDuration = 30 * 60 * 1000; // 30 minutes

    // Check cooldown
    if (state.lastFeedTime && (now - state.lastFeedTime < cooldownDuration)) {
      const remaining = Math.ceil((cooldownDuration - (now - state.lastFeedTime)) / 1000 / 60);
      return {
        success: false,
        message: `我還不餓！請 ${remaining} 分鐘後再餵我 🙂`,
        cooldownRemaining: remaining
      };
    }

    // Check if hunger is too low (< 30)
    if (state.petHunger < 30) {
      return {
        success: false,
        message: "我現在不餓欸！等我餓了再餵我吧 😊"
      };
    }

    // Feed the pet
    const hungerReduction = 40;
    const healthBonus = 5;
    const xpReward = 5;

    const newPetState = {
      petHunger: Math.max(0, state.petHunger - hungerReduction),
      petHealth: Math.min(100, state.petHealth + healthBonus),
      petXP: state.petXP + xpReward,
      lastFeedTime: now,
      petMessage: "好好吃！謝謝你餵我 ❤️ (+5 XP)",
      petMood: 'happy' as const
    };

    set(newPetState);
    saveToStorage('ai-student-petHunger', newPetState.petHunger);
    saveToStorage('ai-student-petHealth', newPetState.petHealth);
    saveToStorage('ai-student-petXP', newPetState.petXP);
    saveToStorage('ai-student-lastFeedTime', newPetState.lastFeedTime);

    return {
      success: true,
      message: "餵食成功！寵物獲得 5 XP 並恢復 5 點健康度"
    };
  },

  lastCheckInDate: loadFromStorage('ai-student-lastCheckIn', null),
  performCheckIn: () => {
    const today = getTodayString();
    const state = get();
    if (state.lastCheckInDate === today) {
      return { success: false, message: '今天已經簽到過了喔！明天再來吧！' };
    }

    // Award XP
    const xpReward = 20;
    state.rewardPet(xpReward, 0);

    set({ lastCheckInDate: today });
    saveToStorage('ai-student-lastCheckIn', today);

    return { success: true, message: '簽到成功！獲得 20 XP', xpAwarded: xpReward };
  },

  isCheckInOpen: false,
  setCheckInOpen: (isOpen) => set({ isCheckInOpen: isOpen }),

  resetData: () => {
    set({
      notes: [],
      quizzes: {},
      researchResults: {},
      studyPlan: [],
      petHealth: 100,
      petHunger: 0,
      petXP: 0,
      petLevel: 1,
      lastFeedTime: null,
      petMood: 'idle',
      petMessage: null
    });

    localStorage.removeItem('ai-student-petLevel');
    localStorage.removeItem('ai-student-lastFeedTime');
    localStorage.removeItem('ai-student-studyTime');
    localStorage.removeItem('ai-student-mood');
    localStorage.removeItem('ai-student-lastCheckIn');
    localStorage.removeItem('ai-student-onboarding');

    set({
      notes: [],
      quizzes: {},
      researchResults: {},
      studyPlan: [],
      petHealth: 100,
      petHunger: 0,
      petXP: 0,
      petLevel: 1,
      lastFeedTime: null,
      petMood: 'idle',
      petMessage: null,
      studyTime: { today: 0, history: {} },
      mood: '平靜',
      lastCheckInDate: null,
      isCheckInOpen: false,
      isFocusMode: false,
      onboardingStep: 0
    });
  }
}));
