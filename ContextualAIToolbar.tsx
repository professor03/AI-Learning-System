import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface Position {
  x: number;
  y: number;
}

interface ContextualAIToolbarProps {
  selectedText: string;
  position: Position | null;
  onExplain: (text: string) => void;
  onGenerateCards: (text: string) => void;
  onGenerateQuestion: (text: string) => void;
  onClose: () => void;
}

export default function ContextualAIToolbar({
  selectedText,
  position,
  onExplain,
  onGenerateCards,
  onGenerateQuestion,
  onClose,
}: ContextualAIToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!position || !selectedText) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed z-50 bg-white rounded-xl shadow-xl shadow-blue-900/10 border border-gray-200 p-2 flex gap-1 items-center"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(0, -100%)',
          marginTop: '-10px', // slightly above the text
        }}
      >
        <button
          onClick={() => {
            onExplain(selectedText);
            onClose();
          }}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>💡</span> AI 解釋
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={() => {
            onGenerateCards(selectedText);
            onClose();
          }}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>📇</span> 做成閃卡
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={() => {
            onGenerateQuestion(selectedText);
            onClose();
          }}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>🎯</span> 隨堂測驗
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
