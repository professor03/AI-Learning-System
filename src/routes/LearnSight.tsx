import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  endLearnSightSession,
  loginLearnSight,
  startLearnSightSession,
  syncLearnSightVision,
} from '../lib/learnsightApi';
import { useLearnSightConnection, useLearnSightHistory } from '../store/useLearnSightStore';
import LearnSightHistory from '../components/dashboard/LearnSightHistory';

const CONNECTOR_URL_KEY = 'ai-student-learnsight-url';
const DEFAULT_CONNECTOR_URL = import.meta.env.VITE_LEARNSIGHT_API_URL || 'http://localhost:8000';

const formatDateTime = (value: string | null) => {
  if (!value || !Number.isFinite(Date.parse(value))) return '尚無資料';
  return new Intl.DateTimeFormat('zh-TW', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(value));
};

const LearnSight = () => {
  const [baseUrl, setBaseUrl] = useState(() => {
    try { return window.localStorage.getItem(CONNECTOR_URL_KEY) || DEFAULT_CONNECTOR_URL; }
    catch { return DEFAULT_CONNECTOR_URL; }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { accessToken, setAccessToken, session, setSession } = useLearnSightConnection();
  const saveSession = useLearnSightHistory(state => state.save);
  const [goal, setGoal] = useState(session?.study_goal || '完成今天的複習任務');
  const [plannedMinutes, setPlannedMinutes] = useState(session?.planned_minutes || 25);
  const [autoSync, setAutoSync] = useState(true);
  const [message, setMessage] = useState('尚未連線。登入 YOLO 視覺服務後即可開始。');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    try { window.localStorage.setItem(CONNECTOR_URL_KEY, baseUrl.trim() || DEFAULT_CONNECTOR_URL); }
    catch { setMessage('無法保存服務網址，重新整理後需要再次填入。'); }
  }, [baseUrl]);

  const syncVision = useCallback(async (showMessage: boolean) => {
    if (!accessToken || !session || session.status !== 'active') return;
    try {
      const next = await syncLearnSightVision(baseUrl, accessToken, session.session_id);
      setSession(next);
      if (showMessage) setMessage('已同步最新的人數訊號。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '同步失敗');
    }
  }, [accessToken, baseUrl, session]);

  useEffect(() => {
    if (!autoSync || !accessToken || !session || session.status !== 'active') return;
    const timer = window.setInterval(() => { void syncVision(false); }, 20_000);
    return () => window.clearInterval(timer);
  }, [accessToken, autoSync, session, syncVision]);

  const status = useMemo(() => {
    if (!session) return { title: '尚未開始時段', detail: '開始後才會讀取 YOLO 的人數摘要。', style: 'bg-slate-50 text-slate-700' };
    if (session.status === 'ended') return { title: '本次時段已結束', detail: `共接收 ${session.observation_count} 次聚合訊號。`, style: 'bg-slate-100 text-slate-700' };
    if (session.present_now) return { title: '偵測到有人在畫面範圍', detail: '這不是專注度或動作分類。', style: 'bg-emerald-50 text-emerald-800' };
    if (session.away_reminder_eligible) return { title: '可選擇發出離席提醒', detail: '只代表一段時間未出現在畫面內，並不評價學習狀態。', style: 'bg-amber-50 text-amber-800' };
    return { title: '等待下一次視覺同步', detail: '尚未偵測到人員；此訊號不代表分心。', style: 'bg-blue-50 text-blue-800' };
  }, [session]);

  const handleLogin = async () => {
    if (!username.trim() || !password) { setMessage('請輸入 YOLO 視覺服務的帳號與密碼。'); return; }
    setIsBusy(true);
    try {
      const data = await loginLearnSight(baseUrl, username.trim(), password);
      setAccessToken(data.access_token);
      setPassword('');
      setMessage('已連線。登入憑證只保留在這個頁面的記憶體中。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登入失敗');
    } finally { setIsBusy(false); }
  };

  const handleStart = async () => {
    if (!accessToken) { setMessage('請先連線至 YOLO 視覺服務。'); return; }
    if (!goal.trim() || !Number.isInteger(plannedMinutes) || plannedMinutes < 5 || plannedMinutes > 480) {
      setMessage('請輸入學習目標，分鐘數需為 5～480 的整數。'); return;
    }
    setIsBusy(true);
    try {
      const next = await startLearnSightSession(baseUrl, accessToken, goal, plannedMinutes);
      setSession(next);
      setMessage('讀書時段已建立。你可以手動同步，或每 20 秒自動同步一次。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '無法建立讀書時段');
    } finally { setIsBusy(false); }
  };

  const handleEnd = async () => {
    if (!accessToken || !session) return;
    setIsBusy(true);
    try {
      const next = await endLearnSightSession(baseUrl, accessToken, session.session_id);
      setSession(next);
      const saved = saveSession(next);
      setMessage(saved ? '讀書時段已結束並儲存，可到儀表板回顧。' : '時段已結束，但儲存發生問題，請查看下方紀錄提示。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '無法結束讀書時段');
    } finally { setIsBusy(false); }
  };

  const isActive = session?.status === 'active';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">Privacy-first vision connector</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">LearnSight 學習時段</h1>
        <p className="mt-3 max-w-3xl text-gray-600">把讀書目標與 YOLO 的人數摘要放在同一個流程。LearnSight 不保存影像、不做人臉辨識，也不以畫面判斷專注程度。</p>
      </div>

      <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <label className="flex-1 text-sm font-semibold text-gray-700">YOLO 服務網址
            <input value={baseUrl} disabled={Boolean(accessToken)} onChange={(event) => setBaseUrl(event.target.value)} placeholder="http://localhost:8000" className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none ring-primary focus:ring-2" />
          </label>
          <label className="flex-1 text-sm font-semibold text-gray-700">帳號
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none ring-primary focus:ring-2" />
          </label>
          <label className="flex-1 text-sm font-semibold text-gray-700">密碼
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 outline-none ring-primary focus:ring-2" />
          </label>
          <Button onClick={() => void handleLogin()} disabled={isBusy || Boolean(accessToken)}>{accessToken ? '已連線' : '連線'}</Button>
          {accessToken && <Button variant="ghost" disabled={isBusy || session?.status === 'active'} onClick={() => { setAccessToken(null); setSession(null); setMessage('已登出。'); }}>登出</Button>}
        </div>
        <p className="mt-3 text-xs text-gray-500">密碼不會被保存；存取憑證只留在目前頁面的記憶體，重新整理後需再次登入。</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="space-y-4">
          <div><p className="text-sm font-bold text-gray-500">讀書時段</p><h2 className="text-xl font-black text-gray-900">把目標變成可回顧的一次學習</h2></div>
          <label className="block text-sm font-semibold text-gray-700">本次目標
            <input value={goal} onChange={(event) => setGoal(event.target.value)} disabled={isActive} maxLength={240} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 disabled:bg-gray-50" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">預計分鐘數
            <input value={plannedMinutes} onChange={(event) => setPlannedMinutes(Number(event.target.value))} disabled={isActive} min={5} max={480} type="number" className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 disabled:bg-gray-50" />
          </label>
          <div className="flex flex-wrap gap-3">
            {!isActive && <Button onClick={() => void handleStart()} disabled={isBusy || !accessToken}>開始 LearnSight 時段</Button>}
            {isActive && <><Button variant="secondary" onClick={() => void syncVision(true)} disabled={isBusy}>立即同步人數訊號</Button><Button variant="ghost" onClick={() => void handleEnd()} disabled={isBusy}>結束時段</Button></>}
          </div>
        </Card>

        <Card className={`${status.style} border border-white/80`}>
          <p className="text-sm font-bold opacity-70">視覺訊號狀態</p>
          <h2 className="mt-2 text-2xl font-black">{status.title}</h2>
          <p className="mt-3 leading-relaxed">{status.detail}</p>
          {session && <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-white/60 p-3"><p className="opacity-70">同步次數</p><p className="mt-1 text-xl font-black">{session.observation_count}</p></div><div className="rounded-xl bg-white/60 p-3"><p className="opacity-70">最後偵測到有人</p><p className="mt-1 font-bold">{formatDateTime(session.last_present_at)}</p></div></div>}
          <p className="mt-5 text-xs opacity-75">{message}</p>
        </Card>
      </div>

      {isActive && <Card variant="outline" className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-black text-gray-800">每 20 秒自動同步</h3><p className="mt-1 text-sm text-gray-600">從 YOLO 的共用資料摘要讀取人數，不傳送影像。</p></div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={autoSync} onChange={(event) => setAutoSync(event.target.checked)} />啟用</label></Card>}
      <LearnSightHistory />
    </div>
  );
};

export default LearnSight;
