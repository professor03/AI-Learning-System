import type { PetType, StudentTaskType } from '../types';

export const STUDENT_TASK_OPTIONS: Array<{
  value: StudentTaskType;
  label: string;
  tone: 'primary' | 'secondary' | 'neutral';
  description: string;
  defaultMethod: 'spaced-review' | 'active-recall' | null;
  colorClass: string;
}> = [
  {
    value: 'review-homework',
    label: '複習功課',
    tone: 'primary',
    description: '重新整理課堂筆記、練題或重看教材。',
    defaultMethod: 'spaced-review',
    colorClass: 'bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800',
  },
  {
    value: 'make-presentation',
    label: '製作簡報',
    tone: 'secondary',
    description: '整理 PPT/Keynote、規劃呈現內容。',
    defaultMethod: 'active-recall',
    colorClass: 'bg-gradient-to-r from-indigo-200 to-sky-100 text-indigo-800',
  },
  {
    value: 'study-prep',
    label: '預習教材',
    tone: 'primary',
    description: '提前預習下次上課的章節與例題。',
    defaultMethod: 'spaced-review',
    colorClass: 'bg-gradient-to-r from-emerald-200 to-green-100 text-emerald-800',
  },
  {
    value: 'write-report',
    label: '寫報告 / 做研究',
    tone: 'secondary',
    description: '蒐集資料、撰寫報告或整理研究成果。',
    defaultMethod: 'active-recall',
    colorClass: 'bg-gradient-to-r from-rose-200 to-rose-100 text-rose-800',
  },
  {
    value: 'group-meeting',
    label: '小組討論 / Meeting',
    tone: 'neutral',
    description: '協作會議、分配工作或排程討論。',
    defaultMethod: null,
    colorClass: 'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-700',
  },
  {
    value: 'submit-assignment',
    label: '交作業 / 上傳',
    tone: 'neutral',
    description: '整理作業、檢查格式並於平台繳交。',
    defaultMethod: null,
    colorClass: 'bg-gradient-to-r from-stone-200 to-stone-100 text-stone-700',
  },
  {
    value: 'exam-sprint',
    label: '考前衝刺',
    tone: 'primary',
    description: '模擬考、整理重點、最後的集中練習。',
    defaultMethod: 'spaced-review',
    colorClass: 'bg-gradient-to-r from-yellow-200 to-orange-100 text-yellow-900',
  },
];

export const REVIEW_TYPE_META = Object.fromEntries(
  STUDENT_TASK_OPTIONS.map((item) => [
    item.value,
    { label: item.label, tone: item.tone, description: item.description, colorClass: item.colorClass },
  ]),
) as Record<
  StudentTaskType,
  {
    label: string;
    tone: 'primary' | 'secondary' | 'neutral';
    description: string;
    colorClass: string;
  }
>;

export const REVIEW_STATUS_META = {
  done: { label: '完成', tone: 'success' as const },
  pending: { label: '待完成', tone: 'warning' as const },
};

export const QUIZ_ACTION_LABELS = {
  hint: { show: '提示', hide: '隱藏提示' },
  answer: { show: '看答案', hide: '隱藏答案' },
};

export const NOTES_SECTION_TITLE = '章節詳解';
export const NOTES_SUMMARY_TITLE = '重點摘要';
export const TERMINOLOGY_TITLE = '重要術語';
export const TERMINOLOGY_ITEM_CLASS = 'rounded-xl border border-gray-100 p-4';

export const SPACED_REVIEW_TIMELINE = [
  { day: 'Day 1', description: '初次學習：建立整體輪廓並整理筆記' },
  { day: 'Day 3', description: '第一次複習：小測驗 + Active Recall' },
  { day: 'Day 7', description: '第二次複習：串聯跨科重點，強化記憶' },
  { day: 'Day 14', description: '考前衝刺：模擬試題 + 快速回顧' },
];

export const PET_OPTIONS: Array<{
  id: PetType;
  label: string;
  emoji: string;
  description: string;
}> = [
  { id: 'cat', label: '貓咪', emoji: '🐱', description: '安靜地陪伴你的每次學習。' },
  { id: 'dog', label: '小狗', emoji: '🐶', description: '帶來滿滿活力與忠誠。' },
  { id: 'otter', label: '水獺', emoji: '🦦', description: '療癒又靈活，幫你放鬆。' },
  { id: 'alpaca', label: '羊駝', emoji: '🦙', description: '柔軟可愛，守護你的一天。' },
  { id: 'capybara', label: '水豚', emoji: '🦫', description: '最 Chill 的夥伴，帶來平靜。' },
];

export const SMART_TASK_TYPES: StudentTaskType[] = STUDENT_TASK_OPTIONS.filter(
  (item) => item.defaultMethod === 'spaced-review',
).map((item) => item.value);

export const DEFAULT_POMODORO_MAP: Record<StudentTaskType, number> = {
  'review-homework': 4,
  'make-presentation': 3,
  'study-prep': 3,
  'write-report': 4,
  'group-meeting': 2,
  'submit-assignment': 2,
  'exam-sprint': 6,
};
