interface QuizProgressBarProps {
  current: number;
  total: number;
}

const getProgressPercent = (current: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

const QuizProgressBar = ({ current, total }: QuizProgressBarProps) => {
  const percent = getProgressPercent(current, total);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>
          題目 {total === 0 ? 0 : current}/{total}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3 w-full rounded-full bg-white/30 backdrop-blur"
      >
        <div
          className="h-3 rounded-full bg-gradient-to-r from-primary via-white/80 to-secondary shadow-glow transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgressBar;

