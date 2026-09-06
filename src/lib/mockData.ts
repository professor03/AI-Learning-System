import type {
  CoachingMessage,
  LectureNotes,
  Material,
  QuizQuestion,
  ResearchResult,
  ReviewTask,
  StudyPlanItem,
} from '../types';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (base: Date, days: number) => {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const mockMaterials: Material[] = [
  {
    id: 'material-1',
    title: '微積分 Ch3 極限',
    type: 'ppt',
    course: '微積分',
    uploadedAt: formatDate(addDays(today, -1)),
  },
];

export const mockLectureNotes: LectureNotes[] = [
  {
    id: 'notes-1',
    materialId: 'material-1',
    summary:
      '本章節聚焦於極限概念、極限法則以及連續函數，強調如何利用圖形化與代數技巧協助理解。',
    sections: [
      {
        id: 'sec-1',
        title: '極限的直觀理解',
        content:
          '透過函數趨近某值時的函數值變化，強調利用左極限與右極限觀察趨勢。',
      },
      {
        id: 'sec-2',
        title: '極限定理與運算',
        content:
          '介紹極限的加減乘除運算、夾擠定理與洛必達法則，並搭配例題示範。',
      },
      {
        id: 'sec-3',
        title: '連續性的應用',
        content:
          '說明函數在一點連續的條件、介值定理，以及在工程與物理領域的應用案例。',
      },
    ],
    terms: [
      { term: '夾擠定理', definition: '若函數被兩個函數夾住且兩者極限相同，則原函數極限亦相同。' },
      { term: '連續函數', definition: '在某點極限存在且等於該點函數值的函數。' },
      { term: '洛必達法則', definition: '處理 0/0 或 ∞/∞ 型極限的法則。' },
    ],
  },
];

export const mockQuizBank: Record<string, QuizQuestion[]> = {
  'notes-1': [
    {
      id: 'quiz-1',
      question: '什麼是夾擠定理？',
      type: 'open',
      hint: '三條函數之間的關係',
      answer: '如果 f(x) 被 g(x)、h(x) 夾住且兩者極限相同，則 f(x) 極限也相同。',
    },
    {
      id: 'quiz-2',
      question: '列舉一個生活中連續函數的例子。',
      type: 'open',
      hint: '例如溫度或高度',
      answer: '時間與溫度的關係通常可視為連續函數。',
    },
    {
      id: 'quiz-3',
      question: '當極限定義式出現 0/0 時可以使用哪個法則？',
      type: 'fill-in',
      answer: '洛必達法則',
    },
    {
      id: 'quiz-4',
      question: '介值定理告訴我們什麼？',
      type: 'open',
      answer: '連續函數在區間內必定取到介於端點值之間的任意值。',
    },
  ],
};

export const mockReviewTasks: ReviewTask[] = [
  {
    id: 'task-1',
    title: '複習 微積分 Ch3 筆記',
    dueDate: formatDate(today),
    status: 'pending',
    type: 'review-homework',
    method: 'spaced-review',
  },
  {
    id: 'task-2',
    title: '製作 英文簡報 節錄',
    dueDate: formatDate(today),
    status: 'pending',
    type: 'make-presentation',
    method: 'active-recall',
  },
  {
    id: 'task-3',
    title: '寫報告：統計學 & 經濟學交錯研究',
    dueDate: formatDate(addDays(today, 1)),
    status: 'done',
    type: 'write-report',
    method: 'active-recall',
  },
];

export const mockCoachingMessage: CoachingMessage = {
  id: 'coach-1',
  text: '記住：專注 25 分鐘，休息 5 分鐘，讓大腦保持高效。你做得到！',
  createdAt: new Date().toISOString(),
};

export const mockResearchResults: ResearchResult[] = [
  {
    id: 'res-1',
    title: 'AI 在金融風險管理的應用',
    summary: '整理 AI 如何用於辨識高風險交易、偵測詐騙及自動化報表。',
    sourceUrl: 'https://example.com/finance-ai',
  },
  {
    id: 'res-2',
    title: '生成式 AI 在簡報製作的影響',
    summary: '探討 GPT-4 等模型如何在大學報告中提升整理資料的效率。',
  },
  {
    id: 'res-3',
    title: '高校學生主動學習策略',
    summary: '列出實證研究指出主動提問、交錯學習能顯著提升期末表現。',
    sourceUrl: 'https://example.com/active-learning',
  },
];

export const mockStudyPlanTemplate: StudyPlanItem[] = [
  {
    id: 'plan-1',
    course: '微積分',
    topic: '整理重點與建立題型表',
    dueDate: formatDate(today),
    dayOffset: 0,
  },
  {
    id: 'plan-2',
    course: '微積分',
    topic: 'D+3：第一次複習與題目演練',
    dueDate: formatDate(addDays(today, 3)),
    dayOffset: 3,
  },
  {
    id: 'plan-3',
    course: '微積分',
    topic: 'D+7：錯題整理 & Active Recall',
    dueDate: formatDate(addDays(today, 7)),
    dayOffset: 7,
  },
  {
    id: 'plan-4',
    course: '微積分',
    topic: 'D+14：模擬考與考前衝刺',
    dueDate: formatDate(addDays(today, 14)),
    dayOffset: 14,
  },
];

export const mockWeeklyStats = {
  completed: 5,
  pending: 3,
};
