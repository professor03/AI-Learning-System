import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useMemoryStore } from '../store/useMemoryStore';
import { QuizGenerator, type QuizQuestion as GeneratedQuestion } from '../services/QuizGenerator';
import { evaluateMockExam, generateRescuePlan } from '../lib/ai';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

import type { QuizQuestion as StoredQuestion } from '../types';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMemoryQuiz = location.pathname === '/quiz/memory';
  const isMockExam = location.state?.isMockExam === true;

  const { quizzes, gainXP, setFocusMode } = useAppStore();
  const { atoms, addQuizResult, addAtom } = useMemoryStore();

  const [questions, setQuestions] = useState<(GeneratedQuestion | StoredQuestion)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Normal feedback state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Text input state
  const [textAnswer, setTextAnswer] = useState('');

  // Hardcore Exam State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examReport, setExamReport] = useState<{ report: string, missedConcepts: any[] } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [rescuePlanText, setRescuePlanText] = useState<string | null>(null);

  useEffect(() => {
    setFocusMode(true);
    return () => setFocusMode(false);
  }, [setFocusMode]);

  useEffect(() => {
    if (isMemoryQuiz) {
      try {
        if (atoms.length < 4) {
          return;
        }
        const generator = new QuizGenerator(atoms);
        setQuestions(generator.generateQuiz(5));
      } catch (e) {
        console.error('Quiz generation error:', e);
        setQuestions([]);
      }
    } else if (id && quizzes[id]) {
      setQuestions(quizzes[id]);
    }
  }, [isMemoryQuiz, id, atoms, quizzes]);

  // Setup Timer for Mock Exam
  useEffect(() => {
    if (isMockExam && questions.length > 0 && timeLeft === null && !isFinished) {
      setTimeLeft(questions.length * 60); // 60 seconds per question
    }
  }, [isMockExam, questions, timeLeft, isFinished]);

  useEffect(() => {
    if (isMockExam && timeLeft !== null && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev! - 1), 1000);
      return () => clearInterval(timer);
    } else if (isMockExam && timeLeft === 0 && !isFinished) {
      finishQuiz();
    }
  }, [timeLeft, isMockExam, isFinished]);

  // Reset text answer when question changes
  useEffect(() => {
    setTextAnswer('');
  }, [currentIndex]);

  const handleOptionClick = (option: string) => {
    if (showFeedback) return;

    setSelectedOption(option);
    const newAnswers = { ...answers, [questions[currentIndex].id]: option };
    setAnswers(newAnswers);

    if (!isMockExam) {
      setShowFeedback(true);
    }
  };

  const handleTextSubmit = () => {
    if (showFeedback || !textAnswer.trim()) return;

    setSelectedOption(textAnswer);
    const newAnswers = { ...answers, [questions[currentIndex].id]: textAnswer };
    setAnswers(newAnswers);

    if (!isMockExam) {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(answers[questions[currentIndex + 1].id] || null); // Load next answer if exists
      setShowFeedback(false);
      setTextAnswer('');
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedOption(answers[questions[currentIndex - 1].id] || null);
      setShowFeedback(false);
      setTextAnswer('');
    }
  }

  const finishQuiz = async (isGiveUp: boolean = false) => {
    setIsFinished(true);
    
    let correct = 0;
    const wrongs: { atomId: string; userAnswer: string; correctAnswer: string }[] = [];

    questions.forEach(q => {
      const userAns = answers[q.id];
      const correctAns = 'correctAnswer' in q ? q.correctAnswer : (q as any).answer;

      const isCorrect = q.type === 'short-answer' || q.type === 'fill-in-the-blank'
        ? userAns?.toLowerCase().trim() === correctAns?.toLowerCase().trim()
        : userAns === correctAns;

      if (isCorrect) {
        correct++;
      } else {
        wrongs.push({
          atomId: 'atomId' in q ? q.atomId : 'external',
          userAnswer: userAns || '',
          correctAnswer: correctAns || ''
        });
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);

    addQuizResult({
      id: uuidv4(),
      date: Date.now(),
      score: finalScore,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongAnswers: wrongs,
      type: isMemoryQuiz ? 'review' : (isMockExam ? 'exam' : 'quiz')
    });

    const xp = finalScore >= 80 ? (isMockExam ? 100 : 50) : 20;
    gainXP(xp);

    if (isMockExam) {
      setIsEvaluating(true);
      const reportData = await evaluateMockExam(questions, answers);
      setExamReport(reportData);
      
      if (reportData.missedConcepts && reportData.missedConcepts.length > 0) {
        if (finalScore < 60 || isGiveUp) {
          // Trigger Knowledge Rescue Plan
          const rescueText = await generateRescuePlan(reportData.missedConcepts);
          setRescuePlanText(rescueText);
        } else {
          // Auto punishment without rescue plan
          reportData.missedConcepts.forEach(c => {
             addAtom({
              term: c.term,
              definition: c.definition,
              sourceId: 'mock-exam-punishment'
            });
          });
        }
      }
      setIsEvaluating(false);
    }
  };

  const handleRescueComplete = () => {
    if (examReport?.missedConcepts) {
      examReport.missedConcepts.forEach(c => {
        addAtom({
          term: c.term,
          definition: c.definition,
          sourceId: 'mock-exam-punishment'
        });
      });
    }
    setRescuePlanText(null);
  };

  const cleanOptionText = (text: string) => {
    return text ? text.replace(/^[A-D][\.:]\s*/, '') : '';
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="text-center p-8 max-w-md w-full">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-xl font-bold mb-2">準備中...</h2>
          <p className="text-gray-500 mb-6">正在為您生成測驗題目，請稍候。</p>
          <Button onClick={() => navigate(-1)} variant="ghost">返回</Button>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    if (rescuePlanText) {
      return (
        <div className="min-h-screen bg-red-900/90 py-8 px-4 flex flex-col items-center justify-center fixed inset-0 z-50 overflow-y-auto backdrop-blur-md">
          <Card className="max-w-3xl w-full p-8 bg-gray-900 border-2 border-red-500 shadow-2xl text-white">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">🚑</div>
              <h2 className="text-3xl font-black text-red-500 mb-2">知識搶救室 (Knowledge Rescue Room)</h2>
              <p className="text-gray-400">因為您的分數低於 60 分或提早放棄，系統已啟動緊急知識搶救計畫。您必須閱讀完這份白話解析，我們才會將正確觀念寫入記憶庫。</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-h-[50vh] overflow-y-auto prose prose-invert">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-lg">
                {rescuePlanText}
              </div>
            </div>

            <div className="mt-8">
              <Button onClick={handleRescueComplete} className="w-full bg-red-600 hover:bg-red-700 py-4 text-lg font-bold">
                我理解了，請將這些觀念寫入記憶庫
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full mx-auto space-y-6">
          <Card className="p-8 text-center bg-white shadow-xl">
            <div className="text-6xl mb-4">{score >= 80 ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-bold mb-2">{isMockExam ? '模擬考結束' : '測驗完成！'}</h2>
            <div className={`text-6xl font-black mb-6 ${score >= 80 ? 'text-green-600' : 'text-primary-600'}`}>
              {score} <span className="text-2xl text-gray-400 font-bold">分</span>
            </div>
            {!isMockExam && (
              <Button className="w-full max-w-xs mx-auto" onClick={() => navigate('/')}>回到首頁</Button>
            )}
          </Card>

          {isMockExam && (
            <Card className="p-6 md:p-8 bg-gray-900 text-white shadow-2xl border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-400">
                <span>⚖️</span> AI 嚴厲檢討報告
              </h3>
              
              {isEvaluating ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin mb-4"></div>
                   <p className="text-gray-400 animate-pulse">閱卷官正在批改考卷並分析弱點...</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                    {examReport?.report}
                  </div>

                  {examReport?.missedConcepts && examReport.missedConcepts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <h4 className="text-lg font-bold text-red-400 mb-4">🚨 錯題已強制轉換為記憶卡片 (明日強制複習)</h4>
                      <div className="grid gap-3">
                        {examReport.missedConcepts.map((c, i) => (
                          <div key={i} className="bg-gray-800 p-4 rounded-xl border border-red-900/50">
                            <div className="font-bold text-gray-100 mb-1">{c.term}</div>
                            <div className="text-sm text-gray-400">{c.definition}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-6">
                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => navigate('/')}>
                      知恥近乎勇，回首頁
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const isTextQuestion = currentQ.type === 'short-answer' || currentQ.type === 'fill-in-the-blank';
  const isCorrect = isTextQuestion
    ? selectedOption?.toLowerCase().trim() === currentQ.correctAnswer?.toLowerCase().trim()
    : selectedOption === currentQ.correctAnswer;

  return (
    <div className={`min-h-screen flex flex-col ${isMockExam ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <div className={`${isMockExam ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b px-4 py-3 sticky top-0 z-10 shadow-sm transition-colors`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className={isMockExam ? 'text-gray-400 hover:text-white' : ''}>
              ✕
            </Button>
            {isMockExam && !isFinished && (
              <Button variant="ghost" onClick={() => finishQuiz(true)} className="text-red-400 hover:bg-red-900/30 hover:text-red-300 text-xs px-2">
                放棄測驗
              </Button>
            )}
          </div>

          {/* Progress Bar & Timer */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-bold ${isMockExam ? 'text-red-400' : 'text-gray-500'}`}>
                {isMockExam ? '地獄模擬考進行中' : '一般測驗'}
              </span>
              <span className={`text-xs font-bold ${isMockExam ? (timeLeft && timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-300') : 'text-gray-500'}`}>
                {isMockExam && timeLeft !== null ? `倒數 ${formatTime(timeLeft)}` : `${currentIndex + 1} / ${questions.length}`}
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isMockExam ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <motion.div
                className={`h-full rounded-full ${isMockExam ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 pb-32 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 mt-6"
          >
            {/* Question Section */}
            <div className="flex gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full shadow-sm border flex items-center justify-center font-bold text-lg md:text-xl
                  ${isMockExam ? 'bg-gray-800 border-gray-600 text-red-400' : 'bg-white border-gray-100 text-primary-600'}
                `}>
                  {currentIndex + 1}
                </div>
              </div>

              <div className="flex-1 pt-1 md:pt-2">
                <h3 className={`text-xl md:text-2xl font-bold leading-relaxed tracking-wide ${isMockExam ? 'text-gray-100' : 'text-gray-800'}`}>
                  {currentQ.question}
                </h3>
              </div>
            </div>

            {/* Answer Section */}
            <div className="pl-0 md:pl-16 md:ml-2">
              {isTextQuestion ? (
                <div className="space-y-4">
                  <textarea
                    value={isMockExam ? (answers[currentQ.id] || textAnswer) : textAnswer}
                    onChange={(e) => {
                      setTextAnswer(e.target.value);
                      if (isMockExam) {
                        const newAnswers = { ...answers, [currentQ.id]: e.target.value };
                        setAnswers(newAnswers);
                      }
                    }}
                    disabled={showFeedback}
                    placeholder="請輸入您的答案..."
                    className={`w-full p-4 rounded-xl border-2 focus:ring-2 outline-none transition-all min-h-[120px] text-lg resize-none
                      ${isMockExam 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-900 placeholder-gray-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-200 disabled:bg-gray-50 disabled:text-gray-500'}
                    `}
                  />
                  {!showFeedback && !isMockExam && (
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textAnswer.trim()}
                      className="w-full py-3 text-lg"
                    >
                      送出答案
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {currentQ.options?.map((option, idx) => {
                    const cleanText = cleanOptionText(option);
                    const originalText = option;
                    const isSelected = isMockExam 
                        ? answers[currentQ.id] === originalText
                        : selectedOption === originalText;
                    const isThisCorrect = originalText === currentQ.correctAnswer;

                    let stateStyles = isMockExam 
                        ? "bg-gray-800 border-gray-700 hover:border-gray-500 text-gray-300"
                        : "bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700 shadow-sm";
                    
                    if (showFeedback && !isMockExam) {
                      if (isThisCorrect) {
                        stateStyles = "bg-green-50 border-green-500 ring-1 ring-green-500 shadow-md text-green-900 font-bold";
                      } else if (isSelected && !isThisCorrect) {
                        stateStyles = "bg-red-50 border-red-500 ring-1 ring-red-500 shadow-md text-red-900";
                      } else {
                        stateStyles = "bg-gray-50 border-gray-100 opacity-50 text-gray-500";
                      }
                    } else if (isSelected) {
                      stateStyles = isMockExam
                        ? "bg-gray-700 border-red-500 ring-1 ring-red-500 text-white font-bold"
                        : "bg-primary-50 border-primary-500 ring-1 ring-primary-500 text-primary-900 font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(originalText)}
                        disabled={showFeedback}
                        className={`
                          w-full p-4 md:p-5 text-left rounded-2xl border-2 transition-all duration-200
                          flex items-center gap-4 group
                          ${stateStyles}
                        `}
                      >
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                          ${(showFeedback && !isMockExam && isThisCorrect) ? 'border-green-500 bg-green-500 text-white' :
                            (showFeedback && !isMockExam && isSelected) ? 'border-red-500 bg-red-500 text-white' :
                            isSelected ? (isMockExam ? 'border-red-500 text-red-500' : 'border-primary-500 text-primary-600') :
                              (isMockExam ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400 group-hover:border-primary-400 group-hover:text-primary-400')}
                        `}>
                          {['A', 'B', 'C', 'D'][idx]}
                        </div>
                        <span className="text-lg">
                          {cleanText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inline Feedback Panel (Normal Mode Only) */}
            <AnimatePresence>
              {showFeedback && !isMockExam && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pl-0 md:pl-16 md:ml-2 mt-6"
                >
                  <div className={`rounded-2xl p-6 border-l-4 shadow-lg ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <h4 className={`text-xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? '回答正確！' : '回答錯誤'}
                      </h4>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-700 mb-6 leading-relaxed">
                      <p className="text-base">
                        {currentQ.explanation || (isCorrect ? "您對這個概念掌握得很好！" : `正確答案是：${cleanOptionText(currentQ.correctAnswer || '')}`)}
                      </p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className={`w-full py-3 text-lg shadow-md ${isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {currentIndex < questions.length - 1 ? '下一題 →' : '查看結果'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mock Exam Navigation */}
            {isMockExam && (
              <div className="pl-0 md:pl-16 md:ml-2 mt-8 flex gap-4">
                <Button 
                  onClick={handlePrev} 
                  disabled={currentIndex === 0} 
                  variant="ghost"
                  className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  ← 上一題
                </Button>
                <Button 
                  onClick={handleNext}
                  className={`flex-1 ${currentIndex === questions.length - 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {currentIndex === questions.length - 1 ? '強制交卷' : '下一題 →'}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

