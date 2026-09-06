import type { Terminology } from '../../types';
import { TERMINOLOGY_ITEM_CLASS, TERMINOLOGY_TITLE } from '../../lib/constants';
import Card from '../ui/Card';

interface TerminologyListProps {
  terms: Terminology[];
}

const headingId = 'terminology-heading';

const TerminologyList = ({ terms }: TerminologyListProps) => (
  <section aria-labelledby={headingId}>
    <Card>
      <header className="mb-4">
        <h2 id={headingId} className="text-xl font-semibold text-text-dark">
          {TERMINOLOGY_TITLE}
        </h2>
      </header>
      <dl className="space-y-3">
        {terms.map((term) => (
          <div key={term.term} className={TERMINOLOGY_ITEM_CLASS}>
            <dt className="text-sm font-semibold text-text-dark">{term.term}</dt>
            <dd className="mt-1 text-sm text-gray-600">{term.definition}</dd>
          </div>
        ))}
      </dl>
    </Card>
  </section>
);

export default TerminologyList;
