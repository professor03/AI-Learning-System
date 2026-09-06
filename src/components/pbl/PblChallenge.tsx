import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluatePBLResponse, type PBLScenario } from '../../lib/ai';

interface PblChallengeProps {
  scenario: PBLScenario;
  sourceText: string;
  onComplete: (score: number) => void;
  onClose: () => void;
}

const PblChallenge = ({ scenario, sourceText, onComplete, onClose }: PblChallengeProps) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string } | null>(null);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await evaluatePBLResponse(scenario, response, sourceText);
      setEvaluation(result);
      if (result.score >= 60) {
        onComplete(result.score);
      }
    } catch (error) {
      alert('評估時發生錯誤，請重試！');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto border border-white/60"
      >
        {/* Left Side: Mission Briefing */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white flex flex-col relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-6 w-max border border-white/10 shadow-sm">
              PBL 實務挑戰 (Challenge Mode)
            </div>
            
            <h2 className="text-3xl font-extrabold mb-2 leading-tight drop-shadow-sm">{scenario.title}</h2>
            <div className="flex items-center gap-2 mb-8 text-blue-100 bg-black/20 p-3 rounded-xl border border-white/10 shadow-inner">
              <span className="text-xl">👤</span>
              <span className="font-medium">角色：{scenario.role}</span>
            </div>
            
            <div className="space-y-6 flex-1">
              <div>
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>📖</span> 背景情境
                </h3>
                <p className="text-white/90 leading-relaxed text-sm md:text-base bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
                  {scenario.scenario}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>🎯</span> 您的任務
                </h3>
                <p className="text-white font-semibold leading-relaxed text-lg bg-black/20 p-5 rounded-2xl border border-blue-400/30 shadow-md">
                  {scenario.problemStatement}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Execution & Feedback */}
        <div className="md:w-7/12 p-8 bg-slate-50 flex flex-col h-full relative">
          {!evaluation ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">提出您的解決方案</h3>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">
                請根據剛剛學習到的知識，結合上述情境，寫下您會如何解決這個問題。不用死背名詞，重點在於「應用」。
              </p>
              
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <textarea
                  className="relative w-full h-64 p-5 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm text-slate-700 leading-relaxed"
                  placeholder="例如：我會先檢查...然後使用...因為這可以解決..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !response.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>AI 評估中...</span>
                    </>
                  ) : (
                    <>
                      <span>提交方案</span>
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800">任務報告</h3>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">✕</button>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={351.8}
                        strokeDashoffset={351.8 - (351.8 * evaluation.score) / 100}
                        className={evaluation.score >= 80 ? 'text-emerald-500' : evaluation.score >= 60 ? 'text-amber-500' : 'text-rose-500'}
                        style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-extrabold text-slate-800">{evaluation.score}</span>
                      <span className="text-xs text-slate-500 font-medium">/100</span>
                    </div>
                  </div>
                  <h4 className={`mt-4 text-xl font-bold ${evaluation.score >= 80 ? 'text-emerald-600' : evaluation.score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {evaluation.score >= 80 ? '🌟 出色完成任務！' : evaluation.score >= 60 ? '👍 方案可行，但有改進空間' : '💪 需要再多思考一下'}
                  </h4>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto mb-6">
                  <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">專家反饋</h5>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {evaluation.feedback}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-auto">
                  <button
                    onClick={() => {
                      setEvaluation(null);
                      setResponse('');
                    }}
                    className="px-6 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    重新挑戰
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all"
                  >
                    完成
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PblChallenge;
