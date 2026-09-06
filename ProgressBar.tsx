interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 text-gray-500">
        <span>進度</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;

