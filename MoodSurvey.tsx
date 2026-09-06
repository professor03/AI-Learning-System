import Card from '../ui/Card';
import type { MoodState } from '../../types';

interface MoodSurveyProps {
  value: MoodState;
  onChange: (next: MoodState) => void;
}

const MoodSurvey = ({ value, onChange }: MoodSurveyProps) => {
  const handleChange = (key: keyof MoodState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    onChange({ ...value, [key]: next });
  };

  const describeLevel = (level: number) => {
    switch (level) {
      case 5:
        return '狀態極佳';
      case 4:
        return '感覺不錯';
      case 3:
        return '中等';
      case 2:
        return '有點疲累';
      case 1:
      default:
        return '需要休息';
    }
  };

  return (
    <Card variant="outline" className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">今日狀態</p>
        <h3 className="text-xl font-semibold text-text-dark">心情與專注</h3>
        <p className="text-sm text-gray-500">
          AI 會根據你的狀態調整學習計畫與任務密度。
        </p>
      </div>
      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark" htmlFor="mood-range">
          心情：{describeLevel(value.mood)}
          <input
            id="mood-range"
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.mood}
            onChange={handleChange('mood')}
            className="accent-primary"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-text-dark" htmlFor="focus-range">
          專注程度：{describeLevel(value.focus)}
          <input
            id="focus-range"
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.focus}
            onChange={handleChange('focus')}
            className="accent-secondary"
          />
        </label>
      </div>
    </Card>
  );
};

export default MoodSurvey;
