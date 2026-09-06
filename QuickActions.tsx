import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">快速操作</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Button onClick={() => navigate('/upload')}>上傳教材</Button>
        <Button variant="secondary" onClick={() => navigate('/study-plan')}>
          生成讀書計畫
        </Button>
        <Button variant="ghost" onClick={() => navigate('/research')}>
          報告資料蒐集
        </Button>
      </div>
    </Card>
  );
};

export default QuickActions;
