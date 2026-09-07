import { z } from 'zod';

const text = z.string().trim().min(1);
const notesSchema = z.object({
  summary: text,
  sections: z.array(z.object({ id: text, title: text, content: text })).min(1),
  terms: z.array(z.object({ term: text, definition: text })),
});
const questionSchema = z.object({
  type: z.enum(['multiple-choice', 'true-false', 'short-answer', 'fill-in-the-blank']),
  question: text, options: z.array(text).optional(), correctAnswer: text, explanation: text,
}).refine(q => !['multiple-choice', 'true-false'].includes(q.type) ||
  (q.options && q.options.length >= 2 && new Set(q.options).size === q.options.length && q.options.includes(q.correctAnswer)),
  '選擇題的答案必須在不重複的選項內');
export const parseAIJson = (value: string): unknown => {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); }
  catch { throw new Error('AI 回應不是有效的 JSON，請重試。'); }
};
export function parseNotes(value: string) {
  const result = notesSchema.safeParse(parseAIJson(value));
  if (!result.success) throw new Error('AI 筆記缺少摘要、章節或名詞欄位，請重試。');
  return result.data;
}
export function parseQuiz(value: string, count: number) {
  const result = z.array(questionSchema).length(count).safeParse(parseAIJson(value));
  if (!result.success) throw new Error('AI 題目數量、選項或答案不完整，請重新出題。');
  return result.data;
}
