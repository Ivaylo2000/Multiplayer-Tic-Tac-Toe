export interface GameState {
  roomId: string | null;
  playerName: string | null;
  players: string[];
  status: "idle" | "waiting" | "ready" | "started";
}
