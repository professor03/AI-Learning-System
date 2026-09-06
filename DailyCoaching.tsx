import { useState } from 'react';
import Card from '../ui/Card';
import PomodoroTimer from './PomodoroTimer';
import type { PomodoroController } from '../../hooks/usePomodoro';
import { QUOTES } from '../../lib/quotes';

interface DailyCoachingProps {
  pomodoro: PomodoroController;
}

const DailyCoaching = ({
  pomodoro,
}: Pick<DailyCoachingProps, 'pomodoro'>) => {
  // Initialize with random quote directly to avoid extra render cycle
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <div className="space-y-4">
      <PomodoroTimer controller={pomodoro} />
      <Card className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">今日鼓勵</p>
        <p className="text-lg font-semibold text-text-dark">"{quote.text}"</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <a
            href={quote.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
          >
            — {quote.author}
          </a>
          <span>更新時間：{new Date().toLocaleDateString('zh-TW')}</span>
        </div>
      </Card>
    </div>
  );
};

export default DailyCoaching;
