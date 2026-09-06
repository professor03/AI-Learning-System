import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PBLConfig } from '../../lib/ai';

interface PBLWizardProps {
  noteTitle: string;
  /** Recent chat messages as context clues for AI-smart defaults */
  chatHint?: string;
  onConfirm: (config: PBLConfig) => void;
  onClose: () => void;
}

const DIFFICULTY_OPTIONS: { value: PBLConfig['difficulty']; label: string; desc: string; color: string; emoji: string }[] = [
  { value: 'easy',   label: '初級',  desc: '套用單一概念，日常情境',         color: 'border-emerald-400 bg-emerald-50 text-emerald-700', emoji: '🌱' },
  { value: 'medium', label: '中級',  desc: '整合多概念，真實工作場景',       color: 'border-amber-400  bg-amber-50  text-amber-700',   emoji: '⚡' },
  { value: 'hard',   label: '高級',  desc: '多方衝突，跨域批判性思考',       color: 'border-rose-400   bg-rose-50   text-rose-700',    emoji: '🔥' },
];

const ROLE_SUGGESTIONS = [
  '後端工程師', '前端工程師', '資料科學家', '產品經理',
  '醫療研究員', '行銷分析師', '財務顧問', '教育工作者',
];

const CONTEXT_SUGGESTIONS = [
  '電商系統優化', '醫院病歷分析', '學校教學改革',
  '新創公司管理', '城市交通規劃', '環境永續議題',
];

export default function PBLWizard({ noteTitle, chatHint, onConfirm, onClose }: PBLWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState('');
  const [context, setContext] = useState('');
  const [difficulty, setDifficulty] = useState<PBLConfig['difficulty']>('medium');
  const [useAiSuggest, setUseAiSuggest] = useState(false);

  const handleConfirm = () => {
    onConfirm({
      role: useAiSuggest || !role.trim() ? undefined : role.trim(),
      context: useAiSuggest || !context.trim() ? undefined : context.trim(),
      difficulty,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                PBL 情境設定精靈
              </span>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>
            <h2 className="text-2xl font-extrabold text-white">💼 客製化你的挑戰</h2>
            <p className="text-indigo-200 text-sm mt-1">基於《{noteTitle}》</p>
            {/* Step dots */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-white w-8' : 'bg-white/30 w-4'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Step 1: AI or Custom */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">情境如何決定？</h3>
                  <p className="text-slate-500 text-sm">你可以親自設定，或讓 AI 根據你的筆記與聊天記錄智慧推薦。</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setUseAiSuggest(false); setStep(2); }}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100 transition-all group"
                  >
                    <span className="text-3xl">✏️</span>
                    <span className="font-bold text-indigo-700 text-sm">我來決定</span>
                    <span className="text-xs text-indigo-500 text-center">自訂角色與情境</span>
                  </button>
                  <button
                    onClick={() => { setUseAiSuggest(true); setStep(3); }}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-violet-200 bg-violet-50 hover:border-violet-500 hover:bg-violet-100 transition-all group"
                  >
                    <span className="text-3xl">✨</span>
                    <span className="font-bold text-violet-700 text-sm">AI 智慧生成</span>
                    <span className="text-xs text-violet-500 text-center">
                      {chatHint ? '根據你的提問習慣推薦' : '根據講義類型推薦'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Custom Role & Context */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">你要扮演什麼角色？</h3>
                  <p className="text-slate-500 text-sm">輸入角色或從下方快速選擇。</p>
                </div>

                <div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="例如：資深後端工程師"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ROLE_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setRole(s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${role === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">希望在什麼情境下挑戰？</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="例如：電商系統效能優化"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CONTEXT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setContext(s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${context === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                >
                  下一步 →
                </button>
              </motion.div>
            )}

            {/* Step 3: Difficulty */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">選擇挑戰難度</h3>
                  <p className="text-slate-500 text-sm">難度會影響情境的複雜程度與問題的深度。</p>
                </div>

                <div className="space-y-3">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDifficulty(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${difficulty === opt.value ? opt.color + ' border-opacity-100 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'}`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-xs opacity-75">{opt.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${difficulty === opt.value ? 'border-current bg-current' : 'border-slate-300'}`}>
                        {difficulty === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(useAiSuggest ? 1 : 2)}
                    className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all"
                  >
                    ← 上一步
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-[2] py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                  >
                    🚀 開始生成情境
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
