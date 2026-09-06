import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateQuiz, generatePBLScenario, type PBLScenario, type PBLConfig } from '../lib/ai';
import NotesDetail from '../components/notes/NotesDetail';
import ContextualAIWrapper from '../components/notes/ContextualAIWrapper';
import NotesSummary from '../components/notes/NotesSummary';
import PblChallenge from '../components/pbl/PblChallenge';
import PBLWizard from '../components/pbl/PBLWizard';
import GenerationProgress from '../components/ui/GenerationProgress';
import TerminologyList from '../components/notes/TerminologyList';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../lib/api';
import type { LectureNotes } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Notes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes: storedNotes, addQuiz } = useAppStore();
  const [notes, setNotes] = useState<LectureNotes | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    count: 3,
    type: 'mixed',
    allowExternal: false,
  });
  const [isMockExam, setIsMockExam] = useState(false);
  const [isGeneratingPBL, setIsGeneratingPBL] = useState(false);
  const [activePblScenario, setActivePblScenario] = useState<PBLScenario | null>(null);
  // PBL Wizard
  const [showPBLWizard, setShowPBLWizard] = useState(false);

  // Custom dropdown state
  const [isCountOpen, setIsCountOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);

  // Refs for click outside detection
  const countRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const found = storedNotes.find((n) => n.id === id);
    if (found) {
      setNotes(found);
    } else {
      api.getLectureNotes(id).then(setNotes).catch(() => setNotes(null));
    }
  }, [id, storedNotes]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countRef.current && !countRef.current.contains(event.target as Node)) {
        setIsCountOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setIsScopeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateQuiz = async () => {
    if (!notes) return;
    try {
      setIsGeneratingQuiz(true);
      // Combine summary and sections for context
      const context = `${notes.summary}\n\n${notes.sections.map(s => s.content).join('\n')}`;
      const questions = await generateQuiz(context, quizConfig);
      addQuiz(notes.id, questions);
      navigate(`/quiz/${notes.id}`, { state: { isMockExam } });
    } catch (error) {
      console.error(error);
      alert('生成題目失敗');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handlePBLWizardConfirm = async (config: PBLConfig) => {
    if (!notes) return;
    setShowPBLWizard(false);
    try {
      setIsGeneratingPBL(true);
      const context = `${notes.summary}\n\n${notes.sections.map(s => s.content).join('\n')}`;
      const scenario = await generatePBLScenario(context, config);
      setActivePblScenario(scenario);
    } catch (error) {
      console.error(error);
      alert('生成 PBL 情境失敗');
    } finally {
      setIsGeneratingPBL(false);
    }
  };

  // Library View (No ID selected)
  if (!id) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 筆記圖書館</h1>
            <p className="text-gray-500 mt-2">選擇一份筆記開始學習，或上傳新的教材。</p>
          </div>
          <Button onClick={() => navigate('/upload')}>
            + 上傳新教材
          </Button>
        </div>

        {storedNotes.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-xl text-gray-500 mb-4">目前還沒有筆記</p>
            <Button onClick={() => navigate('/upload')}>
              開始上傳第一份教材
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-shadow cursor-pointer group" onClick={() => navigate(`/notes/${note.id}`)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                      📝
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {note.sections.length} 章節
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {note.courseName || '未命名課程'}
                  </h3>

                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                    {note.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {note.terms?.length || 0} 個知識點
                    </span>
                    <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                      開始閱讀 →
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Detail View
  if (!notes) {
    return <p className="text-gray-500">讀取講義筆記中...</p>;
  }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate('/notes')}>
          ← 返回圖書館
        </Button>
      </div>
      <NotesSummary summary={notes.summary} />
      <ContextualAIWrapper noteId={notes.id}>
        <div className="space-y-6">
          <NotesDetail sections={notes.sections} />
          <TerminologyList terms={notes.terms} />
        </div>
      </ContextualAIWrapper>
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm space-y-4">
        <h3 className="font-semibold text-lg">生成測驗設定</h3>
        
        {/* Hardcore Mode Toggle */}
        <div className="flex items-center gap-3 py-3 px-4 mb-4 bg-red-50 rounded-xl border border-red-100">
          <button
            type="button"
            onClick={() => setIsMockExam(!isMockExam)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isMockExam ? 'bg-red-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMockExam ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div>
            <span className="text-sm font-bold text-red-600 flex items-center gap-1">
              <span>💀</span> 開啟沉浸式地獄考場 (Hardcore Mock Exam)
            </span>
            <p className="text-xs text-red-500/80">限時作答、隱藏即時解答、考後嚴厲檢討</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={countRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">題目數量</label>
            <button
              type="button"
              onClick={() => setIsCountOpen(!isCountOpen)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm text-gray-700 flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span>{quizConfig.count} 題</span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            <AnimatePresence>
              {isCountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {[3, 5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setQuizConfig({ ...quizConfig, count });
                        setIsCountOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${quizConfig.count === count ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {count} 題
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative" ref={typeRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">題型</label>
            <button
              type="button"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm text-gray-700 flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span>
                {quizConfig.type === 'mixed' ? '混合題型' :
                  quizConfig.type === 'multiple-choice' ? '選擇題' :
                    quizConfig.type === 'true-false' ? '是非題' : '簡答題'}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            <AnimatePresence>
              {isTypeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {[
                    { value: 'mixed', label: '混合題型' },
                    { value: 'multiple-choice', label: '選擇題' },
                    { value: 'true-false', label: '是非題' },
                    { value: 'short-answer', label: '簡答題' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setQuizConfig({ ...quizConfig, type: option.value });
                        setIsTypeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${quizConfig.type === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative" ref={scopeRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">出題範圍</label>
            <button
              type="button"
              onClick={() => setIsScopeOpen(!isScopeOpen)}
              className="w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-2 text-sm text-gray-700 flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span>{quizConfig.allowExternal ? '允許聯網補充 (AI 知識庫)' : '僅限講義內容'}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            <AnimatePresence>
              {isScopeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {[
                    { value: false, label: '僅限講義內容' },
                    { value: true, label: '允許聯網補充 (AI 知識庫)' }
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => {
                        setQuizConfig({ ...quizConfig, allowExternal: option.value });
                        setIsScopeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${quizConfig.allowExternal === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz || isGeneratingPBL}
            className={`w-full md:w-auto ${isMockExam ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}`}
          >
            {isGeneratingQuiz ? 'AI 出題中...' : (isMockExam ? '💀 進入地獄考場' : '開始生成題目')}
          </Button>

          <Button
            type="button"
            onClick={() => setShowPBLWizard(true)}
            disabled={isGeneratingQuiz || isGeneratingPBL}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 border-none shadow-lg shadow-indigo-500/30"
          >
            💼 PBL 實務挑戰
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {activePblScenario && notes && (
          <PblChallenge
            scenario={activePblScenario}
            sourceText={`${notes.summary}\n\n${notes.sections.map(s => s.content).join('\n')}`}
            onComplete={(score) => {
              console.log('PBL Completed with score:', score);
            }}
            onClose={() => setActivePblScenario(null)}
          />
        )}
      </AnimatePresence>

      {/* PBL Setup Wizard */}
      <AnimatePresence>
        {showPBLWizard && notes && (
          <PBLWizard
            noteTitle={notes.courseName || '筆記'}
            onConfirm={handlePBLWizardConfirm}
            onClose={() => setShowPBLWizard(false)}
          />
        )}
      </AnimatePresence>

      {/* Generation Progress Overlay */}
      <GenerationProgress isVisible={isGeneratingQuiz} type="quiz" estimatedSeconds={15} />
      <GenerationProgress isVisible={isGeneratingPBL} type="pbl" estimatedSeconds={12} />
    </div>
  );
};

export default Notes;
