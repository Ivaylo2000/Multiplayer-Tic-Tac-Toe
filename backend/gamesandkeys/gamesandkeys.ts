export type Board = (string | null | number)[][];

export interface Player {
  id: string;
  name: string;
  status: "connected" | "disconnected";
  disconnectedAt?: Date;
  socketId?: string;
  reconnectTimer?: NodeJS.Timeout;
  reconnectBudget: number;
  remainingTime?: number;
}

export interface Game {
  id: string;
  playerName: string;
  roomKey: string;
  status: string;
  expirationTime: string;
  board: Board;
  currentTurn: string;
  starterIndex: number;
  players: Player[];
  scores: { [playerName: string]: number };
  winner?: string | null;
}

export const games: Game[] = [];

export const keys: string[] = [];
