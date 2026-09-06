import { useState, type FormEvent } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

export interface StudyPlanFormValues {
  course: string;
  examDate: string;
  topics: string;
}

interface StudyPlanFormProps {
  onGenerate: (values: StudyPlanFormValues) => void;
  isLoading?: boolean;
}

const StudyPlanForm = ({ onGenerate, isLoading }: StudyPlanFormProps) => {
  const [form, setForm] = useState<StudyPlanFormValues>({ course: '', examDate: '', topics: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.course || !form.examDate || !form.topics) return;
    onGenerate(form);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Study Outline Maker</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="課程名稱"
          placeholder="例如：微積分"
          value={form.course}
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        />
        <Input
          label="考試日期"
          type="date"
          value={form.examDate}
          onChange={(e) => setForm({ ...form, examDate: e.target.value })}
        />
        <Textarea
          label="想複習的主題"
          placeholder="輸入章節或題型"
          rows={3}
          value={form.topics}
          onChange={(e) => setForm({ ...form, topics: e.target.value })}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '生成中...' : '生成讀書計畫'}
        </Button>
      </form>
    </Card>
  );
};

export default StudyPlanForm;
