import type { KnowledgeAtom } from '../types/memory';
import { v4 as uuidv4 } from 'uuid';

export interface QuizQuestion {
    id: string;
    type: 'multiple-choice' | 'fill-in';
    atomId: string;
    question: string;
    options?: string[]; // For multiple choice
    correctAnswer: string;
    explanation: string;
}

export class QuizGenerator {
    private atoms: KnowledgeAtom[];

    constructor(atoms: KnowledgeAtom[]) {
        this.atoms = atoms;
    }

    public generateQuiz(count: number): QuizQuestion[] {
        if (this.atoms.length < 4) {
            throw new Error('Not enough knowledge atoms to generate a quiz (minimum 4 required).');
        }

        // Prioritize atoms due for review or with low mastery
        const candidates = [...this.atoms]
            .sort((a, b) => a.mastery - b.mastery) // Ascending mastery (hardest first)
            .slice(0, Math.max(count * 2, 10)); // Take top candidates pool

        // Shuffle and select
        const selectedAtoms = candidates
            .sort(() => Math.random() - 0.5)
            .slice(0, count);

        return selectedAtoms.map(atom => {
            return Math.random() > 0.5
                ? this.generateMultipleChoice(atom)
                : this.generateFillIn(atom);
        });
    }

    private generateMultipleChoice(atom: KnowledgeAtom): QuizQuestion {
        // Find distractors (wrong answers)
        const distractors = this.atoms
            .filter(a => a.id !== atom.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(a => a.definition);

        const options = [...distractors, atom.definition].sort(() => Math.random() - 0.5);

        return {
            id: uuidv4(),
            type: 'multiple-choice',
            atomId: atom.id,
            question: `What is the definition of "${atom.term}"?`,
            options,
            correctAnswer: atom.definition,
            explanation: `"${atom.term}" is defined as: ${atom.definition}`
        };
    }

    private generateFillIn(atom: KnowledgeAtom): QuizQuestion {
        // Simple cloze deletion: remove the term from the definition if it appears there, 
        // OR just ask for the term given the definition.
        // Strategy: Given definition, what is the term?

        // Find distractors (wrong terms)
        const distractors = this.atoms
            .filter(a => a.id !== atom.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(a => a.term);

        const options = [...distractors, atom.term].sort(() => Math.random() - 0.5);

        return {
            id: uuidv4(),
            type: 'multiple-choice', // Using MC UI for term selection is easier for mobile
            atomId: atom.id,
            question: `Which term matches this definition?\n"${atom.definition}"`,
            options,
            correctAnswer: atom.term,
            explanation: `The definition describes "${atom.term}".`
        };
    }
}
