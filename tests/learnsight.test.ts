import { afterEach, expect, test, vi } from 'vitest';
import { createHistoryStore, sessionMinutes, useLearnSightConnection } from '../src/store/useLearnSightStore';
import { loginLearnSight, startLearnSightSession, syncLearnSightVision, endLearnSightSession, type LearnSightSession } from '../src/lib/learnsightApi';

const session: LearnSightSession = {
  session_id: 's1', study_goal: '複習佇列', planned_minutes: 25, source_id: 'test',
  started_at: '2026-09-07T10:00:00Z', ended_at: '2026-09-07T10:25:00Z', status: 'ended',
  present_now: true, last_present_at: null, absence_started_at: null, away_reminder_eligible: false,
  observation_count: 4, note: 'Do not store arbitrary metadata',
};
const memoryStorage = () => {
  const map = new Map<string, string>();
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); }, removeItem: (key: string) => { map.delete(key); } };
};
afterEach(() => vi.unstubAllGlobals());
test('late sync cannot reopen an ended session', () => {
  useLearnSightConnection.getState().setSession(null);
  useLearnSightConnection.getState().setSession(session);
  useLearnSightConnection.getState().setSession({ ...session, status: 'active', ended_at: null });
  expect(useLearnSightConnection.getState().session?.status).toBe('ended');
});
test('ended history reloads, deduplicates, and strips non-summary fields', () => {
  const storage = memoryStorage(); const store = createHistoryStore(storage);
  expect(store.getState().save(session)).toBe(true);
  store.getState().save({ ...session, observation_count: 5 });
  const reloaded = createHistoryStore(storage).getState().records;
  expect(reloaded).toHaveLength(1);
  expect(reloaded[0].observation_count).toBe(5);
  expect(reloaded[0]).not.toHaveProperty('note');
  expect(reloaded[0]).not.toHaveProperty('present_now');
  expect(sessionMinutes(reloaded[0])).toBe(25);
});
test('active and invalid ended sessions cannot become completed records', () => {
  const store = createHistoryStore(memoryStorage());
  expect(store.getState().save({ ...session, status: 'active', ended_at: null })).toBe(false);
  expect(store.getState().save({ ...session, ended_at: '2020-01-01' })).toBe(false);
  expect(store.getState().records).toHaveLength(0);
});
test('unavailable storage retains exportable in-memory history and reports failure', () => {
  const store = createHistoryStore(null);
  expect(store.getState().save(session)).toBe(false);
  expect(store.getState().records).toHaveLength(1);
  expect(store.getState().error).toContain('儲存失敗');
});
test('corrupted persisted data produces a warning instead of a crash', () => {
  const store = createHistoryStore({ ...memoryStorage(), getItem: () => '{broken' });
  expect(store.getState().records).toEqual([]);
  expect(store.getState().error).toBeTruthy();
});
test('clear removes persisted history', () => {
  const storage = memoryStorage(); const store = createHistoryStore(storage);
  store.getState().save(session); store.getState().clear();
  expect(createHistoryStore(storage).getState().records).toEqual([]);
});
test('connector sends correct routes and auth and returns errors', async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify(session)));
  vi.stubGlobal('fetch', fetch);
  await loginLearnSight('http://localhost:8000/', 'test', 'password');
  await startLearnSightSession('http://localhost:8000', 'token', 'Goal', 25);
  await syncLearnSightVision('http://localhost:8000', 'token', 's1');
  await endLearnSightSession('http://localhost:8000', 'token', 's1');
  expect(fetch.mock.calls.map(call => call[0])).toEqual([
    'http://localhost:8000/auth/login', 'http://localhost:8000/api/v1/learnsight/sessions',
    'http://localhost:8000/api/v1/learnsight/sessions/s1/sync', 'http://localhost:8000/api/v1/learnsight/sessions/s1/end',
  ]);
  expect(fetch.mock.calls[3][1].headers.Authorization).toBe('Bearer token');
  fetch.mockResolvedValueOnce(new Response('{"detail":"expired"}', { status: 401 }));
  await expect(endLearnSightSession('http://localhost:8000', 'bad', 's1')).rejects.toThrow('expired');
});
