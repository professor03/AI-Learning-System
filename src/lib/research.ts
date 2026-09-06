import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ResearchResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

export const generateResearch = async (topic: string, field: string): Promise<ResearchResult[]> => {
  const prompt = `
    You are an expert researcher in the field of "${field}".
    Conduct a brief research on the topic: "${topic}".
    
    IMPORTANT:
    1. Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    2. Use HIGHLY AUTHORITATIVE sources (e.g., academic journals, official government reports, reputable news outlets). Avoid blogs or unverified sources.
    3. For each finding, provide a short English image generation prompt that visualizes the concept.
    
    Return 3 key research findings or concepts related to this topic.
    Format the output as a JSON array of objects:
    [
      {
        "title": "Title of the finding",
        "summary": "A detailed summary of the finding (approx 50-80 words).",
        "sourceUrl": "A simulated source URL (e.g., https://example.com/source)",
        "imagePrompt": "A detailed illustration of..."
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Robust JSON extraction
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const cleanJson = jsonMatch[0];
    const data = JSON.parse(cleanJson);

    return data.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
    }));
  } catch (error) {
    console.error('Research generation error:', error);
    throw new Error('Failed to generate research results');
  }
};
