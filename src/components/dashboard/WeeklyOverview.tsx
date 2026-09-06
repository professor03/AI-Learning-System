import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

interface WeeklyOverviewProps {
  completed: number;
  pending: number;
}

const WeeklyOverview = ({ completed, pending }: WeeklyOverviewProps) => {
  const total = completed + pending;
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">本週進度</h2>
      <ProgressBar current={completed} total={total} />
      <div className="flex justify-between text-sm text-gray-500 mt-3">
        <div>
          <p className="text-text-dark text-lg font-semibold">{completed}</p>
          <p>已完成</p>
        </div>
        <div>
          <p className="text-text-dark text-lg font-semibold">{pending}</p>
          <p>未完成</p>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyOverview;
