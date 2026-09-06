import type { ReviewTask } from '../../types';
import { REVIEW_STATUS_META, REVIEW_TYPE_META } from '../../lib/constants';
import { formatDate } from '../../lib/format';
import Card from '../ui/Card';
import Chip from '../ui/Chip';

interface TodayReviewListProps {
  tasks: ReviewTask[];
}

const headingId = 'today-review-heading';

const TodayReviewList = ({ tasks }: TodayReviewListProps) => (
  <section aria-labelledby={headingId}>
    <Card>
      <header className="mb-4 flex items-center justify-between">
        <h2 id={headingId} className="text-xl font-semibold text-text-dark">
          今日複習清單
        </h2>
        <span className="text-sm text-gray-500">{tasks.length} 項</span>
      </header>

      <div className="space-y-3">
        {tasks.map((task) => {
          const reviewTone = REVIEW_TYPE_META[task.type];
          const statusMeta = REVIEW_STATUS_META[task.status];
          return (
            <article key={task.id} className="rounded-2xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-text-dark">{task.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewTone.colorClass}`}>
                      {reviewTone.label}
                    </span>
                    {task.method && (
                      <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-slate-700">
                        {task.method === 'spaced-review' ? 'Spaced Review' : 'Active Recall'}
                      </span>
                    )}
                  </div>
                </div>
                <Chip label={statusMeta.label} tone={statusMeta.tone} />
              </div>
              <p className="mt-3 text-sm text-gray-500">到期：{formatDate(task.dueDate)}</p>
            </article>
          );
        })}
      </div>
    </Card>
  </section>
);

export default TodayReviewList;
