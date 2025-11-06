// I LOVE EXPLICIT ERROR HANDLING
export type Success<T> = {
    ok: true;
    value: T;
};

export type Failure<E> = {
    ok: false;
    error: E;
};

export type Result<T, E> = Success<T> | Failure<E>;
// Helper functions for easily creating custom error types
export const ok = <T>(value: T): Success<T> => ({ ok: true, value });
export const err = <E>(error: E): Failure<E> => ({ ok: false, error });

export interface Question {
    category: string
    type: string
    difficulty: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
}

export interface TriviaAPIResponse {
    response_code: number
    results: Question[]
}

export const Difficulty = {
    Easy: 'easy',
    Medium: 'medium',
    Hard: 'hard',
    Any: 'any',
} as const

export type Difficulty = typeof Difficulty[keyof typeof Difficulty]

export interface Preferences {
    quantity: number
    category: number
    difficulty: string
}

export interface PreferenceStrings {
    quantity: string
    category: string
    difficulty: string
}

export interface AnswerChoice {
    answer: string
    isCorrect: boolean
}

export const Mode = {
    classic: 'Classic',
    special: 'Special',
    endless: 'Endless',
} as const

export type Mode = typeof Mode[keyof typeof Mode]

export interface ScoreHistoryEntry {
    score: number
    mode: Mode;
    totalQuestions: number
    timestamp: number
    percentage: number
}

export interface Player {
    id: string;
    name: string;
    score: number;
    ready: boolean;
}

export interface GameRoom {
    id: string;
    player1: Player;
    player2: Player;
    currentQuestionIndex: number;
    questions: Question[];
    startTime: number | null;
}

export interface PlayerResult {
    roomID: string;
    playerID: string;
    isCorrect: boolean;
    timeAnswered: number;
}

export interface QuestionResult {
    winResult: string | null;
    isWonOffTime: boolean;
}
