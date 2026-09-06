import type { ReviewTask } from '../../types';
import Card from '../ui/Card';

interface TaskQuadrantProps {
  tasks: ReviewTask[];
}

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const X_SAFE_MIN = 14;
const X_SAFE_MAX = 86;
const Y_SAFE_MIN = 16;
const Y_SAFE_MAX = 84;
const LABEL_HALF_WIDTH = 40;
const LABEL_HALF_HEIGHT = 14;

const TaskQuadrant = ({ tasks }: TaskQuadrantProps) => {
  const plotted = tasks.filter((task) => task.vector);

  return (
    <Card variant="outline" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">任務定位</p>
          <h3 className="text-lg font-semibold text-text-dark">今日任務十字圖</h3>
        </div>
        <p className="text-xs text-gray-500">X：重要程度　Y：緊急程度</p>
      </div>

      <div className="relative h-64 w-full rounded-3xl bg-gradient-to-br from-white/90 to-white/60 p-6">
        <div className="absolute left-1/2 top-10 bottom-10 w-[2px] bg-gradient-to-b from-secondary/20 via-secondary/60 to-secondary/20" />
        <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gradient-to-r from-secondary/20 via-secondary/60 to-secondary/20" />

        <span className="absolute left-1/2 top-4 -translate-x-1/2 text-xs font-semibold text-secondary">
          高緊急（Y）
        </span>
        <span className="absolute left-1/2 bottom-4 -translate-x-1/2 text-xs text-gray-500">
          低緊急
        </span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary">
          高重要（X）
        </span>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">低重要</span>

        {plotted.length === 0 && (
          <p className="mt-20 text-center text-sm text-gray-500">新增任務後即可看到定位結果。</p>
        )}

        {plotted.map((task) => {
          const focusPercent = clampValue(task.vector?.focus ?? 50, X_SAFE_MIN, X_SAFE_MAX);
          const urgencyPercent = clampValue(task.vector?.urgency ?? 50, Y_SAFE_MIN, Y_SAFE_MAX);
          const left = `calc(${focusPercent}% - ${LABEL_HALF_WIDTH}px)`;
          const top = `calc(${100 - urgencyPercent}% - ${LABEL_HALF_HEIGHT}px)`;
          const rawTitle = task.title.split('（')[0];
          const label = rawTitle.length > 12 ? `${rawTitle.slice(0, 12)}…` : rawTitle;
          return (
            <div
              key={task.id}
              className="absolute"
              style={{ left, top }}
            >
              <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-primary/80 to-secondary/70 px-3 py-1 text-xs font-semibold text-midnight shadow-soft">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TaskQuadrant;
