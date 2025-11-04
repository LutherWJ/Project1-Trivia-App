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

// Socket.io event types
export interface ServerToClientEvents {
  'queueEntered': () => void;
  'matchFound': () => void;
  'matchStarted': (room: GameRoom) => void;
  'matchCancelled': () => void;
}

export interface ClientToServerEvents {
  'findMatch': (name: string) => void;
  'acceptMatch': () => void;
  'cancelMatch': () => void;
  'answerQuestion': (result: PlayerResult) => Promise<boolean>; // Returns whether they get the point or not
}