import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { generateResearch } from '../lib/research';
import { useAppStore } from '../store/useAppStore';
import type { ResearchResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

type SourceType = 'web' | 'note';

const Research = () => {
  const navigate = useNavigate();
  const { addResearch, notes } = useAppStore();

  const [sourceType, setSourceType] = useState<SourceType>('web');
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('General');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Note Selection State
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');

  // Custom dropdown state
  const [isFieldOpen, setIsFieldOpen] = useState(false);
  const [isSelectedNoteOpen, setIsSelectedNoteOpen] = useState(false);

  // Refs for click outside detection
  const fieldRef = useRef<HTMLDivElement>(null);
  const selectedNoteRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldRef.current && !fieldRef.current.contains(event.target as Node)) {
        setIsFieldOpen(false);
      }
      if (selectedNoteRef.current && !selectedNoteRef.current.contains(event.target as Node)) {
        setIsSelectedNoteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    try {
      setIsSearching(true);
      const data = await generateResearch(topic, field);
      setResults(data);
      addResearch(topic, data);
    } catch (error) {
      console.error(error);
      alert('搜尋失敗，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateFromNote = () => {
    const note = notes.find(n => n.id === selectedNoteId);
    if (!note) return;

    // Convert note sections to ResearchResult format
    const noteResults: ResearchResult[] = note.sections.map(section => ({
      id: section.id,
      title: section.title,
      summary: section.content,
      sourceUrl: 'My Notes',
      imagePrompt: `Educational illustration about ${section.title}`
    }));

    // Add summary as the first result
    noteResults.unshift({
      id: 'summary',
      title: 'Overview',
      summary: note.summary,
      sourceUrl: 'My Notes',
      imagePrompt: `Overview of ${note.courseName || 'topic'}`
    });

    navigate('/presentation/studio', {
      state: {
        researchContext: {
          topic: note.courseName || 'My Note Presentation',
          results: noteResults
        }
      }
    });
  };

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

      {/* Source Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button
          className={`pb-2 px-4 font-medium transition-colors ${sourceType === 'web' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setSourceType('web')}
        >
          🌐 網路搜尋
        </button>
        <button
          className={`pb-2 px-4 font-medium transition-colors ${sourceType === 'note' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setSourceType('note')}
        >
          📚 我的筆記
        </button>
      </div>

      {sourceType === 'web' ? (
        <>
          <Card>
            <h2 className="text-xl font-semibold mb-4">AI 報告資料蒐集</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                label="報告主題"
                placeholder="例如：量子運算在金融業的應用"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isSearching}
              />
              <div className="flex flex-col gap-2 relative" ref={fieldRef}>
                <label className="text-sm text-text-normal">領域範疇</label>
                <button
                  type="button"
                  onClick={() => setIsFieldOpen(!isFieldOpen)}
                  disabled={isSearching}
                  className="rounded-xl border border-gray-300 px-4 py-2 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  <span className="text-gray-700">
                    {field === 'General' ? '一般' :
                      field === 'Computer Science' ? '資訊工程' :
                        field === 'Economics' ? '經濟學' :
                          field === 'History' ? '歷史' :
                            field === 'Medicine' ? '醫學' : '法律'}
                  </span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>
                <AnimatePresence>
                  {isFieldOpen && !isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      {[
                        { value: 'General', label: '一般' },
                        { value: 'Computer Science', label: '資訊工程' },
                        { value: 'Economics', label: '經濟學' },
                        { value: 'History', label: '歷史' },
                        { value: 'Medicine', label: '醫學' },
                        { value: 'Law', label: '法律' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setField(option.value);
                            setIsFieldOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${field === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'AI 正在搜尋與整理資料...' : '開始蒐集資料'}
              </Button>
            </form>
          </Card>

          {results.length > 0 && (
            <div className="grid gap-4">
              <div className="flex justify-end">
                <Button onClick={() => navigate('/presentation/studio', { state: { researchContext: { topic, results } } })}>
                  📽️ 生成簡報模式
                </Button>
              </div>
              {results.map((result) => (
                <Card key={result.id}>
                  <h3 className="text-lg font-bold mb-2">{result.title}</h3>
                  <p className="text-text-normal mb-3">{result.summary}</p>
                  {result.sourceUrl && (
                    <a
                      href={result.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary-500 hover:underline"
                    >
                      來源連結
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          <h2 className="text-xl font-semibold mb-4">從筆記匯入</h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-2 relative" ref={selectedNoteRef}>
              <label className="text-sm text-text-normal">選擇筆記來源</label>
              {notes.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSelectedNoteOpen(!isSelectedNoteOpen)}
                    className="rounded-xl border border-gray-300 px-4 py-2 bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                  >
                    <span className="text-gray-700">
                      {selectedNoteId ? (notes.find(n => n.id === selectedNoteId)?.courseName || '未命名筆記') : '-- 請選擇筆記 --'}
                    </span>
                    <span className="text-gray-400 text-xs">▼</span>
                  </button>
                  <AnimatePresence>
                    {isSelectedNoteOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNoteId('');
                            setIsSelectedNoteOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${!selectedNoteId ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500'}`}
                        >
                          -- 請選擇筆記 --
                        </button>
                        {notes.map(note => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => {
                              setSelectedNoteId(note.id);
                              setIsSelectedNoteOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedNoteId === note.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                          >
                            {note.courseName || '未命名筆記'} ({new Date().toLocaleDateString()})
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  尚未有任何筆記。請先到「上傳教材」區新增筆記。
                </div>
              )}
            </div>

            {selectedNoteId && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">預覽內容</h3>
                <p className="text-sm text-blue-600">
                  將匯入
                  <span className="font-bold"> {notes.find(n => n.id === selectedNoteId)?.sections.length} </span>
                  個章節作為簡報素材。
                </p>
              </div>
            )}

            <Button
              onClick={handleCreateFromNote}
              disabled={!selectedNoteId}
              className="w-full justify-center"
            >
              📽️ 使用此筆記生成簡報
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Research;
