
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';

const Dashboard = lazy(() => import('./routes/Dashboard'));
const MemoryDashboard = lazy(() => import('./routes/MemoryBank'));
const Notes = lazy(() => import('./routes/Notes'));
const Quiz = lazy(() => import('./routes/Quiz'));
const SpacedReview = lazy(() => import('./routes/SpacedReview'));
const Upload = lazy(() => import('./routes/Upload'));
const StudyPlan = lazy(() => import('./routes/StudyPlan'));
const Research = lazy(() => import('./routes/Research'));
const Vault = lazy(() => import('./routes/Vault'));
const LearnSight = lazy(() => import('./routes/LearnSight'));
import ChatSidebar from './components/chat/ChatSidebar';
import ReviewCardModal from './components/memory/ReviewCardModal';
import OnboardingManager from './components/layout/OnboardingManager';

import { useAppStore } from './store/useAppStore';
import { useMemoryStore } from './store/useMemoryStore';
import { calculateNextReview, type Rating } from './lib/fsrs';
import { calculateDividend } from './lib/stockUtils';

import { usePetSystem } from './hooks/usePetSystem';
import { useStudyTimer } from './hooks/useStudyTimer';
import { useGlobalTimer } from './hooks/useGlobalTimer';

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function App() {
  usePetSystem();
  useStudyTimer(); // Activate study timer
  useGlobalTimer(); // Activate global pomodoro timer
  const { isChatOpen, setChatOpen, reviewModal, closeReviewModal, rewardPet, isFocusMode, initApp, setCurrentLocation } = useAppStore();
  const { atoms, updateAtom, recordDividend } = useMemoryStore();
  const location = useLocation();

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    setCurrentLocation(location.pathname);
  }, [location.pathname, setCurrentLocation]);

  const handleReviewComplete = (atomId: string, quality: number) => {
    const atom = atoms.find(a => a.id === atomId);
    if (!atom) return;

    // Map quality (1-5 from ReviewCardModal) to FSRS Rating
    let rating: Rating = 'Good';
    if (quality <= 2) rating = 'Again';
    else if (quality === 3) rating = 'Hard';
    else if (quality === 4) rating = 'Good';
    else if (quality === 5) rating = 'Easy';

    const updatedAtom = calculateNextReview({
      ...atom,
      due: atom.nextReview,
      last_review: atom.reps > 0 ? atom.lastReview : null,
    }, rating, Date.now());
    
    // We only need to update the FSRS specific fields
    updateAtom(atomId, {
      stability: updatedAtom.stability,
      difficulty: updatedAtom.difficulty,
      elapsed_days: updatedAtom.elapsed_days,
      scheduled_days: updatedAtom.scheduled_days,
      reps: updatedAtom.reps,
      lapses: updatedAtom.lapses,
      state: updatedAtom.state,
      lastReview: updatedAtom.last_review || Date.now(),
      nextReview: updatedAtom.due
    });

    const dividend = calculateDividend(quality);
    if (dividend > 0) {
      recordDividend(atom.sourceId, dividend);
    }

    const xpGain = quality * 5;
    const hungerReduction = 3;
    rewardPet(xpGain, hungerReduction);
  };
  return (
    <>
      <AppLayout>
        <OnboardingManager />
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="flex items-center justify-center h-full w-full pt-32"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
              <Route path="/memory" element={<PageTransition><MemoryDashboard /></PageTransition>} />
              <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
              <Route path="/notes/:id" element={<PageTransition><Notes /></PageTransition>} />
              <Route path="/quiz" element={<PageTransition><Quiz /></PageTransition>} />
              <Route path="/quiz/:id" element={<PageTransition><Quiz /></PageTransition>} />
              <Route path="/review" element={<PageTransition><SpacedReview /></PageTransition>} />
              <Route path="/upload" element={<PageTransition><Upload /></PageTransition>} />
              <Route path="/study-plan" element={<PageTransition><StudyPlan /></PageTransition>} />
              <Route path="/vault" element={<PageTransition><Vault /></PageTransition>} />
              <Route path="/research" element={<PageTransition><Research /></PageTransition>} />
              <Route path="/learnsight" element={<PageTransition><LearnSight /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </AppLayout >
      {!isFocusMode && <ChatSidebar isOpen={isChatOpen} onToggle={() => setChatOpen(!isChatOpen)} />}

      {
        reviewModal.isOpen && (
          <ReviewCardModal
            atoms={reviewModal.atoms}
            onReviewComplete={handleReviewComplete}
            onClose={closeReviewModal}
          />
        )
      }
    </>
  );
}

export default App;
