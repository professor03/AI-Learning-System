import type { StudyPlanItem } from '../../types';
import Card from '../ui/Card';

interface StudyPlanOverviewProps {
  plan: StudyPlanItem[];
}

const offsetLabel = (offset: number) => {
  switch (offset) {
    case 0:
      return 'D+0｜今天';
    case 3:
      return 'D+3｜第一次複習';
    case 7:
      return 'D+7｜第二次複習';
    case 14:
      return 'D+14｜考前衝刺';
    default:
      return `D+${offset}`;
  }
};

const StudyPlanOverview = ({ plan }: StudyPlanOverviewProps) => {
  const grouped = plan.reduce<Record<number, StudyPlanItem[]>>((acc, item) => {
    if (!acc[item.dayOffset]) acc[item.dayOffset] = [];
    acc[item.dayOffset].push(item);
    return acc;
  }, {});

  const sortedOffsets = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (!plan.length) {
    return (
      <Card>
        <p className="text-gray-500">生成計畫後將顯示建議複習節奏。</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">複習節奏</h2>
      <div className="space-y-5">
        {sortedOffsets.map((offset) => (
          <div key={offset} className="border border-gray-100 rounded-2xl p-4">
            <p className="text-sm text-gray-500 mb-2">{offsetLabel(offset)}</p>
            <ul className="space-y-2">
              {grouped[offset].map((item) => (
                <li key={item.id} className="text-text-dark">
                  <p className="font-semibold">{item.topic}</p>
                  <p className="text-sm text-gray-500">建議日期：{item.dueDate}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudyPlanOverview;
