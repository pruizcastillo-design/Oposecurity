
export enum Confidence {
  NONE = 'NONE', // No seleccionado
  RED = 'RED', // No me la sé
  YELLOW = 'YELLOW', // Dudo entre 2
  GREEN = 'GREEN' // Estoy seguro
}

export interface Question {
  id: number;
  confidence: Confidence;
  initialSelections: string[]; // Options picked initially
  finalSelection: string | null; // The definitive answer for the test
  correctAnswer: string | null; // The real correct answer from the key
}

export type AppPhase = 'SETUP' | 'TESTING' | 'REFINEMENT' | 'CORRECTION' | 'RESULTS';

export interface TestStats {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  blank: number;
  netScore: number;
  autofiabilidad: number; // % of Green questions
  greenAccuracy: number;
  yellowAccuracy: number;
  redAccuracy: number;
}
