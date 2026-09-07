import type { MaterialType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import Card from '../ui/Card';

const types: { label: string; value: MaterialType }[] = [
  { label: 'PDF', value: 'pdf' },
];

const UploadTypeSelector = () => {
  const { uploadType, setUploadType } = useAppStore();

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">選擇教材類型</h2>
      <p className="mb-3 text-sm text-gray-600">目前可讀取文字型 PDF 與 TXT。圖片、錄音與簡報請先轉成文字或 PDF。</p>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => (
          <label
            key={type.value}
            className={`border rounded-2xl px-4 py-3 cursor-pointer transition ${
              uploadType === type.value ? 'border-secondary bg-secondary/10' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="material-type"
              className="sr-only"
              checked={uploadType === type.value}
              onChange={() => setUploadType(type.value)}
            />
            <span className="font-semibold">{type.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
};

export default UploadTypeSelector;
