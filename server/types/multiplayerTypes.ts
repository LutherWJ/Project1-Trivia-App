// Shared types for multiplayer game logic

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

export interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
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
