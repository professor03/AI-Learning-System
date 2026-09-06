import type {
  CoachingMessage,
  LectureNotes,
  QuizQuestion,
  ResearchResult,
  ReviewTask,
  StudyPlanItem,
} from '../types';

import {
  mockCoachingMessage,
  mockLectureNotes,
  mockQuizBank,
  mockResearchResults,
  mockReviewTasks,
  mockStudyPlanTemplate,
  mockWeeklyStats,
} from './mockData';

const delay = <T,>(value: T, ms = 200) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (base: Date, days: number) => {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export interface StudyPlanInput {
  course: string;
  examDate: string;
  topics: string;
}

export const api = {
  async getDashboard(): Promise<{
    todayTasks: ReviewTask[];
    coaching: CoachingMessage;
    weeklyStats: { completed: number; pending: number };
  }> {
    const today = formatDate(new Date());
    // Dynamically update mock tasks to match today's date for demo purposes
    const todayTasks = mockReviewTasks.map(task => ({
      ...task,
      dueDate: today
    }));
    return delay({
      todayTasks,
      coaching: mockCoachingMessage,
      weeklyStats: mockWeeklyStats,
    });
  },

  async getLectureNotes(id: string): Promise<LectureNotes> {
    const notes = mockLectureNotes.find((item) => item.id === id);
    if (!notes) {
      throw new Error('Lecture notes not found');
    }
    return delay(notes);
  },

  async getQuiz(id: string): Promise<QuizQuestion[]> {
    const quiz = mockQuizBank[id] ?? [];
    if (!quiz.length) {
      throw new Error('Quiz not found');
    }
    return delay(quiz);
  },

  async getStudyPlan(input: StudyPlanInput): Promise<StudyPlanItem[]> {
    const examDate = new Date(input.examDate);
    const result = mockStudyPlanTemplate.map((item) => ({
      ...item,
      id: `${item.id}-${input.course}`,
      course: input.course,
      topic: `${item.topic}｜${input.topics}`,
      dueDate: formatDate(addDays(examDate, item.dayOffset * -1)),
    }));
    return delay(result);
  },

  async getResearchResults(topic: string): Promise<ResearchResult[]> {
    const filtered = mockResearchResults.filter((item) =>
      item.title.includes(topic) || item.summary.includes(topic)
    );
    return delay(filtered.length ? filtered : mockResearchResults);
  },
};

