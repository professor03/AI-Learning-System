import { NOTES_SUMMARY_TITLE } from '../../lib/constants';
import Card from '../ui/Card';

interface NotesSummaryProps {
  summary: string;
}

const headingId = 'notes-summary-heading';

const NotesSummary = ({ summary }: NotesSummaryProps) => (
  <section aria-labelledby={headingId}>
    <Card>
      <header className="mb-4">
        <h2 id={headingId} className="text-xl font-semibold text-text-dark">
          {NOTES_SUMMARY_TITLE}
        </h2>
      </header>
      <p className="text-base leading-relaxed text-gray-600">{summary}</p>
    </Card>
  </section>
);

export default NotesSummary;
