import { expect, test } from 'vitest';
import { calculateNextReview, createEmptyCard } from '../src/lib/fsrs';

test('new card ratings produce later due dates without mutating input', () => {
  const card = createEmptyCard(0);
  const again = calculateNextReview(card, 'Again', 0);
  const good = calculateNextReview(card, 'Good', 0);
  const easy = calculateNextReview(card, 'Easy', 0);
  expect(again.due).toBe(300_000);
  expect(good.due).toBeGreaterThan(again.due);
  expect(easy.due).toBeGreaterThan(good.due);
  expect(card.reps).toBe(0);
});
test('uses current elapsed days, including an epoch-zero last review', () => {
  const first = calculateNextReview(createEmptyCard(0), 'Good', 0);
  const next = calculateNextReview(first, 'Good', 7 * 86400000);
  expect(next.elapsed_days).toBe(7);
  expect(next.stability).toBeGreaterThan(first.stability);
  const stale = calculateNextReview({ ...first, elapsed_days: 1000 }, 'Good', 7 * 86400000);
  expect(stale).toEqual(next);
});
test('forgetting schedules relearning and increments lapses', () => {
  const first = calculateNextReview(createEmptyCard(100), 'Good', 100);
  const next = calculateNextReview(first, 'Again', 86400000);
  expect(next.state).toBe('Relearning');
  expect(next.lapses).toBe(1);
  expect(next.due).toBe(86400000 + 300000);
  expect(Number.isFinite(next.stability)).toBe(true);
});
