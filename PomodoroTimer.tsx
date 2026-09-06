import clsx from 'clsx';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { PomodoroController } from '../../hooks/usePomodoro';
import { SESSION_DURATIONS, type PomodoroSessionType } from '../../store/useTimerStore';

interface PomodoroTimerProps {
  controller: PomodoroController;
}

const SESSION_LABELS: Record<PomodoroSessionType, { title: string; subtitle: string }> = {
  focus: { title: '專注時間', subtitle: '25 分鐘深度學習' },
  'short-break': { title: '休息一下', subtitle: '喝水、伸展 5 分鐘' },
  'long-break': { title: '長時間充電', subtitle: '完成 4 顆番茄，休息 15 分鐘' },
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const PomodoroTimer = ({ controller }: PomodoroTimerProps) => {
  const { sessionType, secondsLeft, isRunning, completedToday } = controller;
  const progress = 1 - secondsLeft / SESSION_DURATIONS[sessionType];

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">番茄鐘</p>
        <h3 className="text-xl font-semibold text-text-dark">{SESSION_LABELS[sessionType].title}</h3>
        <p className="text-sm text-gray-500">{SESSION_LABELS[sessionType].subtitle}</p>
      </div>

      <div className="flex items-center gap-6">
        <div
          className="relative h-32 w-32 rounded-full bg-white/40 p-1 shadow-glow"
          style={{
            background: `conic-gradient(#fdd079 ${progress * 360}deg, rgba(255,255,255,0.35) ${progress * 360
              }deg)`,
          }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white/70 text-3xl font-semibold">
            {formatTime(secondsLeft)}
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">今日已完成 {completedToday} 顆番茄</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={isRunning ? controller.pause : controller.start}>
              {isRunning ? '暫停' : '開始'}
            </Button>
            <Button variant="ghost" onClick={controller.resetSession}>
              重設
            </Button>
            {sessionType !== 'focus' && (
              <Button variant="ghost" onClick={controller.skipBreak}>
                跳過休息
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <span
            key={idx}
            className={clsx(
              'h-3 w-3 rounded-full border border-white/60',
              completedToday % 4 > idx ? 'bg-primary' : 'bg-transparent',
            )}
          />
        ))}
        <p className="text-xs text-gray-500">滿 4 顆後享受 15 分鐘長休息</p>
      </div>
    </Card>
  );
};

export default PomodoroTimer;
