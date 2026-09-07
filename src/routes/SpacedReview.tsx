import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemoryStore } from '../store/useMemoryStore';
import { useAppStore } from '../store/useAppStore';
import { calculateNextReview, type Rating } from '../lib/fsrs';
import Flashcard from '../components/memory/Flashcard';
import Button from '../components/ui/Button';
import type { KnowledgeAtom } from '../types/memory';

export default function SpacedReview() {
  const navigate = useNavigate();
  const { getDueAtoms, updateAtom, updateMissionProgress, logSession } = useMemoryStore();
  const { setFocusMode } = useAppStore();

  const [sessionAtoms, setSessionAtoms] = useState<KnowledgeAtom[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, xp: 0, startTime: Date.now() });

  useEffect(() => {
    setFocusMode(true);
    const due = getDueAtoms();
    // Shuffle atoms for randomness
    setSessionAtoms(due.sort(() => Math.random() - 0.5).slice(0, 20)); // Limit to 20 per session
    return () => setFocusMode(false);
  }, [getDueAtoms, setFocusMode]);

  const handleRate = (rating: number) => {
    const currentAtom = sessionAtoms[currentIndex];

    // Map rating to FSRS
    const ratingMap: Record<number, Rating> = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy', 5: 'Easy' };
    const fsrsRating = ratingMap[rating] || 'Good';

    const card = {
      due: currentAtom.nextReview,
      stability: currentAtom.stability || 0,
      difficulty: currentAtom.difficulty || 0,
      elapsed_days: currentAtom.elapsed_days || 0,
      scheduled_days: currentAtom.scheduled_days || 0,
      reps: currentAtom.reps || 0,
      lapses: currentAtom.lapses || 0,
      state: currentAtom.state || 'New',
      last_review: currentAtom.lastReview || null
    };

    const nextCard = calculateNextReview(card, fsrsRating, Date.now());
    const updates = {
      nextReview: nextCard.due,
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      elapsed_days: nextCard.elapsed_days,
      scheduled_days: nextCard.scheduled_days,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
      state: nextCard.state,
      lastReview: nextCard.last_review || Date.now()
    };
    updateAtom(currentAtom.id, updates as any);

    // Track Stats
    const isCorrect = rating >= 3;
    const xpGain = isCorrect ? 10 : 2;

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      xp: prev.xp + xpGain
    }));

    // Update Mission Progress (Incrementally)
    updateMissionProgress('review_count', 1);

    // Move to next
    if (currentIndex < sessionAtoms.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      finishSession(sessionStats.xp + xpGain);
    }
  };

  const finishSession = (totalXP: number) => {
    setIsSessionComplete(true);
    const durationMinutes = Math.ceil((Date.now() - sessionStats.startTime) / 60000);

    // Log Session
    logSession({
      id: uuidv4(),
      date: Date.now(),
      durationMinutes,
      type: 'review',
      xpGained: totalXP
    });

    // Update Missions
    // updateMissionProgress('review_count', sessionAtoms.length); // Moved to handleRate for incremental updates
  };

  if (sessionAtoms.length === 0 && !isSessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">太棒了！目前沒有待複習的內容</h2>
        <p className="text-gray-500 mb-8">休息一下，或是去學習新的知識吧！</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/notes')}>去閱讀筆記</Button>
          <Button variant="ghost" onClick={() => navigate('/')}>回首頁</Button>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100"
        >
          <div className="text-6xl mb-4">💪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">複習完成！</h2>
          <p className="text-gray-500 mb-6">大腦正在強化這些記憶連結...</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.correct}/{sessionAtoms.length}</div>
              <div className="text-xs text-blue-400 font-bold uppercase">正確率</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-amber-600">+{sessionStats.xp}</div>
              <div className="text-xs text-amber-400 font-bold uppercase">獲得 XP</div>
            </div>
          </div>

          <Button className="w-full" onClick={() => navigate('/')}>
            完成並返回
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentAtom = sessionAtoms[currentIndex];
  const progress = ((currentIndex) / sessionAtoms.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>✕ 結束</Button>
        <div className="text-sm font-medium text-gray-500">
          {currentIndex + 1} / {sessionAtoms.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Flashcard Area */}
      <div className="min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAtom.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Flashcard
              term={currentAtom.term}
              definition={currentAtom.definition}
              onRate={handleRate}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


