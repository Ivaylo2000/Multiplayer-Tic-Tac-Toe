export type Board = (string | null | number)[][];

// Define the Game interface
export interface Game {
  id: string;
  playerName: string;
  roomKey: string;
  status: string;
  expirationTime: string;
  board: Board;
  currentTurn: string;
  starterIndex: number;
  players: string[];
  scores: { [playerName: string]: number };
  winner?: string | null;
}

export const games: Game[] = [];

export const keys: string[] = [];
