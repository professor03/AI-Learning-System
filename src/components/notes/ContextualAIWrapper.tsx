import { useState, useRef, useEffect } from 'react';
import ContextualAIToolbar from './ContextualAIToolbar';
import { explainText, generateCardsFromText, generateQuestionFromText } from '../../lib/ai';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';

interface ContextualAIWrapperProps {
  children: React.ReactNode;
  noteId: string;
}

export default function ContextualAIWrapper({ children, noteId }: ContextualAIWrapperProps) {
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inline AI Result State
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    type: 'explanation' | 'cards' | 'question';
    content: any;
    position: { x: number; y: number };
  } | null>(null);

  const { addAtom } = useMemoryStore();
  const { notes } = useAppStore();
  
  const currentNote = notes.find(n => n.id === noteId);
  const fullContext = currentNote 
    ? `${currentNote.summary}\n${currentNote.sections?.map(s => s.content).join('\n')}`
    : '';

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setToolbarPosition({
        x: rect.left, // 左上角
        y: Math.max(rect.top, 80), // 確保不會超出螢幕上方 (預留導覽列空間)
      });
    }
  };

  const closeToolbar = () => {
    setToolbarPosition(null);
    setSelectedText('');
  };

  const handleExplain = async (text: string) => {
    if (!toolbarPosition) return;
    const pos = { ...toolbarPosition };
    setToolbarPosition(null);
    setIsProcessing(true);
    setAiResult({ type: 'explanation', content: '思考中...', position: pos });
    
    try {
      const explanation = await explainText(text, fullContext);
      setAiResult({ type: 'explanation', content: explanation, position: pos });
    } catch (e) {
      setAiResult({ type: 'explanation', content: '抱歉，生成解釋時發生錯誤。', position: pos });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCards = async (text: string) => {
    if (!toolbarPosition) return;
    const pos = { ...toolbarPosition };
    setToolbarPosition(null);
    setIsProcessing(true);
    setAiResult({ type: 'cards', content: null, position: pos });

    try {
      const cards = await generateCardsFromText(text, fullContext);
      setAiResult({ type: 'cards', content: cards, position: pos });
    } catch (e) {
      setAiResult({ type: 'cards', content: '抱歉，生成閃卡時發生錯誤。', position: pos });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuestion = async (text: string) => {
    if (!toolbarPosition) return;
    const pos = { ...toolbarPosition };
    setToolbarPosition(null);
    setIsProcessing(true);
    setAiResult({ type: 'question', content: null, position: pos });

    try {
      const q = await generateQuestionFromText(text);
      setAiResult({ type: 'question', content: q, position: pos });
    } catch (e) {
      setAiResult({ type: 'question', content: '抱歉，生成測驗時發生錯誤。', position: pos });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCards = (cards: any[]) => {
    cards.forEach(c => {
      addAtom({
        term: c.term,
        definition: c.definition,
        sourceId: noteId
      });
    });
    setAiResult(null);
    alert(`成功存入 ${cards.length} 張知識卡片！`);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
         if (window.getSelection()?.isCollapsed) {
           closeToolbar();
         }
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef} onMouseUp={handleSelection} onTouchEnd={handleSelection}>
      {children}

      <ContextualAIToolbar
        selectedText={selectedText}
        position={toolbarPosition}
        onExplain={handleExplain}
        onGenerateCards={handleGenerateCards}
        onGenerateQuestion={handleGenerateQuestion}
        onClose={closeToolbar}
      />

      {aiResult && (
        <div 
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-6 w-full max-w-sm"
          style={{
            left: `${Math.min(Math.max(aiResult.position.x, 20), window.innerWidth - 340)}px`,
            top: `${Math.min(Math.max(aiResult.position.y + 30, 20), window.innerHeight - 300)}px`,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              {aiResult.type === 'explanation' && '💡 AI 深度解析'}
              {aiResult.type === 'cards' && '📇 智能閃卡提取'}
              {aiResult.type === 'question' && '🎯 隨堂挑戰'}
            </h4>
            <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-6 text-blue-500">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium animate-pulse">大腦運轉中...</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {aiResult.type === 'explanation' && (
                <div className="text-gray-700 leading-relaxed text-sm">
                  {aiResult.content}
                </div>
              )}
              
              {aiResult.type === 'cards' && Array.isArray(aiResult.content) && (
                <div className="space-y-3">
                  {aiResult.content.map((c: any, i: number) => (
                    <div key={i} className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                      <div className="font-bold text-orange-900 text-sm mb-1">{c.term}</div>
                      <div className="text-orange-800 text-xs">{c.definition}</div>
                    </div>
                  ))}
                  <Button onClick={() => saveCards(aiResult.content)} className="w-full mt-2">
                    全部存入記憶庫
                  </Button>
                </div>
              )}

              {aiResult.type === 'question' && aiResult.content && typeof aiResult.content !== 'string' && (
                <div className="space-y-3">
                  <p className="font-medium text-gray-800 text-sm">{aiResult.content.question}</p>
                  <div className="space-y-2">
                    {aiResult.content.options?.map((opt: string, i: number) => (
                      <button 
                        key={i} 
                        className="w-full text-left p-2 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 text-sm transition-colors"
                        onClick={(e) => {
                          const isCorrect = opt === aiResult.content.correctAnswer;
                          e.currentTarget.className = `w-full text-left p-2 rounded-lg border text-sm ${isCorrect ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`;
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {typeof aiResult.content === 'string' && aiResult.type !== 'explanation' && (
                 <div className="text-red-500 text-sm">{aiResult.content}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
