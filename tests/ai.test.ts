import { afterEach, expect, test, vi } from 'vitest';
import { parseNotes, parseQuiz } from '../src/lib/aiValidation';
import { generateQuiz, generateNotes } from '../src/lib/ai';
import { model } from '../src/lib/aiClient';

afterEach(() => vi.unstubAllGlobals());
const question = { question: 'Queue?', type: 'multiple-choice', options: ['FIFO', 'LIFO'], correctAnswer: 'FIFO', explanation: 'First in, first out.' };
test('accepts fenced notes JSON but rejects missing sections', () => {
  expect(parseNotes('```json\n' + JSON.stringify({ summary: 'Summary', sections: [{ id: '1', title: 'Title', content: 'Content' }], terms: [] }) + '\n```').summary).toBe('Summary');
  expect(() => parseNotes('{"summary":"test"}')).toThrow();
});
test('rejects wrong answer, duplicate options, and wrong question count', () => {
  expect(parseQuiz(JSON.stringify([question]), 1)).toHaveLength(1);
  expect(() => parseQuiz(JSON.stringify([{ ...question, correctAnswer: 'invented' }]), 1)).toThrow();
  expect(() => parseQuiz(JSON.stringify([{ ...question, options: ['FIFO', 'FIFO'] }]), 1)).toThrow();
  expect(() => parseQuiz(JSON.stringify([question]), 3)).toThrow();
});
test('quiz generation passes through same-origin proxy and resets result state', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: JSON.stringify([{ ...question, isCorrect: true }]) })));
  vi.stubGlobal('fetch', fetch);
  const result = await generateQuiz('Queue uses FIFO', { count: 1, type: 'multiple-choice', allowExternal: false });
  expect(fetch.mock.calls[0][0]).toBe('/api/ai/generate');
  expect(result[0].isCorrect).toBeUndefined();
  expect(result[0].id).toBeTruthy();
});
test('empty materials never call the API', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  await expect(generateNotes('', 'Course')).rejects.toThrow();
  await expect(generateQuiz('')).rejects.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});
test('proxy errors reach the caller, empty responses are rejected', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"error":"尚未設定金鑰"}', { status: 503 })));
  await expect(model.generateContent('Hi')).rejects.toThrow('尚未設定金鑰');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"text":""}')));
  await expect(model.generateContent('Hi')).rejects.toThrow('有效內容');
});
