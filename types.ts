export type Confidence = 'low' | 'medium' | 'high';

export interface Question {
  id: string;
  confidence: Confidence;
}

export type AppPhase = 'input' | 'results';

export interface TestStats {
  total: number;
  low: number;
  medium: number;
  high: number;
}
