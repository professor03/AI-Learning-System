import { create } from 'zustand';
import { z } from 'zod';
import type { LearnSightSession } from '../lib/learnsightApi';

const KEY = 'ai-learning-learnsight-history-v1';
const date = z.string().refine(value => Number.isFinite(Date.parse(value)));
const summarySchema = z.object({
  session_id: z.string().min(1), study_goal: z.string().max(240),
  planned_minutes: z.number().int().min(5).max(480),
  started_at: date, ended_at: date, observation_count: z.number().int().nonnegative(),
  detector_source_id: z.string().max(100).nullable().optional(),
  last_observed_at: date.nullable().optional(),
  signal_origin: z.enum(['none', 'manual', 'detector']).optional(),
}).refine(value => Date.parse(value.ended_at) >= Date.parse(value.started_at));
export type SessionSummary = z.infer<typeof summarySchema>;
export const sessionMinutes = (record: SessionSummary) =>
  Math.round((Date.parse(record.ended_at) - Date.parse(record.started_at)) / 60_000 * 10) / 10;

interface HistoryState {
  records: SessionSummary[];
  error: string | null;
  save: (session: LearnSightSession) => boolean;
  clear: () => void;
}

/** Store ended-session aggregates only; never serialize camera data or credentials. */
export function createHistoryStore(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null) {
  let records: SessionSummary[] = [];
  let error: string | null = null;
  try {
    const raw = storage?.getItem(KEY);
    if (raw) records = z.array(summarySchema).parse(JSON.parse(raw)).slice(0, 200);
  } catch { error = '歷史紀錄無法讀取。儲存新時段將覆寫損壞的紀錄。'; }
  return create<HistoryState>((set, get) => ({
    records, error,
    save: session => {
      if (session.status !== 'ended') return false;
      const parsed = summarySchema.safeParse(session);
      if (!parsed.success) { set({ error: '時段資料不完整，尚未儲存。' }); return false; }
      const next = [parsed.data, ...get().records.filter(item => item.session_id !== session.session_id)]
        .sort((a, b) => Date.parse(b.ended_at) - Date.parse(a.ended_at)).slice(0, 200);
      try {
        if (!storage) throw new Error('no storage');
        storage.setItem(KEY, JSON.stringify(next));
        set({ records: next, error: null });
        return true;
      } catch {
        set({ records: next, error: '本機儲存失敗；紀錄暫存於此頁，請先匯出，重新整理可能遺失。' });
        return false;
      }
    },
    clear: () => {
      try { storage?.removeItem(KEY); set({ records: [], error: null }); }
      catch { set({ error: '無法清除本機紀錄。' }); }
    },
  }));
}

const getStorage = () => { try { return window.localStorage; } catch { return null; } };
export const useLearnSightHistory = createHistoryStore(getStorage());

// Route navigation preserves the connection; browser reload clears credentials.
export const useLearnSightConnection = create<{
  accessToken: string | null;
  session: LearnSightSession | null;
  syncError: string | null;
  connectorUrl: string;
  autoSync: boolean;
  isSyncing: boolean;
  setConnectorUrl: (value: string) => void;
  setAutoSync: (value: boolean) => void;
  setIsSyncing: (value: boolean) => void;
  setSyncError: (value: string | null) => void;
  setAccessToken: (value: string | null) => void;
  setSession: (value: LearnSightSession | null) => void;
}>(set => ({
  accessToken: null, session: null,
  syncError: null,
  connectorUrl: '', autoSync: true, isSyncing: false,
  setConnectorUrl: connectorUrl => set({ connectorUrl }),
  setAutoSync: autoSync => set({ autoSync }),
  setIsSyncing: isSyncing => set({ isSyncing }),
  setSyncError: syncError => set({ syncError }),
  setAccessToken: accessToken => set({ accessToken }),
  setSession: session => set(state => {
    // A delayed sync response must not reopen an already-ended session.
    if (session && state.session?.session_id === session.session_id) {
      if (state.session.status === 'ended' && session.status === 'active') return state;
      if (session.status === 'active' && session.observation_count < state.session.observation_count) return state;
    }
    return { session };
  }),
}));

