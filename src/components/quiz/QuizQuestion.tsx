import { useState, useEffect } from 'react';
import type { QuizQuestion as QuizQuestionType } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';
import clsx from 'clsx';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onNext: () => void;
  isLast?: boolean;
}

const QuizQuestion = ({ question, onNext, isLast = false }: QuizQuestionProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [question.id]);

  const handleSubmit = () => {
    if (!userAnswer) return;

    const correct = userAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const renderOptions = () => {
    if (!question.options) return null;

    return (
      <div className="grid gap-3 my-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isSubmitted && setUserAnswer(option)}
            disabled={isSubmitted}
            className={clsx(
              'w-full text-left p-4 rounded-xl border transition-all',
              isSubmitted && option === question.correctAnswer
                ? 'bg-green-100 border-green-500 text-green-800'
                : isSubmitted && option === userAnswer && option !== question.correctAnswer
                  ? 'bg-red-100 border-red-500 text-red-800'
                  : userAnswer === option
                    ? 'bg-primary/10 border-primary text-primary-700'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
            )}
          >
            <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card variant="accent">
      <header className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {question.type === 'multiple-choice' ? '選擇題' :
              question.type === 'true-false' ? '是非題' : '問答題'}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-text-dark leading-relaxed">
          {question.question}
        </h2>
      </header>

      {/* Answer Input Area */}
      {question.type === 'short-answer' || question.type === 'fill-in-the-blank' ? (
        <Textarea
          label="你的答案"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isSubmitted}
          rows={3}
          className={clsx(
            isSubmitted && (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
          )}
        />
      ) : (
        renderOptions()
      )}

      {/* Feedback Section */}
      {isSubmitted && (
        <div className={clsx(
          "mt-4 p-4 rounded-xl border",
          isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx("text-lg", isCorrect ? "text-green-600" : "text-red-600")}>
              {isCorrect ? '✅ 答對了！' : '❌ 答錯了'}
            </span>
          </div>
          <p className="text-gray-700 font-medium">正確答案：{question.correctAnswer}</p>
          {question.explanation && (
            <p className="text-gray-600 text-sm mt-2 border-t border-gray-200/50 pt-2">
              解析：{question.explanation}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!userAnswer}>
            送出答案
          </Button>
        ) : (
          <Button onClick={onNext}>
            {isLast ? '查看結果' : '下一題 →'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default QuizQuestion;
