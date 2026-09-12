import type { LearnSightSession } from './learnsightApi';

export function visionStatus(session: LearnSightSession | null, syncError: string | null, now = Date.now()) {
  const neutral = 'bg-slate-50 text-slate-700';
  if (!session) return { title: '尚未開始時段', detail: '開始後才會讀取 YOLO 的人數摘要。', style: neutral };
  if (session.status === 'ended') return { title: '本次時段已結束', detail: `共接收 ${session.observation_count} 次訊號，已結束後不再同步。`, style: neutral };
  if (syncError) return { title: '人物訊號暫時無法使用', detail: syncError + ' 無法判斷有人或無人。', style: 'bg-amber-50 text-amber-800' };
  // Older services do not provide provenance/freshness. Never present them as verified live signals.
  if (!session.signal_status) return { title: '請更新 YOLO 服務', detail: '目前服務未提供來源與時間資訊，無法確認訊號是否最新。', style: neutral };
  const age = session.last_observed_at ? (now - Date.parse(session.last_observed_at)) / 1000 : Infinity;
  if (session.signal_status === 'stale' || session.signal_status === 'unavailable' ||
      (session.signal_status === 'fresh' && (!Number.isFinite(age) || age > (session.signal_max_age_seconds ?? 30) || age < -5)))
    return { title: '人物訊號已過期或中斷', detail: '請確認偵測仍在執行；舊畫面不代表現在有人，也不算離席。', style: 'bg-amber-50 text-amber-800' };
  if (session.signal_status === 'waiting') return { title: '等待第一次偵測訊號', detail: '尚無觀察值，不代表畫面無人。', style: neutral };
  if (session.signal_origin !== 'detector') return { title: '手動模擬訊號', detail: '這不是 YOLO 的真實偵測結果。', style: neutral };
  if (session.present_now) return { title: '偵測到有人在畫面範圍', detail: '這不是專注度或動作分類。', style: 'bg-emerald-50 text-emerald-800' };
  return { title: '目前畫面未偵測到人物', detail: session.away_reminder_eligible ? '符合可選離席提醒條件，但不評價學習狀態。' : '收到有效的零人訊號；不代表分心。', style: 'bg-blue-50 text-blue-800' };
}

