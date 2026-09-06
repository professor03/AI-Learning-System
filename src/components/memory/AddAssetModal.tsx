import { useState, useEffect, useRef } from 'react';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

interface AddAssetModalProps {
    stockId: string;
    stockName: string;
    onClose: () => void;
}

interface GeneratedCard {
    id: string;
    term: string;
    definition: string;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export default function AddAssetModal({ stockId, stockName, onClose }: AddAssetModalProps) {
    const { addAtom } = useMemoryStore();
    const { notes } = useAppStore();
    const [term, setTerm] = useState('');
    const [definition, setDefinition] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiMode, setAiMode] = useState(false);

    // AI Batch Generation State
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const difficultyRef = useRef<HTMLDivElement>(null);

    const [cardCount, setCardCount] = useState(3);
    const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);

    // Get source note content
    const sourceNote = notes.find(n => n.id === stockId);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Close difficulty dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (difficultyRef.current && !difficultyRef.current.contains(event.target as Node)) {
                setIsDifficultyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim() && definition.trim()) {
            addAtom({
                term: term.trim(),
                definition: definition.trim(),
                sourceId: stockId,
            });
            onClose();
        }
    };

    const handleBatchSubmit = () => {
        generatedCards.forEach(card => {
            if (card.term.trim() && card.definition.trim()) {
                addAtom({
                    term: card.term.trim(),
                    definition: card.definition.trim(),
                    sourceId: stockId,
                });
            }
        });
        onClose();
    };

    const handleDeleteCard = (id: string) => {
        setGeneratedCards(prev => prev.filter(c => c.id !== id));
    };

    const handleEditCard = (id: string, field: 'term' | 'definition', value: string) => {
        setGeneratedCards(prev =>
            prev.map(c => c.id === id ? { ...c, [field]: value } : c)
        );
    };

    const getDifficultyPrompt = (diff: Difficulty) => {
        switch (diff) {
            case 'easy':
                return '基礎概念、定義簡單、適合初學者';
            case 'medium':
                return '中等難度、需要理解和應用、適合進階學習';
            case 'hard':
                return '深入分析、批判性思考、適合專家級別';
        }
    };

    const getDifficultyLabel = (diff: Difficulty) => {
        switch (diff) {
            case 'easy': return '🟢 基礎 (Easy)';
            case 'medium': return '🟡 進階 (Medium)';
            case 'hard': return '🔴 專家 (Hard)';
        }
    };

    const handleAIBatchGenerate = async () => {
        if (!sourceNote) {
            alert('找不到教材內容，請先上傳教材');
            return;
        }

        setIsGenerating(true);
        setGeneratedCards([]);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                alert('請在專案根目錄的 .env 文件中設置 VITE_GEMINI_API_KEY\n\n範例：\nVITE_GEMINI_API_KEY=your_api_key_here');
                setIsGenerating(false);
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

            // Get content from note (summary + sections)
            const noteContent = `${sourceNote.summary}\n\n${sourceNote.sections.map(s => `${s.title}\n${s.content}`).join('\n\n')}`;
            const difficultyDesc = getDifficultyPrompt(difficulty);

            const prompt = `【批次 #${Math.floor(Math.random() * 10000)}】根據以下教材內容，生成 ${cardCount} 張完全不同的 Anki 學習卡片。

教材：${sourceNote.courseName || '課程筆記'}

內容：
${noteContent}

重要指示:
- 這是第 ${Math.floor(Math.random() * 10000)} 批生成，請確保與之前的批次完全不同
- 每次生成時，請選擇教材中不同的章節和角度
- 優先選擇尚未被提取的知識點
- 難度等級：${difficultyDesc}
- 生成數量：${cardCount} 張
- **每張卡片必須涵蓋完全不同的知識點，從不同章節或不同概念層面提取**
- 確保卡片之間有明顯的主題差異
- 每張卡片包含：
  * term: 關鍵術語、概念或問題（簡潔明確，10-20字）
  * definition: **極度精簡的定義或解釋（嚴格限制在30字以內）**
- definition 撰寫原則：
  * 只保留最核心的概念
  * 去除冗長的例子和解釋
  * 使用最精煉的語言
  * 30字是硬性上限
- 請以 JSON 陣列格式回覆，格式如下：

[
  {
    "term": "章節A的術語1",
    "definition": "精簡定義（≤30字）"
  },
  {
    "term": "章節B的術語2（完全不同主題）",
    "definition": "精簡定義（≤30字）"
  }
]

請直接回覆 JSON 陣列，不要包含其他文字或 markdown 標記（如 \`\`\`）。`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('AI Response:', text); // Debug log

            // 嘗試解析 JSON 陣列
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const cards = JSON.parse(jsonMatch[0]);
                const generatedCards: GeneratedCard[] = cards.map((card: any, index: number) => ({
                    id: `gen-${Date.now()}-${index}`,
                    term: card.term || card.question || '',
                    definition: card.definition || card.answer || ''
                }));

                if (generatedCards.length === 0) {
                    throw new Error('AI 未生成任何卡片');
                }

                setGeneratedCards(generatedCards);
            } else {
                throw new Error('無法解析 AI 回應為 JSON 格式');
            }
        } catch (error: any) {
            console.error('AI 生成失敗:', error);

            // Better error messages
            let errorMsg = 'AI 生成失敗';
            if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
                errorMsg = '請檢查 API 金鑰是否正確設置';
            } else if (error.message?.includes('quota')) {
                errorMsg = 'API 配額已用完，請稍後再試';
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMsg = '網路連接失敗，請檢查網路';
            } else if (error instanceof SyntaxError) {
                errorMsg = 'AI 回應格式錯誤，請重試';
            }

            alert(`${errorMsg}\n\n詳細錯誤：${error.message || error}`);
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4 overflow-hidden pt-20 md:pt-4">
            <div className="bg-[#0a0c10] w-[95%] md:w-full max-w-lg md:max-w-2xl h-[85dvh] md:h-[85vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-light text-slate-100">
                            {aiMode ? 'AI 智能鑄造' : '手動鑄造'}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono mt-1">
                            ASSET: <span className="text-amber-500">{stockName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 shrink-0">
                    <button
                        onClick={() => setAiMode(false)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${!aiMode ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        ✍️ 手動鑄造
                        {!aiMode && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setAiMode(true)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${aiMode ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        🤖 AI 智能鑄造
                        {aiMode && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                        )}
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 custom-scrollbar">
                    {!aiMode ? (
                        <form id="manual-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                    術語 (Term)
                                </label>
                                <input
                                    type="text"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="w-full bg-[#111318] border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="輸入關鍵概念..."
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                    定義 (Definition)
                                </label>
                                <textarea
                                    value={definition}
                                    onChange={(e) => setDefinition(e.target.value)}
                                    className="w-full h-40 bg-[#111318] border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                                    placeholder="輸入解釋或答案..."
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    type="button"
                                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    取消
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white border-none"
                                >
                                    確認鑄造
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* AI Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 relative" ref={difficultyRef}>
                                    <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                        難度等級
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                                        className="w-full bg-[#111318] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-purple-500/50 outline-none flex items-center justify-between"
                                    >
                                        <span>{getDifficultyLabel(difficulty)}</span>
                                        <span className="text-slate-500 text-xs">▼</span>
                                    </button>

                                    <AnimatePresence>
                                        {isDifficultyOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d24] border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden"
                                            >
                                                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                                                    <button
                                                        key={diff}
                                                        type="button"
                                                        onClick={() => {
                                                            setDifficulty(diff);
                                                            setIsDifficultyOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 transition-colors ${difficulty === diff ? 'text-purple-400 bg-slate-800/50' : 'text-slate-300'}`}
                                                    >
                                                        {getDifficultyLabel(diff)}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                        生成數量
                                    </label>
                                    <div className="flex items-center gap-3 bg-[#111318] border border-slate-700 rounded-lg px-3 py-2">
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={cardCount}
                                            onChange={(e) => setCardCount(parseInt(e.target.value))}
                                            className="flex-1 accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-purple-400 w-4 text-center">{cardCount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Source Info */}
                            <div className="p-3 bg-slate-900/50 rounded border border-slate-800/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-slate-500">📚 來源教材：</span>
                                    <span className="text-xs text-slate-300 truncate max-w-[200px]">
                                        {sourceNote?.courseName || '未命名筆記'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-600 truncate">
                                    {sourceNote?.summary?.slice(0, 50)}...
                                </p>
                            </div>

                            {/* Generated Cards Preview */}
                            {generatedCards.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                            預覽 ({generatedCards.length})
                                        </span>
                                        <button
                                            onClick={() => setGeneratedCards([])}
                                            className="text-[10px] text-red-400 hover:text-red-300"
                                        >
                                            清除全部
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {generatedCards.map((card) => (
                                            <div key={card.id} className="bg-[#111318] border border-slate-800 rounded-lg p-3 group relative">
                                                <button
                                                    onClick={() => handleDeleteCard(card.id)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                                >
                                                    ✕
                                                </button>
                                                <div className="space-y-2">
                                                    <input
                                                        value={card.term}
                                                        onChange={(e) => handleEditCard(card.id, 'term', e.target.value)}
                                                        className="w-full bg-transparent text-sm font-medium text-purple-300 border-none p-0 focus:ring-0 placeholder:text-slate-700"
                                                        placeholder="術語"
                                                    />
                                                    <textarea
                                                        value={card.definition}
                                                        onChange={(e) => handleEditCard(card.id, 'definition', e.target.value)}
                                                        className="w-full bg-transparent text-xs text-slate-400 border-none p-0 focus:ring-0 resize-none h-auto placeholder:text-slate-700"
                                                        placeholder="定義"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <div className="flex flex-col gap-3">
                                    {generatedCards.length === 0 ? (
                                        <div className="flex gap-3">
                                            <Button
                                                variant="secondary"
                                                onClick={onClose}
                                                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                            >
                                                取消
                                            </Button>
                                            <Button
                                                onClick={handleAIBatchGenerate}
                                                disabled={isGenerating}
                                                className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white border-none h-12 relative overflow-hidden group"
                                            >
                                                {isGenerating ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>AI 思考中...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span>✨ 開始智能生成</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={handleBatchSubmit}
                                                className="w-full bg-purple-600 hover:bg-purple-500 text-white border-none py-3"
                                            >
                                                確認加入 ({generatedCards.length})
                                            </Button>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="secondary"
                                                    onClick={onClose}
                                                    className="flex-1 border-slate-700 text-slate-300"
                                                >
                                                    取消
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setGeneratedCards([])}
                                                    className="flex-1 border-slate-700 text-slate-300"
                                                >
                                                    重試
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Massive Spacer for mobile scroll - ensure buttons are reachable */}
                    <div className="h-32 w-full shrink-0 md:hidden" />
                </div>
            </div>
        </div>
    );
}
