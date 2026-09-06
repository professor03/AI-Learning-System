import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import UploadForm from '../components/upload/UploadForm';
import UploadTypeSelector from '../components/upload/UploadTypeSelector';

const Upload = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <Button variant="ghost" onClick={() => navigate(1)}>
          前進 →
        </Button>
      </div>
      <UploadTypeSelector />
      <UploadForm />
    </div>
  );
};

export default Upload;

