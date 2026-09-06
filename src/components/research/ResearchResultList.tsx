import type { ResearchResult } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ResearchResultListProps {
  results: ResearchResult[];
}

const ResearchResultList = ({ results }: ResearchResultListProps) => {
  if (!results.length) {
    return (
      <Card>
        <p className="text-gray-500">尚未有資料，請輸入主題並查詢。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <h3 className="text-lg font-semibold text-text-dark">{result.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{result.summary}</p>
          {result.sourceUrl && (
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => window.open(result.sourceUrl, '_blank')}
              type="button"
            >
              來源連結
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ResearchResultList;
