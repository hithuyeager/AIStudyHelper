export interface SyllabusDocument {
  id: string;
  name: string;
  characterCount: number;
  numPages: number;
  fileSize: number;
  uploadedAt: string;
  extractedText: string;
  textSnippet: string;
  detectedUnits: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  unitRef: string;
}

export interface QuizData {
  quizTitle: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface ShortAnswerQuestion {
  id: string;
  unitRef: string;
  marks: string;
  question: string;
  expectedKeyPoints: string[];
  sampleModelAnswer: string;
}

export interface LongAnswerQuestion {
  id: string;
  unitRef: string;
  marks: string;
  question: string;
  breakdownCriteria: string[];
  sampleModelAnswer: string;
}

export interface QuestionBankData {
  title: string;
  shortAnswerQuestions: ShortAnswerQuestion[];
  longAnswerQuestions: LongAnswerQuestion[];
}

export type ViewType =
  | 'upload'
  | 'chat'
  | 'summary'
  | 'quiz'
  | 'question-bank'
  | 'explainer'
  | 'study-plan';
