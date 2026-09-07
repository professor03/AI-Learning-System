import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMemoryStore } from '../../store/useMemoryStore';
import Button from '../ui/Button';
import { model } from '../../lib/aiClient';
import { getStockStats } from '../../lib/stockUtils';
import { globalSearchEngine } from '../../lib/searchEngine';


interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

// Suggested questions for users
const SUGGESTED_QUESTIONS = [
    '我的寵物現在狀態如何？',
    'Knowledge Galaxy 是什麼？',
    '我上傳了哪些筆記？',
    '幫我複習一下投資學',
];

const ChatSidebar = ({ isOpen, onToggle }: ChatSidebarProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', text: '嗨！我是你的 AI 學習助理 🤖\n\n我知道：\n✨ 所有系統功能（Knowledge Galaxy、簡報生成等）\n🐾 你的寵物狀態（等級、健康、飢餓度）\n📚 你的筆記、計畫與研究資料\n\n試試下面的問題，或直接問我任何事！' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { notes, studyPlan, researchResults, petLevel, petHealth, petHunger, petXP, selectedPet, openReviewModal, activeNoteId, currentLocation } = useAppStore();
    const { atoms, stocks } = useMemoryStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        globalSearchEngine.clear();
        notes.forEach(note => {
            globalSearchEngine.addDocument({
                id: `${note.id}-summary`,
                text: `[${note.courseName || '未命名'}] 摘要: ${note.summary}`
            });
            if (note.sections) {
                note.sections.forEach((section, idx) => {
                    globalSearchEngine.addDocument({
                        id: `${note.id}-sec-${idx}`,
                        text: `[${note.courseName || '未命名'}] 章節 - ${section.title}: ${section.content}`
                    });
                });
            }
            if (note.terms) {
                note.terms.forEach((term, idx) => {
                    globalSearchEngine.addDocument({
                        id: `${note.id}-term-${idx}`,
                        text: `[${note.courseName || '未命名'}] 名詞解釋 - ${term.term}: ${term.definition}`
                    });
                });
            }
        });
    }, [notes]);


    // ... (imports remain same)

    const buildContext = (queryText: string) => {
        let context = '';

        // Calculate Financial Stats
        const stockList = Object.values(stocks);
        const stockStats = getStockStats(stockList);
        const atomValue = atoms.reduce((acc, atom) => acc + (atom.mastery * 1000) + 100, 0);
        const netWorth = atomValue + stockStats.totalValue;

        // === NEW: Global Location Awareness ===
        context += '=== 📍 使用者當前位置 (User Location) ===\n';
        context += `目前位於系統頁面: ${currentLocation}\n`;
        if (activeNoteId) {
            const activeNote = notes.find(n => n.id === activeNoteId);
            if (activeNote) {
                context += `目前正在專注的筆記/講義: 【${activeNote.courseName || activeNote.summary.split('\\n')[0]}】\n`;
                context += `該筆記內容摘要: ${activeNote.summary}\n`;
                context += `(請在回答問題時，優先考慮這份正在閱讀的講義脈絡)\n`;
            }
        }
        context += '---\n\n';

        // === NEW: Financial Report ===
        context += '=== 💰 知識銀行財務報表 (Financial Report) ===\n';
        context += `總淨資產 (Net Worth): $${new Intl.NumberFormat('en-US').format(netWorth)}\n`;
        context += `股票市值 (Market Cap): $${new Intl.NumberFormat('en-US').format(stockStats.totalValue)}\n`;
        context += `月收益 (Monthly Yield): +$${new Intl.NumberFormat('en-US').format(stockStats.monthlyReturn)}\n`;
        context += `持倉數量 (Positions): ${stockStats.totalStocks}\n`;

        if (stockList.length > 0) {
            context += '持倉詳情:\n';
            stockList.forEach(stock => {
                context += `- ${stock.name}: ${stock.totalHoldings} 股, 收益 $${stock.totalEarnings}, 績效 ${stock.performance}%\n`;
            });
        } else {
            context += '(目前無持倉)\n';
        }
        context += '---\n\n';

        // === NEW: System Features Overview ===
        context += '=== 🌟 系統功能清單 ===\n\n';
        // ... (rest of the function)
        context += '本系統「AI Student」包含以下核心功能：\n\n';
        context += '1. **筆記上傳與生成** (Upload)\n';
        context += '   - 支援 PDF、PPT、文字檔上傳\n';
        context += '   - AI 自動摘要與提取關鍵術語\n';
        context += '   - 生成結構化學習筆記\n\n';

        context += '2. **AI 簡報生成引擎** (Presentation Studio)\n';
        context += '   - 研究資料收集（網路搜尋或筆記匯入）\n';
        context += '   - SCQA 邏輯架構生成\n';
        context += '   - 多種版型（圖表、時間軸、對比圖等）\n';
        context += '   - 支援 PPTX / PDF 匯出\n';
        context += '   - Magic Remix 功能（隨機切換版型）\n';
        context += '   - 語音控制與 AI 語音旁白\n\n';

        context += '3. **🌌 Knowledge Galaxy (知識星系)**\n';
        context += '   - 3D 視覺化知識網絡\n';
        context += '   - 每份筆記是一顆恆星，章節是行星，術語是衛星\n';
        context += '   - 可以 360° 旋轉、縮放星系\n';
        context += '   - 點擊恆星可導航至該筆記\n';
        context += `   - 目前星系規模：${notes.length} 顆恆星\n\n`;

        context += '4. **AI 寵物系統** (Pet Companion)\n';
        context += '   - 可拖拽的桌面寵物（貓、狗、兔子）\n';
        context += '   - Smart Dock 智慧停靠模式\n';
        context += '   - 會說勵志名言與學習鼓勵\n';
        context += `   - 當前寵物：${selectedPet === 'cat' ? '🐱 貓咪' : selectedPet === 'dog' ? '🐶 小狗' : '🐰 兔子'}\n`;
        context += `   - 等級：Lv.${petLevel}（${petLevel <= 3 ? '🥉 Bronze 初學者' : petLevel <= 6 ? '🥈 Silver 進階者' : petLevel <= 9 ? '🥇 Gold 專家' : '💎 Diamond 大師'}）\n`;
        context += `   - 健康度：${petHealth}/100 ${petHealth > 80 ? '😊 健康' : petHealth > 50 ? '😐 普通' : '😢 虛弱'}\n`;
        context += `   - 飢餓度：${petHunger}/100 ${petHunger < 30 ? '🍽️ 飽足' : petHunger < 70 ? '😋 有點餓' : '😭 快餓扁了'}\n`;
        context += `   - 經驗值：${petXP}/${petLevel * 100} XP\n\n`;

        context += '5. **讀書計畫與任務管理** (Dashboard)\n';
        context += '   - 今日任務清單\n';
        context += '   - 間隔複習排程（D+0, D+3, D+7, D+14）\n';
        context += '   - 番茄鐘計時器\n';
        context += '   - 每週學習統計\n\n';

        context += '6. **測驗系統** (Quiz)\n';
        context += '   - AI 自動生成複習測驗\n';
        context += '   - 主動回憶 (Active Recall) 機制\n\n';

        context += '---\n\n';

        // === NEW: RAG Retrieval ===
        const searchResults = globalSearchEngine.search(queryText, 5);
        if (searchResults.length > 0) {
            context += '=== 🔍 檢索到的相關學習資料 (RAG Context) ===\n\n';
            searchResults.forEach((res, idx) => {
                context += `[參考資料 ${idx + 1}] ${res.doc.text}\n\n`;
            });
            context += '---\n\n';
        }

        // Add Memory Bank (Atoms) context
        if (atoms.length > 0) {
            context += '=== 🧠 知識銀行 (Memory Bank) ===\n';
            context += `總資產數：${atoms.length} 張卡片\n`;
            context += '資產列表 (部分)：\n';
            atoms.slice(0, 20).forEach(atom => {
                context += `- ${atom.term}: ${atom.definition} (熟練度: ${atom.mastery}/5)\n`;
            });
            if (atoms.length > 20) context += `...還有 ${atoms.length - 20} 張卡片\n`;
            context += '\n---\n\n';
        }

        // Add study plan context
        if (studyPlan.length > 0) {
            context += '=== 📅 讀書計畫 ===\n\n';
            studyPlan.forEach((item) => {
                context += `- ${item.dueDate} (D+${item.dayOffset}): ${item.course} - ${item.topic}\n`;
            });
            context += '\n---\n\n';
        }

        // Add research context
        const researchTopics = Object.keys(researchResults);
        if (researchTopics.length > 0) {
            context += '=== 🔍 研究資料收集 ===\n\n';
            researchTopics.forEach((topic) => {
                context += `主題：${topic}\n`;
                const results = researchResults[topic];
                results.forEach((result, index) => {
                    context += `${index + 1}. ${result.title}\n`;
                    context += `   摘要：${result.summary}\n`;
                    if (result.sourceUrl) {
                        context += `   來源：${result.sourceUrl}\n`;
                    }
                });
                context += '\n';
            });
            context += '---\n\n';
        }

        return context;
    };

    const handleSend = async (questionText?: string) => {
        const textToSend = questionText || input.trim();
        if (!textToSend) return;

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const context = buildContext(textToSend);

            // Load comprehensive system knowledge
            const systemKnowledge = `
## 🌟 AI Student 系統完整架構

【系統哲學】
這是一個「生活作業系統」，不只是學習工具。

核心理念：
1. Symbiotic Learning（共生學習）- 寵物是你大腦的視覺化
2. Feynman Technique（費曼技巧）- 透過教學檢驗理解
3. 四層架構：個人成長→社交智慧→職涯目標→內容共享

【完整功能列表】

➊ Dashboard（儀表板）- 位置：/
   - Today Tasks（今日任務）：Eisenhower 矩陣
   - Daily Coaching：心情追蹤 + 番茄鐘 + 寵物選擇
   - Calendar Panel：讀書計畫視覺化
   - Weekly Overview：統計完成/待辦
   - Knowledge Galaxy：3D 知識星系

➋ Upload（上傳）- 位置：/upload
   - 支援：PDF, PPT, TXT
   - 處理：AI 自動摘要 + 術語提取
   - 獎勵：+15 XP

➌ Notes（智慧筆記）- 位置：/notes/:id
   - 顯示：AI 摘要、結構化章節、專業術語
   - 快速入口：相關測驗按鈕

➍ Quiz（測驗系統）- 位置：/quiz/:id
   - 題型：選擇、是非、填空
   - 原理：Active Recall（主動回憶）
   - 獎勵：+20 XP

➎ Spaced Review（間隔複習）- 位置：/review
   - 時程：D+0, D+3, D+7, D+14
   - 科學：Ebbinghaus 遺忘曲線
   - 效果：恢復寵物健康度

➏ Research（研究中心）- 位置：/research
   - 模式：Web Search 或 My Notes
   - 功能：收集資料 → 創建簡報
   - 包含：Research Review 編輯畫面

➐ Presentation Studio（簡報工作室）- 位置：/presentation
   - 流程：Wizard 校準 → Outline 大綱 → 生成投影片
   - 版型：20+ 種（Title, Bullets, Chart, Timeline, Comparison...）
   - 特殊功能：
     • Magic Remix：隨機切換版型
     • Image Editor：上傳或 AI 生成圖片
     • Voice Narration：TTS 語音旁白
     • Export：PPTX / PDF 匯出
   - 獎勵：+25 XP（最高）

➑ Study Plan（讀書計畫）- 位置：/study-plan
   - AI 生成學習時程
   - 視覺化日曆

➒ AI Pet（寵物系統）
   - 類型：🐱 貓 / 🐶 狗 / 🐰 兔子
   - 狀態：
     • 等級：Lv.1-3（Bronze 橙銅）、Lv.4-6（Silver 銀灰）、Lv.7-9（Gold 金色）、Lv.10+（Diamond 漸變）
     • 健康度：0-100（>80 健康 / 50-80 普通 / <50 虛弱）
     • 飢餓度：0-100（<30 飽足 / 30-70 有點餓 / >70 快餓扁）
     • 經驗值：每級需求 = 等級 × 100
   - 心跳：每 60 秒飢餓 +2，飢餓 >80 時健康 -5
   - 互動：點擊喚醒、拖拽移動、Hover 顯示狀態

➓ Knowledge Galaxy（知識星系）
   - 位置：Dashboard 下方
   - 視覺：恆星（筆記）、行星（章節）、衛星（術語）
   - 互動：360° 旋轉、縮放、點擊導航

【XP 獲取表】
- 生成簡報：+25 XP
- 完成測驗：+20 XP
- 上傳筆記：+15 XP
- 完成任務：+10 XP
- 番茄鐘：+5 XP
- 餵食寵物：+5 XP

【常見問題解決】
Q: 寵物一直餓？
A: 飢餓度每分鐘 +2，需要上傳筆記、完成測驗來獲得 XP。

Q: 健康度下降？
A: 當飢餓 >80 時健康會降。解決：降低飢餓度或完成間隔複習。

Q: Galaxy 是空的？
A: 需要至少上傳一份筆記，系統會自動生成星系。

Q: 如何升級？
A: Lv.N → Lv.N+1 需要 N×100 XP。策略：多做簡報（+25）和測驗（+20）。

Q: 簡報生成失敗？
A: 確保 Research 階段收集 3-5 條資料，檢查網路連線。

Q: Magic Remix 是什麼？
A: 隨機切換投影片版型但保留內容，快速探索設計可能性。
`;

            const prompt = `
你是「AI Student」系統的智能大腦助理。你擁有完整的系統知識與解決方案能力。

${systemKnowledge}

【當前用戶狀態】
${context.slice(0, 40000)}

【用戶問題】
${textToSend}

【回答規範 - 格式極為重要】

1. 段落分隔規則（必須嚴格遵守）：
   - 每個段落後面必須加「空行」（兩個換行符號 \\n\\n）
   - 列表（➊➋➌ 或 1.2.3.）結束後必須加「空行」
   - 不同主題之間必須加「空行」
   - 絕對不要使用 Markdown 的星號（*）或底線（_）

2. 文字強調規則：
   - 使用「雙引號」或特殊符號（如 🌟）強調重點
   - 不要用粗體或斜體語法

3. 列表格式：
   - 使用 ➊➋➌ 或 1. 2. 3. 表示項目
   - 每個列表項後不用空行，但整個列表結束後要空行

4. 內容要求：
   - 如果問到功能，詳細解釋用途和使用方法
   - 如果問到寵物狀態，提供準確數據並給建議
   - 如果問到問題，給出具體解決步驟
   
5. 風格要求：
   - 簡潔明瞭，像個好朋友
   - 鼓勵正向的語氣

6. 特殊指令（重要）：
   - 如果用戶想複習某個主題，或你建議用戶複習，請在回答的最後一行加上指令：[REVIEW: 主題關鍵字]
   - 例如：[REVIEW: 投資學] 或 [REVIEW: 全部]
   - 只有在用戶明確表達想複習，或你強烈建議複習時才使用。

【格式範本 - 請嚴格照這個格式】

錯誤示範（段落擠在一起）：
Knowledge Galaxy 是一個 3D 視覺化工具。它的功能包括：➊ 每份筆記是恆星 ➋ 章節是行星。你可以旋轉查看。

正確示範（段落清晰分離）：
Knowledge Galaxy 是一個 3D 視覺化的「知識網絡」，它就像您大腦的迷你宇宙。

它的主要概念是：
➊ 您的每一份「筆記」都會變成一顆「恆星」
➋ 筆記裡面的「章節」會是環繞恆星的「行星」
➌ 而每個章節裡面的「專業術語」則會是圍繞行星的「衛星」

使用 Knowledge Galaxy 非常簡單：
1. 它位於「Dashboard 儀表板」的下方
2. 您可以 360°「旋轉」星系，從不同的角度觀察您的知識地圖
3. 您也可以「縮放」來查看細節或全貌

目前您的星系規模是「0 顆恆星」，這表示您還沒有上傳任何筆記。

別擔心，只要您到「Upload 上傳」功能區，上傳一份 PDF 或其他文件，AI Student 就會自動為您生成第一顆恆星！

請務必按照以上「正確示範」的格式回答，每個段落之間都要有空行。

7. 釐清問題規則（重要）：
   - 如果用戶的問題非常模糊或籠統（例如：「我的進度如何？」、「我有什麼要做的？」），請不要直接回答所有內容。
   - 必須反問用戶具體指的是哪個領域，並提供選項。
   - 範例回答：
     「請問您想了解哪方面的進度呢？
     
     ➊ AI 寵物系統（等級、狀態）
     ➋ Knowledge Galaxy（筆記數量）
     ➌ 知識銀行（複習進度）
     ➍ 讀書計畫（今日任務）
     
     請告訴我您想知道哪一項，或輸入『全部』。」
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Check for REVIEW command
            const reviewMatch = text.match(/\[REVIEW: (.+)\]/);
            if (reviewMatch) {
                const topic = reviewMatch[1];
                // Remove the command from the displayed text
                text = text.replace(reviewMatch[0], '').trim();

                // Logic to filter atoms
                let atomsToReview: any[] = [];
                if (topic === '全部' || topic === 'All') {
                    atomsToReview = atoms;
                } else {
                    atomsToReview = atoms.filter(a =>
                        a.term.toLowerCase().includes(topic.toLowerCase()) ||
                        a.definition.toLowerCase().includes(topic.toLowerCase()) ||
                        (stocks[a.sourceId] && stocks[a.sourceId].name.toLowerCase().includes(topic.toLowerCase()))
                    );
                }

                if (atomsToReview.length > 0) {
                    setTimeout(() => {
                        openReviewModal(atomsToReview);
                    }, 1500); // Small delay for effect
                } else {
                    text += '\n\n(系統提示：找不到與「' + topic + '」相關的複習卡片)';
                }
            }

            // Smart post-processing for readable spacing
            text = text
                // Normalize line breaks
                .replace(/\r\n/g, '\n')
                // First pass: ensure single newline between consecutive list items
                .replace(/([➊➋➌➍➎➏➐➑➒➓]\s[^\n]+)\n+(?=[➊➋➌➍➎➏➐➑➒➓])/g, '$1\n')
                .replace(/(\d+\.\s[^\n]+)\n+(?=\d+\.)/g, '$1\n')
                // Add double newline AFTER a list item if next line is NOT a list item
                .replace(/([➊➋➌➍➎➏➐➑➒➓]\s[^\n]+)\n(?![➊➋➌➍➎➏➐➑➒➓\d])/g, '$1\n\n')
                .replace(/(\d+\.\s[^\n]+)\n(?!\d+\.)/g, '$1\n\n')
                // Add double newline after sentences ending with 。！？
                .replace(/([。！？])\n(?!\n)/g, '$1\n\n')
                // Add double newline after lines ending with colon (section headers)
                .replace(/([：:]\s*)\n(?!\n|[➊➋➌➍➎➏➐➑➒➓\d])/g, '$1\n')
                // Clean up 3+ consecutive newlines to just 2
                .replace(/\n{3,}/g, '\n\n')
                // Trim leading/trailing whitespace
                .trim();

            const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', text };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', text: '抱歉，我現在有點累，請稍後再試。' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        handleSend(question);
    };

    // Draggable Logic removed as it is not used in the render


    // Swipe to close logic
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartX;

        // If swiping right (positive delta) > 100px, close sidebar
        if (deltaX > 100) {
            onToggle();
            setTouchStartX(null); // Reset to prevent multiple triggers
        }
    };

    const handleTouchEnd = () => {
        setTouchStartX(null);
    };

    return (
        <>
            {/* Desktop Floating Button (Left Side) */}
            <button
                onClick={onToggle}
                className="hidden md:flex fixed bottom-10 left-10 z-50 h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Sidebar */}
            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`fixed right-0 top-0 z-50 h-full w-full md:w-96 transform bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Mobile Close Button (Top Right) */}
                <button
                    onClick={onToggle}
                    className="md:hidden absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                    ✕
                </button>
                <div className="flex h-full flex-col p-4 pt-20">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-primary-900">AI 學習助理</h2>
                        <p className="text-xs text-gray-500">
                            已連結 {notes.length} 份筆記 · {studyPlan.length} 項計畫 · {Object.keys(researchResults).length} 個研究主題
                        </p>
                    </div>

                    {/* Suggested Questions */}
                    {messages.length === 1 && (
                        <div className="mb-4 space-y-2">
                            <p className="text-xs text-gray-500 font-medium">💡 試試這些問題：</p>
                            <div className="grid grid-cols-1 gap-2">
                                {SUGGESTED_QUESTIONS.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestedQuestion(question)}
                                        className="text-left text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-2 rounded-lg transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 p-2 scrollbar-thin scrollbar-thumb-gray-200">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-2xl px-4 py-2 text-xs text-gray-500 animate-pulse">
                                    AI 正在思考...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="問我問題..."
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button type="submit" className="!px-3 !py-2 rounded-xl">
                                ➤
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
