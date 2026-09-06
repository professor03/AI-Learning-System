import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { useAppStore } from '../store/useAppStore';
import { useMemoryStore } from '../store/useMemoryStore';
import { generateStudyPlan } from '../lib/studyPlan';
import type { StudyPlanItem } from '../types';

const StudyPlan = () => {
  const navigate = useNavigate();
  const { notes, setStudyPlan } = useAppStore();
  const { atoms } = useMemoryStore();
  const [examDate, setExamDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [mode, setMode] = useState<'exam' | 'review'>('exam');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Extract unique courses from notes
  const availableSubjects = Array.from(new Set(notes.map(n => {
    // 1. Try to use the explicit courseName field (new notes)
    if (n.courseName) return n.courseName;

    // 2. Try to extract from summary if it starts with "課程：" (legacy notes)
    const firstLine = n.summary.split('\n')[0];
    const match = firstLine.match(/課程：(.+)/);
    if (match) return match[1].trim();

    // 3. Fallback: Truncate summary to avoid breaking UI
    return firstLine.length > 15 ? firstLine.slice(0, 15) + '...' : firstLine;
  }))).filter(Boolean);

  // Auto-select all subjects initially
  useEffect(() => {
    if (availableSubjects.length > 0 && selectedSubjects.length === 0) {
      setSelectedSubjects(availableSubjects);
    }
  }, [notes]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleGenerate = async () => {
    if (mode === 'exam' && !examDate) {
      alert('考試衝刺模式需要選擇考試日期');
      return;
    }
    if (!selectedSubjects.length) {
      alert('請至少選擇一個科目');
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);
    try {
      const relevantNotes = notes.filter(n => selectedSubjects.some(s => n.summary.includes(s)));
      const summary = relevantNotes.map((n) => n.summary).join('\n\n');

      const generatedPlan = await generateStudyPlan(new Date(examDate), summary || 'General Study', selectedSubjects, mode, atoms);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert('生成讀書計畫失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const updatePlanItem = (id: string, field: keyof StudyPlanItem, value: string) => {
    setPlan(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    setIsSaved(false); // Reset saved status if edited
  };

  const removePlanItem = (id: string) => {
    setPlan(prev => prev.filter(item => item.id !== id));
    setIsSaved(false);
  };

  const handleSaveToCalendar = () => {
    setStudyPlan(plan);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <Button variant="ghost" onClick={() => navigate(1)}>
          前進 →
        </Button>
      </div>
      <Card>
        <h2 className="text-xl font-semibold mb-4">AI 智能讀書計畫</h2>
        <p className="text-sm text-text-normal mb-4">
          系統會根據您目前擁有的 {notes.length} 份筆記，自動為您安排到考試前的複習進度。
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-dark">選擇學習模式</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="mode"
                      value="exam"
                      checked={mode === 'exam'}
                      onChange={() => setMode('exam')}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">🔥 考試衝刺 (Exam Sprint)</span>
                      <span className="text-xs text-gray-500">考前急救！AI 將為您安排所有章節的密集複習菜單。</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="mode"
                      value="review"
                      checked={mode === 'review'}
                      onChange={() => setMode('review')}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">🧠 間隔複習 (Spaced Review)</span>
                      <span className="text-xs text-gray-500">平時保養。系統會根據遺忘曲線，精準挑選即將忘記的知識點。</span>
                    </div>
                  </label>
                </div>
              </div>

              {mode === 'exam' && (
                <div className="animate-fadeIn">
                  <Input
                    label="考試/目標日期 (必填)"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-dark">選擇科目 ({selectedSubjects.length})</label>
              <div className="bg-white/50 rounded-xl p-3 border border-white/40 max-h-40 overflow-y-auto space-y-2">
                {availableSubjects.length > 0 ? availableSubjects.map(subject => (
                  <label key={subject} className="flex items-center gap-2 cursor-pointer hover:bg-white/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => toggleSubject(subject)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                )) : (
                  <p className="text-sm text-gray-500 italic">尚未上傳筆記，請先上傳教材。</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleGenerate} disabled={isGenerating || !selectedSubjects.length || (mode === 'exam' && !examDate)}>
              {isGenerating ? 'AI 規劃中...' : '✨ 生成讀書計畫'}
            </Button>
          </div>
          {notes.length === 0 && (
            <p className="text-xs text-red-500 mt-2">請先到「上傳教材」新增筆記才能生成計畫。</p>
          )}
        </form>
      </Card>

      {plan.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">您的專屬計畫預覽</h3>
            {isSaved ? (
              <span className="text-green-600 font-bold px-4 py-2 bg-green-50 rounded-lg">✅ 已同步至行事曆！</span>
            ) : (
              <Button onClick={handleSaveToCalendar} className="bg-primary hover:bg-primary-dark text-gray-900 shadow-md">
                🗓️ 儲存並加入行事曆
              </Button>
            )}
          </div>
          
          <div className="grid gap-3">
            {plan.map((item) => (
              <Card key={item.id} variant="accent" className="relative pr-12">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start sm:items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <div className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1">任務主題</label>
                      <input
                        type="text"
                        value={item.topic}
                        onChange={(e) => updatePlanItem(item.id, 'topic', e.target.value)}
                        className="bg-white/50 border border-gray-200 rounded px-2 py-1 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-600 pl-1">{item.course}</p>
                  </div>
                  <div className="sm:col-span-4 flex flex-col items-start sm:items-end w-full">
                    <label className="text-xs text-gray-500 mb-1">排定日期</label>
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updatePlanItem(item.id, 'dueDate', e.target.value)}
                      className="bg-white/50 border border-gray-200 rounded px-2 py-1 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removePlanItem(item.id)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="刪除此項目"
                >
                  ✕
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;


