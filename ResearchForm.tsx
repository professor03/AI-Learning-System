import { useState, useEffect, useRef, type FormEvent } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearchFormValues {
  topic: string;
  course: string;
}

interface ResearchFormProps {
  onSearch: (values: ResearchFormValues) => void;
  isLoading?: boolean;
}

const ResearchForm = ({ onSearch, isLoading }: ResearchFormProps) => {
  const [form, setForm] = useState<ResearchFormValues>({ topic: '', course: 'Finance' });
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const courseRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (courseRef.current && !courseRef.current.contains(event.target as Node)) {
        setIsCourseOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.topic) return;
    onSearch(form);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Research Assistant</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="報告主題"
          placeholder="輸入想研究的主題"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
        <div className="relative" ref={courseRef}>
          <label className="text-sm text-text-normal block mb-2">課程領域</label>
          <button
            type="button"
            onClick={() => setIsCourseOpen(!isCourseOpen)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
          >
            <span className="text-gray-700">{form.course}</span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>
          <AnimatePresence>
            {isCourseOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-20 overflow-hidden"
              >
                {['Finance', 'Computer Science', 'English', 'Psychology'].map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, course });
                      setIsCourseOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${form.course === course ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  >
                    {course}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '查詢中...' : '生成資料蒐集建議'}
        </Button>
      </form>
    </Card>
  );
};

export default ResearchForm;
