import { model } from './aiClient';
import type { StudyPlanItem } from '../types';
import type { KnowledgeAtom } from '../types/memory';


export const generateStudyPlan = async (
  _examDate: Date,
  notesSummary: string,
  subjects: string[],
  mode: 'exam' | 'review',
  atoms?: KnowledgeAtom[]
): Promise<StudyPlanItem[]> => {
  const today = new Date();
  const planItems: StudyPlanItem[] = [];

  // IF MODE IS REVIEW AND WE HAVE ATOMS: Dynamic scheduling based on Mastery
  if (mode === 'review' && atoms && atoms.length > 0) {
    const now = Date.now();
    // 1. Only select atoms that are due (or due within the next 24 hours)
    const dueAtoms = atoms.filter(a => a.nextReview && a.nextReview <= now + 86400000);

    if (dueAtoms.length === 0) {
      return [{
        id: crypto.randomUUID(),
        course: subjects[0] || '綜合複習',
        topic: '🎉 記憶力滿分！目前沒有迫切需要複習的卡片，休息一天吧！',
        dueDate: today.toISOString().split('T')[0],
        dayOffset: 0
      }];
    }

    // 2. Sort due atoms by nextReview (urgent first) and then by mastery (lowest first)
    const sortedAtoms = dueAtoms.sort((a, b) => {
      if (a.nextReview !== b.nextReview) return (a.nextReview || 0) - (b.nextReview || 0);
      return a.mastery - b.mastery;
    });
    
    // 3. Distribute top 40 weakest/urgent atoms across the next 3 days
    const dailyTopics = new Map<number, Set<string>>();
    
    sortedAtoms.slice(0, 40).forEach((atom, index) => {
        // Distribute: max 15 cards per day
        const dayOffset = Math.floor(index / 15); 
        if (!dailyTopics.has(dayOffset)) dailyTopics.set(dayOffset, new Set());
        // Extract a "topic" from the atom's term
        const topic = atom.term.length < 15 ? atom.term : atom.term.substring(0, 15) + '...';
        dailyTopics.get(dayOffset)!.add(topic);
    });

    dailyTopics.forEach((topics, offset) => {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + offset);
        planItems.push({
            id: crypto.randomUUID(),
            course: subjects[0] || '弱點記憶庫',
            topic: `🎯 針對性複習：${Array.from(topics).slice(0, 3).join('、')}`,
            dueDate: dueDate.toISOString().split('T')[0],
            dayOffset: offset
        });
    });

    return planItems.sort((a, b) => a.dayOffset - b.dayOffset);
  }

  // EXAM SPRINT MODE: CALL AI
  const offsets = [3, 5, 7, 14];

  const prompt = `
    You are an expert study planner.
    
    Task: Create 4 distinct review topics for EACH of the following subjects: ${subjects.join(', ')}.
    These topics will be scheduled for D+3, D+5, D+7, and D+14 reviews.
    
    Context from notes:
    ${notesSummary.slice(0, 10000)}
    
    IMPORTANT: Output MUST be in Traditional Chinese (Taiwan) / 繁體中文(台灣).
    
    Return the response in valid JSON format as an array of objects.
    Structure:
    [
      {
        "course": "Subject Name",
        "topics": ["Topic for D+3", "Topic for D+5", "Topic for D+7", "Topic for D+14"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanJson);

    data.forEach((subjectPlan: any) => {
      subjectPlan.topics.forEach((topic: string, index: number) => {
        if (index < offsets.length) {
          const offset = offsets[index];
          const dueDate = new Date(today);
          dueDate.setDate(today.getDate() + offset);

          planItems.push({
            id: crypto.randomUUID(),
            course: subjectPlan.course,
            topic: topic,
            dueDate: dueDate.toISOString().split('T')[0],
            dayOffset: offset,
          });
        }
      });
    });

    return planItems.sort((a, b) => a.dayOffset - b.dayOffset);
  } catch (error) {
    console.error('Study plan generation error:', error);
    throw new Error('Failed to generate study plan');
  }
};
