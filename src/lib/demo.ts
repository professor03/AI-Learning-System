import type { LectureNotes, QuizQuestion } from '../types';

export const DEMO_NOTE_ID = 'demo-data-structures-v1';
export const demoNote: LectureNotes = {
  id: DEMO_NOTE_ID, materialId: 'offline-demo', courseName: '離線示範：堆疊與佇列',
  summary: '這是預先編寫的示範教材，沒有呼叫 AI。堆疊使用後進先出（LIFO），佇列使用先進先出（FIFO）。可用來體驗筆記、測驗與間隔複習。',
  sections: [
    { id: 'stack', title: '堆疊 Stack', content: '堆疊遵守 LIFO。瀏覽器返回與函式呼叫堆疊是常見例子。push 加入頂端，pop 移除頂端。' },
    { id: 'queue', title: '佇列 Queue', content: '佇列遵守 FIFO。排隊服務與列印工作是常見例子。enqueue 加到尾端，dequeue 從前端取出。' },
  ],
  terms: [
    { term: '堆疊（示範）', definition: '後進先出，最後加入的元素先被取出。' },
    { term: '佇列（示範）', definition: '先進先出，最早加入的元素先被取出。' },
    { term: 'push（示範）', definition: '把新元素放到堆疊頂端。' },
    { term: 'dequeue（示範）', definition: '從佇列前端移除最早加入的元素。' },
  ],
};
export const demoQuiz: QuizQuestion[] = [
  { id: 'demo-q1', type: 'multiple-choice', question: '佇列遵守哪個原則？', options: ['先進先出 FIFO', '後進先出 LIFO'], correctAnswer: '先進先出 FIFO', explanation: '佇列先取出最早加入的元素。' },
  { id: 'demo-q2', type: 'multiple-choice', question: '要回到最近一次瀏覽的頁面，哪種結構較合適？', options: ['堆疊', '佇列'], correctAnswer: '堆疊', explanation: '最近加入的頁面要先被取出，符合 LIFO。' },
  { id: 'demo-q3', type: 'multiple-choice', question: '依序 push A、B、C 後 pop 一次，取出什麼？', options: ['A', 'B', 'C'], correctAnswer: 'C', explanation: 'C 最後進入堆疊，因此先被取出。' },
];
