import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { ReviewTask, StudentTaskType, TaskVector } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { STUDENT_TASK_OPTIONS, REVIEW_TYPE_META } from '../../lib/constants';
import { toISODate } from '../../lib/format';

interface TodayTasksProps {
  tasks: ReviewTask[];
  onAddTask?: (input: {
    title: string;
    type: StudentTaskType;
    dueDate: string;
    vector: TaskVector;
  }) => void;
  onDeleteTask?: (id: string) => void;
  onToggleTask?: (id: string) => void;
}

const methodLabel = (method?: ReviewTask['method']) => {
  if (method === 'spaced-review') return 'Spaced Review';
  if (method === 'active-recall') return 'Active Recall';
  return null;
};

const TaskCheckbox = ({ checked, onClick }: { checked: boolean; onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${checked
      ? 'bg-green-500 border-green-500'
      : 'border-gray-300 hover:border-green-400'
      }`}
  >
    {checked && (
      <motion.svg
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-3.5 h-3.5 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </motion.svg>
    )}
  </motion.button>
);

const TodayTasks = ({ tasks, onAddTask, onDeleteTask, onToggleTask }: TodayTasksProps) => {
  const [form, setForm] = useState({
    title: '',
    dueDate: '',
    type: STUDENT_TASK_OPTIONS[0].value,
  });
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const todayISO = toISODate(new Date());

  // Sort tasks: pending first, then done
  const todaysTasks = useMemo(
    () => tasks
      .filter((task) => task.dueDate === todayISO)
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'pending' ? -1 : 1;
      }),
    [tasks, todayISO],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.dueDate) return;
    onAddTask?.({
      title: form.title,
      type: form.type as StudentTaskType,
      dueDate: form.dueDate,
      vector: { focus: 50, urgency: 50 }, // Default values
    });
    setForm({ title: '', dueDate: '', type: STUDENT_TASK_OPTIONS[0].value });
  };

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">今日任務</h2>
        <span className="text-sm text-gray-500">{todaysTasks.length} 項</span>
      </div>
      {onAddTask && (
        <form
          className="mb-6 grid gap-4 rounded-2xl border border-white/30 p-4 backdrop-blur-lg relative z-10"
          onSubmit={handleSubmit}
        >
          <Input
            label="任務標題"
            placeholder="輸入任務內容"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2 overflow-visible">
            <Input
              label="到期日"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
            <div className="relative overflow-visible" style={{ zIndex: isTypeOpen ? 100 : 'auto' }} ref={typeRef}>
              <label className="text-sm font-medium text-text-dark block mb-2">類型</label>
              <button
                type="button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="w-full rounded-2xl border border-gray-300 bg-white/80 px-4 py-3 text-text-dark backdrop-blur transition text-left flex items-center justify-between hover:border-gray-400"
              >
                <span>
                  {STUDENT_TASK_OPTIONS.find(opt => opt.value === form.type)?.label || STUDENT_TASK_OPTIONS[0].label}
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
                    {STUDENT_TASK_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, type: option.value as StudentTaskType }));
                          setIsTypeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${form.type === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            AI 會為學習型任務自動安排 D+3 / D+7 / D+14 的複習節奏。
          </div>
          <div className="flex justify-end">
            <Button type="submit">新增任務</Button>
          </div>
        </form>
      )}
      <div className="space-y-3 relative z-0">
        <AnimatePresence mode='popLayout'>
          {todaysTasks.map((task) => {
            const meta = REVIEW_TYPE_META[task.type];
            const method = methodLabel(task.method);
            const isDone = task.status === 'done';

            return (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative flex items-start gap-3 rounded-2xl border p-4 backdrop-blur transition-all duration-300 ${isDone
                  ? 'bg-gray-50/50 border-transparent opacity-60'
                  : 'bg-white/40 border-white/40 hover:bg-white/60 hover:shadow-sm'
                  }`}
              >
                {/* Checkbox */}
                <div className="pt-0.5">
                  <TaskCheckbox
                    checked={isDone}
                    onClick={() => onToggleTask?.(task.id)}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`font-medium text-text-dark transition-all duration-300 truncate ${isDone ? 'line-through text-gray-400' : ''
                      }`}>
                      {task.title}
                    </p>

                    {/* Delete Button (Visible on Hover) */}
                    {onDeleteTask && (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                        onClick={() => {
                          onDeleteTask(task.id);
                          if (isDone) {
                            useAppStore.getState().triggerPet();
                          }
                        }}
                        title="刪除任務"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${meta.colorClass} bg-opacity-20`}>
                      {meta.label}
                    </span>
                    {method && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                        {method}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] opacity-60">
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {todaysTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            <p>🎉 今天沒有待辦任務！</p>
            <p className="text-xs mt-1">享受你的自由時間，或新增一個挑戰吧。</p>
          </div>
        )}
      </div>
    </Card >
  );
};

export default TodayTasks;
