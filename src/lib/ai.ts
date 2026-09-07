import { model } from './aiClient';
import { parseNotes, parseQuiz } from './aiValidation';
import type { LectureNotes, QuizQuestion } from '../types';


export const generateNotes = async (text: string, courseName: string): Promise<LectureNotes> => {
  if (!text.trim() || !courseName.trim()) throw new Error('請提供教材內容與課程名稱。');
  const prompt = `
    You are an expert student tutor. Analyze the following text from the course "${courseName}" and create structured lecture notes.
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    CRITICAL FORMATTING RULES:
    - DO NOT use any Markdown syntax (no **, *, _, \`, #, etc.)
    - Use PLAIN TEXT only for all content
    - Use "quoted text" for emphasis instead of **bold**
    - Use line breaks to separate paragraphs (use \\n\\n for double line breaks)
    - For lists, use numbered format (1. 2. 3.) or bullet points (- item)
    - Keep formatting minimal, clean, and natural like human writing
    - Write like you're explaining to a friend, not writing documentation
    
    Return the response in valid JSON format with the following structure:
    {
      "summary": "A concise summary in plain text. Use quotes for important concepts. Use \\n\\n for paragraph breaks.",
      "sections": [
        {
          "id": "section-1",
          "title": "Main Topic 1",
          "content": "Detailed explanation in plain text. Use quotes for key terms. Use \\n\\n to separate paragraphs."
        }
      ],
      "terms": [
        {
          "term": "Key Term 1",
          "definition": "Simple definition of the term."
        }
      ]
    }

    Text to analyze:
    ${text.slice(0, 30000)} // Limit text length for safety
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up markdown code blocks if present
    const data = parseNotes(textResponse);

    return {
      id: crypto.randomUUID(),
      materialId: 'generated',
      courseName: courseName,
      summary: data.summary,
      sections: data.sections,
      terms: data.terms,
    };
  } catch (error: any) {
    console.error('Error generating notes:', error);
    // Pass the actual error message to the UI
    const msg = error?.message || error?.toString() || 'Unknown AI error';
    throw new Error(`AI 生成失敗: ${msg}`);
  }
};

export const generateQuiz = async (
  text: string,
  options: { count: number; type: string; allowExternal: boolean } = { count: 3, type: 'mixed', allowExternal: false }
): Promise<QuizQuestion[]> => {
  if (!text.trim() || !Number.isInteger(options.count) || options.count < 1 || options.count > 30) {
    throw new Error('請提供教材，題數需為 1～30 的整數。');
  }
  const prompt = `
    You are an expert exam creator. Create ${options.count} quiz questions based on the provided text.
    
    Configuration:
    - Question Type: ${options.type} (multiple-choice, true-false, fill-in-the-blank, short-answer, or mixed)
    - Allow External Knowledge: ${options.allowExternal ? 'YES (You can use your broader knowledge to create relevant questions)' : 'NO (Strictly stick to the provided text)'}
    
    IMPORTANT REQUIREMENTS:
    1. Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    2. MUST distribute questions uniformly across the entire text. Do not just focus on the beginning.
    3. MUST include questions spanning 3 difficulty levels: 
       - Level 1: Definition (名詞解釋 - testing direct recall)
       - Level 2: Scenario (情境應用 - applying the concept to a new scenario)
       - Level 3: Inference (反向推論 - synthesizing information or finding contradictions)
    
    Return the response in valid JSON format as an array of objects.
    
    For 'multiple-choice', structure as:
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }

    For 'true-false', structure as:
    {
      "id": "q2",
      "type": "true-false",
      "question": "Statement",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why"
    }

    For 'short-answer' or 'fill-in-the-blank', structure as:
    {
      "id": "q3",
      "type": "short-answer",
      "question": "Question text",
      "correctAnswer": "The expected answer",
      "explanation": "Details"
    }

    Text to analyze:
    ${text.slice(0, 15000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    const data = parseQuiz(textResponse, options.count);

    return data.map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
      userAnswer: undefined, // Reset user answer
      isCorrect: undefined, // Reset validation
    }));
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    const msg = error?.message || error?.toString() || 'Unknown AI error';
    throw new Error(`AI 出題失敗: ${msg}`);
  }
};

// ---------------------------------------------------------------------------
// 任務 B: 深度互動筆記 (Contextual AI)
// ---------------------------------------------------------------------------

export const explainText = async (text: string, fullContext?: string): Promise<string> => {
  const prompt = `
    You are an expert tutor. The student highlighted the following text and asked for an explanation.
    Explain it in a very simple, easy-to-understand way, as if you were explaining to a beginner. Use analogies if helpful.
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    Keep it concise but clear. No markdown formatting, just plain text.
    
    Target Text to explain:
    "${text.slice(0, 5000)}"
    
    ${fullContext ? `Context from the lecture (use this to anchor your explanation accurately):\n"${fullContext.slice(0, 5000)}"` : ''}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

export const generateCardsFromText = async (text: string, fullContext?: string): Promise<{ term: string, definition: string }[]> => {
  const prompt = `
    You are an expert at creating spaced repetition flashcards. The student highlighted the following target text.
    Extract 1 to 3 key concepts from this text and convert them into flashcards (term and definition).
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    Return the response in valid JSON format as an array of objects:
    [
      { "term": "Key Concept", "definition": "Clear, concise definition" }
    ]
    
    Target Text:
    "${text.slice(0, 5000)}"
    
    ${fullContext ? `Context from the lecture (use this to anchor your definitions accurately):\n"${fullContext.slice(0, 5000)}"` : ''}
  `;

  const result = await model.generateContent(prompt);
  const textResponse = result.response.text();
  const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanJson);
};

export const generateQuestionFromText = async (text: string): Promise<QuizQuestion> => {
  const questions = await generateQuiz(text, { count: 1, type: 'multiple-choice', allowExternal: false });
  return questions[0];
};

// ---------------------------------------------------------------------------
// 任務 C: 沉浸式地獄考場 (Hardcore Mock Exam)
// ---------------------------------------------------------------------------

export const evaluateMockExam = async (
  questions: any[],
  answers: Record<string, string>
): Promise<{ report: string, missedConcepts: { term: string, definition: string }[] }> => {
  
  // Format the test data for the AI to analyze
  const testData = questions.map(q => {
    const userAns = answers[q.id];
    const correctAns = 'correctAnswer' in q ? q.correctAnswer : q.answer;
    const isCorrect = (q.type === 'short-answer' || q.type === 'fill-in-the-blank')
        ? userAns?.toLowerCase().trim() === correctAns?.toLowerCase().trim()
        : userAns === correctAns;
    
    return {
      question: q.question,
      userAnswer: userAns || "No answer",
      correctAnswer: correctAns,
      isCorrect
    };
  });

  const prompt = `
    You are an extremely strict but highly effective exam grader. The student just finished a Hardcore Mock Exam.
    Analyze their performance based on the following questions and answers.

    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Provide your response as a valid JSON object with the following structure:
    {
      "report": "A blunt, direct analysis of their performance. Point out exactly which concepts they got wrong and why they might be confused. Be strict but encouraging.",
      "missedConcepts": [
        {
          "term": "The concept they missed",
          "definition": "The correct definition they need to memorize"
        }
      ]
    }
    
    Exam Data:
    ${JSON.stringify(testData, null, 2)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error evaluating exam:', error);
    return {
      report: "分析報告生成失敗，但您的錯題已記錄。",
      missedConcepts: []
    };
  }
};

export const generateRescuePlan = async (
  failedConcepts: { term: string, definition: string }[]
): Promise<string> => {
  const conceptsText = failedConcepts.map(c => `- ${c.term}: ${c.definition}`).join('\n');
  
  const prompt = `
    You are a highly empathetic and extremely clear tutor. The student just failed a Hardcore Mock Exam and feels frustrated.
    They failed to grasp the following concepts:
    
    ${conceptsText}
    
    Please write a "Knowledge Rescue Plan" (知識搶救報告).
    1. Start with an encouraging, warm opening. (e.g., "Don't worry, everyone struggles with this...")
    2. Break down EACH failed concept using the ABSOLUTE SIMPLEST terms, like explaining to a 5-year-old or using very relatable real-world analogies (e.g., comparing RAM to a desk).
    3. Keep it plain text, use line breaks, no markdown symbols (*, #, \` etc).
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating rescue plan:', error);
    return "系統生成搶救計畫失敗，但請不要氣餒，深呼吸後再看一次講義！";
  }
};

// ---------------------------------------------------------------------------
// 任務 D: 問題導向學習 (PBL Challenge Mode)
// ---------------------------------------------------------------------------

export interface PBLScenario {
  title: string;
  role: string;
  scenario: string;
  problemStatement: string;
}

export interface PBLConfig {
  role?: string;          // 使用者自訂角色，例如：'後端工程師'
  context?: string;       // 使用者自訂情境，例如：'電商系統優化'
  difficulty: 'easy' | 'medium' | 'hard';
}

const DIFFICULTY_INSTRUCTION: Record<PBLConfig['difficulty'], string> = {
  easy: '難度設定為「初級 (Easy)」：情境應貼近日常生活，問題直接，學生只需套用單一概念即可解決。',
  medium: '難度設定為「中級 (Medium)」：情境涉及真實工作場景，問題需要學生整合 2-3 個概念，並考慮現實限制。',
  hard: '難度設定為「高級 (Hard)」：情境為複雜的多方利益衝突場景，問題需要學生進行跨領域推理、批判性思考，並提出有取捨依據的解決方案。',
};

export const generatePBLScenario = async (
  text: string,
  config?: PBLConfig,
  chatHistory?: string
): Promise<PBLScenario> => {
  const difficultyKey = config?.difficulty ?? 'medium';
  const difficultyNote = DIFFICULTY_INSTRUCTION[difficultyKey];

  const roleHint = config?.role
    ? `學生希望扮演的角色是：「${config.role}」。請以此為基礎設計情境。`
    : '角色由 AI 根據講義內容自行推斷（例如：工程師、醫療人員、商業分析師等）。';

  const contextHint = config?.context
    ? `學生希望的情境設定是：「${config.context}」。請將情境融入此背景。`
    : chatHistory
    ? `根據學生在 AI 聊天室最近的提問，推斷他最感興趣的應用領域：\n---\n${chatHistory.slice(0, 2000)}\n---`
    : '情境由 AI 根據講義類型自行推斷。';

  const prompt = `
    You are an expert curriculum designer specializing in Problem-Based Learning (PBL).
    Create a highly engaging real-world scenario based on the following course text.
    
    The goal is to test if the student can APPLY the knowledge, not just memorize it.
    
    ${difficultyNote}
    ${roleHint}
    ${contextHint}
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Return the response in valid JSON format:
    {
      "title": "A catchy title for the mission (e.g. '資料庫優化大作戰')",
      "role": "The exact role the student is playing (localized to Traditional Chinese)",
      "scenario": "A 2-3 sentence background story describing the situation and the company's pain point.",
      "problemStatement": "The specific question or challenge the student must solve using the concepts from the text. Make it practical and appropriately difficult."
    }

    Text to analyze:
    ${text.slice(0, 15000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Error generating PBL scenario:', error);
    throw new Error('無法生成 PBL 情境，請稍後再試。');
  }
};

export const evaluatePBLResponse = async (
  scenario: PBLScenario,
  userResponse: string,
  sourceText: string
): Promise<{ score: number; feedback: string }> => {
  const prompt = `
    You are an expert mentor reviewing a junior's work.
    
    Role of the student: ${scenario.role}
    Scenario: ${scenario.scenario}
    Problem they had to solve: ${scenario.problemStatement}
    
    The student's proposed solution:
    "${userResponse}"
    
    Reference knowledge (Course text):
    ${sourceText.slice(0, 10000)}
    
    Evaluate the student's solution based on how well they applied the reference knowledge to solve the practical problem.
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Return valid JSON:
    {
      "score": number between 0 and 100,
      "feedback": "Your detailed feedback in plain text. Use line breaks. Be constructive. If they scored low, point out what concepts they failed to apply. If they scored high, praise their specific practical application."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error('Error evaluating PBL response:', error);
    return { score: 0, feedback: "評估失敗，請再試一次。" };
  }
};
