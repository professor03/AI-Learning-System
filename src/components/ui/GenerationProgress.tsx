import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerationProgressProps {
  isVisible: boolean;
  type: 'quiz' | 'pbl';
  /** Estimated total seconds for the task (used to drive the fake progress bar) */
  estimatedSeconds?: number;
}

const QUIZ_STEPS = [
  { label: '分析講義重點...', icon: '📖' },
  { label: '設計題型與難度...', icon: '🧠' },
  { label: 'AI 正在出題中...', icon: '✍️' },
  { label: '驗證答案邏輯...', icon: '✅' },
];

const PBL_STEPS = [
  { label: '分析講義領域...', icon: '🔍' },
  { label: '建構角色與情境...', icon: '🎭' },
  { label: 'AI 編寫挑戰任務...', icon: '💡' },
  { label: '最終情境生成中...', icon: '🚀' },
];

export default function GenerationProgress({ isVisible, type, estimatedSeconds = 12 }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = type === 'quiz' ? QUIZ_STEPS : PBL_STEPS;

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setStepIndex(0);
      return;
    }

    // Smooth fake progress: goes to ~90% over estimatedSeconds, then stalls
    const intervalMs = 120;
    const totalTicks = (estimatedSeconds * 1000) / intervalMs;
    let ticks = 0;

    const timer = setInterval(() => {
      ticks++;
      // easeOutQuad approach: fast start, slows near 90%
      const ratio = ticks / totalTicks;
      const fakeProgress = Math.min(90, 90 * (1 - Math.pow(1 - ratio, 2)));
      setProgress(fakeProgress);
      setStepIndex(Math.min(steps.length - 1, Math.floor(ratio * steps.length)));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isVisible, estimatedSeconds, steps.length]);

  // When generation completes (isVisible goes false) jump to 100%
  useEffect(() => {
    if (!isVisible && progress > 0) {
      setProgress(100);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6"
          >
            {/* Animated icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-6xl"
            >
              {steps[stepIndex].icon}
            </motion.div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-xl font-extrabold text-slate-800">
                {type === 'quiz' ? 'AI 出題中...' : 'AI 生成情境任務...'}
              </h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-500 text-sm mt-1"
                >
                  {steps[stepIndex].label}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${type === 'quiz' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-violet-500 to-purple-600'}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>步驟 {stepIndex + 1} / {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex gap-2">
              {steps.map((_s, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i === stepIndex ? 1.3 : 1,
                    backgroundColor: i <= stepIndex ? (type === 'quiz' ? '#4f46e5' : '#7c3aed') : '#e2e8f0',
                  }}
                  className="w-2.5 h-2.5 rounded-full"
                />
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center">
              ✨ AI 正在為您量身打造，請稍候...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
