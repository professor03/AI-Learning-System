import Card from '../ui/Card';
import Button from '../ui/Button';
import { sessionMinutes, useLearnSightHistory } from '../../store/useLearnSightStore';

export default function LearnSightHistory() {
  const { records, error, clear } = useLearnSightHistory();
  const exportHistory = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'learnsight-history.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <Card className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-gray-900">LearnSight 學習紀錄</h2>
        <p className="mt-1 text-sm text-gray-600">已結束 {records.length} 次 · 時段總長 {Math.round(records.reduce((sum, item) => sum + sessionMinutes(item), 0) * 10) / 10} 分鐘</p></div>
      {records.length > 0 && <div className="flex gap-2"><Button onClick={exportHistory}>匯出紀錄</Button>
        <Button variant="ghost" onClick={() => { if (window.confirm('清除此瀏覽器保存的 LearnSight 歷史紀錄？此動作無法復原，建議先匯出。')) clear(); }}>清除紀錄</Button></div>}
    </div>
    <p className="text-xs text-gray-500">僅保存在這個瀏覽器，最多 200 筆。時段長度不是專注時間；人數訊號不代表學習成效。</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!records.length ? <p className="text-gray-600">尚無已結束的學習時段。到 LearnSight 完成一次時段後，紀錄會出現在這裡。</p> :
      <ul className="space-y-3">{records.slice(0, 10).map(record => <li key={record.session_id} className="rounded-xl border border-gray-200 bg-white/70 p-4">
        <p className="font-semibold text-gray-900">{record.study_goal}</p>
        <p className="mt-1 text-sm text-gray-600">{new Date(record.started_at).toLocaleString('zh-TW')} → {new Date(record.ended_at).toLocaleString('zh-TW')}</p>
        <p className="mt-1 text-sm text-gray-600">實際時段 {sessionMinutes(record)} 分鐘／預計 {record.planned_minutes} 分鐘 · 同步 {record.observation_count} 次</p>
      </li>)}</ul>}
    {records.length > 10 && <p className="text-xs text-gray-500">顯示最近 10 筆；匯出包含全部 {records.length} 筆。</p>}
  </Card>;
}
