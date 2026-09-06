import { SPACED_REVIEW_TIMELINE } from '../../lib/constants';
import Card from '../ui/Card';

const headingId = 'spaced-review-heading';

const ReviewScheduleTimeline = () => (
  <section aria-labelledby={headingId}>
    <Card variant="accent">
      <header className="mb-4">
        <h2 id={headingId} className="text-xl font-semibold text-text-dark">
          間隔複習節奏
        </h2>
      </header>
      <ol className="relative space-y-6">
        <span className="absolute left-4 top-1 bottom-1 w-0.5 bg-gray-200" aria-hidden />
        {SPACED_REVIEW_TIMELINE.map((item) => (
          <li key={item.day} className="flex gap-4">
            <div className="mt-1">
              <span className="block h-3 w-3 rounded-full border-2 border-white bg-primary shadow" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.day}</p>
              <p className="text-base font-semibold text-text-dark">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  </section>
);

export default ReviewScheduleTimeline;
