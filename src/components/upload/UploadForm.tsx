import { useState, type FormEvent, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPdf } from '../../lib/pdf';
import { generateNotes } from '../../lib/ai';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

const UploadForm = () => {
  const { uploadType, addNote, gainXP } = useAppStore();
  const navigate = useNavigate();
  const [course, setCourse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing && generationProgress < 90) {
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isProcessing, generationProgress]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !course.trim()) {
      alert('請填寫課程並上傳檔案');
      return;
    }
    if (file.size > 20 * 1024 * 1024 || !/\.(pdf|txt)$/i.test(file.name)) {
      alert('請上傳 20 MB 以內的 PDF 或 TXT 教材。'); return;
    }

    try {
      setIsProcessing(true);
      setStatus('正在讀取檔案...');
      setGenerationProgress(0);

      let text = '';
      if (/\.pdf$/i.test(file.name)) {
        text = await extractTextFromPdf(file);
      } else {
        // Fallback for text files or just assuming text for now
        text = await file.text();
      }

      if (!text.trim()) throw new Error('教材中沒有可讀取的文字。');
      setStatus('AI 正在閱讀並整理筆記...');
      const note = await generateNotes(text, course);

      addNote(note);
      gainXP(15); // Reward for uploading notes

      // Add to Vault
      // Add to Vault
      if (file) {
        // Dynamic import to avoid circular dependencies if any, but ensure it's awaited
        const { useVaultStore } = await import('../../store/useVaultStore');

        // Create file object
        const newFile = {
          id: uuidv4(),
          name: file.name,
          type: (file.type === 'application/pdf' ? 'pdf' : 'text') as 'pdf' | 'text',
          size: file.size,
          uploadDate: Date.now(),
          noteId: note.id
        };

        // Add to store immediately
        useVaultStore.getState().addFile(newFile);

        // Force a small delay to ensure state persistence catches up before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGenerationProgress(100);
      setStatus('完成！正在跳轉...');

      // Navigate to the new note
      navigate(`/notes/${note.id}`);

    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || '未知錯誤';
      alert(`發生錯誤：${errorMessage}\n請確認 API Key 是否正確，或 PDF 是否加密。`);
      setStatus('');
      setIsProcessing(false);
      setGenerationProgress(0);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">上傳教材（{uploadType.toUpperCase()}）</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-text-normal">
          教材檔案（PDF／TXT，最多 20 MB）
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt"
            className="rounded-xl border border-gray-300 px-4 py-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={isProcessing}
          />
          {file && <span className="text-xs text-gray-500">已選擇：{file.name}</span>}
        </label>
        <Input
          label="課程名稱"
          placeholder="例如：資料結構"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{status}</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner w-full border border-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 animate-pulse mt-1">
              AI 正在分析內容架構並生成筆記...
            </p>
          </div>
        ) : (
          <Button type="submit" disabled={isProcessing}>
            送出並產生筆記
          </Button>
        )}
      </form>
    </Card>
  );
};

export default UploadForm;
