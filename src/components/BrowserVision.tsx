import { useEffect, useRef, useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useLearnSightConnection } from '../store/useLearnSightStore';
import type { LearnSightSession } from '../lib/learnsightApi';

type Result = { session: LearnSightSession; boxes: { xyxy: number[]; confidence: number }[];
  inference_ms: number; model: string; device: string };

/** Explicitly opt-in frame upload; no stream is opened on mount. */
export default function BrowserVision() {
  const { accessToken, session, setSession } = useLearnSightConnection();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [consent, setConsent] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('先開始讀書時段，再選擇鏡頭或自己的圖片。');
  const [busy, setBusy] = useState(false);

  const cleanup = () => {
    generation.current++;
    if (timer.current) clearTimeout(timer.current);
    controller.current?.abort();
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  };
  useEffect(() => () => {
    const wasSending = Boolean(stream.current || controller.current);
    cleanup();
    const current = useLearnSightConnection.getState();
    if (wasSending && current.accessToken && current.session?.status === 'active') {
      void fetch(`/vision/api/v1/learnsight/sessions/${current.session.session_id}/stop-camera`, {
        method: 'POST', keepalive: true, headers: { Authorization: `Bearer ${current.accessToken}` },
      }).catch(() => {});
    }
  }, []);
  useEffect(() => {
    if (session?.status !== 'active') { cleanup(); setRunning(false); }
  }, [session?.status]);

  const detect = async (source: CanvasImageSource, width: number, height: number) => {
    const current = useLearnSightConnection.getState();
    if (!current.accessToken || current.session?.status !== 'active' || !canvas.current) throw new Error('請先開始讀書時段。');
    const id = generation.current;
    const scale = Math.min(640 / width, 480 / height, 1);
    const output = canvas.current;
    output.width = Math.round(width * scale); output.height = Math.round(height * scale);
    const context = output.getContext('2d');
    if (!context) throw new Error('無法建立影格。');
    context.drawImage(source, 0, 0, output.width, output.height);
    const blob = await new Promise<Blob | null>(resolve => output.toBlob(resolve, 'image/jpeg', .75));
    if (!blob) throw new Error('無法編碼影格。');
    if (id !== generation.current || useLearnSightConnection.getState().session?.status !== 'active') return;
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 20_000);
    let response: Response;
    try {
      response = await fetch(`/vision/api/v1/learnsight/sessions/${current.session.session_id}/frame`, {
        method: 'POST', headers: { Authorization: `Bearer ${current.accessToken}`, 'Content-Type': 'image/jpeg' },
        body: blob, signal: controller.current.signal,
      });
    } finally { clearTimeout(timeout); }
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || '推論失敗。');
    if (id !== generation.current || useLearnSightConnection.getState().session?.status !== 'active') return;
    const data = result as Result;
    setSession(data.session);
    context.strokeStyle = '#22c55e'; context.lineWidth = 3; context.font = '16px sans-serif';
    for (const box of data.boxes) {
      const [x1, y1, x2, y2] = box.xyxy;
      context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      context.fillStyle = '#22c55e'; context.fillText(`person ${(box.confidence * 100).toFixed(0)}%`, x1, Math.max(18, y1));
    }
    setMessage(`真實 ${data.model}／${data.device} 推論：${data.boxes.length} 個人物框，模型耗時 ${data.inference_ms} ms。`);
  };

  const startCamera = async () => {
    setBusy(true);
    const id = ++generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('此瀏覽器不支援鏡頭；請改用 Chrome／Edge 或上傳圖片。');
      const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
      if (id !== generation.current) { acquired.getTracks().forEach(track => track.stop()); return; }
      stream.current = acquired;
      if (!video.current) { cleanup(); return; }
      video.current.srcObject = acquired;
      await video.current.play();
      setRunning(true);
      const loop = async () => {
        if (id !== generation.current || !stream.current || !video.current) return;
        try { await detect(video.current, video.current.videoWidth, video.current.videoHeight); }
        catch (error) { if (id === generation.current) setMessage(error instanceof Error ? error.message : '推論暫時失敗。'); }
        if (id === generation.current) timer.current = setTimeout(() => { void loop(); }, 3000);
      };
      void loop();
    } catch (error) { cleanup(); setMessage(error instanceof Error ? error.message : '鏡頭啟動失敗。'); }
    finally { setBusy(false); }
  };

  const stopCamera = async () => {
    cleanup(); setRunning(false); setMessage('鏡頭已關閉，不再傳送影格。');
    if (accessToken && session?.status === 'active') {
      try {
        const response = await fetch(`/vision/api/v1/learnsight/sessions/${session.session_id}/stop-camera`, {
          method: 'POST', headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) setSession(await response.json());
      } catch { /* Existing freshness timeout still marks unavailable. */ }
    }
  };

  return <Card className="space-y-4 border border-primary-200">
    <h2 className="text-xl font-black">瀏覽器鏡頭 → 雲端 YOLO 真實推論</h2>
    <p className="text-sm text-gray-600">這裡使用你自己的輸入，不播放預製辨識影片。每次推論完成後等待 3 秒再送一張壓縮影格。人物框不等於專注度；多人畫面也不能判定是哪個人在學習。</p>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={consent} disabled={running} onChange={event => setConsent(event.target.checked)} />我同意將鏡頭／選取圖片的影格傳送到此 Demo 擁有者的 GitHub Codespace，僅暫存於記憶體做推論，不儲存、不錄影。請勿讓未同意的人入鏡。</label>
    <div className="flex flex-wrap gap-3">
      <Button disabled={!consent || !accessToken || session?.status !== 'active' || running || busy} onClick={() => void startCamera()}>開啟自己的前置鏡頭</Button>
      <Button variant="ghost" disabled={!running && !busy} onClick={() => void stopCamera()}>停止鏡頭與傳送</Button>
      <label className="text-sm">或選擇自己的圖片（JPEG／PNG，上限 10 MB）<input type="file" accept="image/jpeg,image/png" disabled={!consent || !accessToken || session?.status !== 'active' || running || busy} onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        if (file.size > 10_000_000) { setMessage('圖片超過 10 MB。'); return; }
        setBusy(true);
        try { const image = await createImageBitmap(file); try { await detect(image, image.width, image.height); } finally { image.close(); } }
        catch (error) { setMessage(error instanceof Error ? error.message : '圖片讀取失敗。'); }
        finally { setBusy(false); }
      }} /></label>
    </div>
    <video ref={video} muted playsInline className="hidden" />
    <canvas ref={canvas} aria-label="真實 YOLO 推論影格與人物框" className="max-w-full rounded-xl bg-gray-100" />
    <p role="status" className="text-sm text-primary-800">{message}</p>
    <p className="text-xs text-gray-500">離開這個頁面、結束時段或停止鏡頭會關閉輸入。服務重啟後雲端時段清除；結束摘要保留在你的瀏覽器，可從歷史紀錄匯出。</p>
  </Card>;
}
