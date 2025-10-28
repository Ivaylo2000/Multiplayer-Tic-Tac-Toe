import { createSlice } from "@reduxjs/toolkit";
import { createGame, joinGame } from "./gameThunks";

interface GameState {
  id: string | null;
  playerName: string | null;
  roomKey: string | null;
  status: string;
  expirationTime: string | null;
  board: number[][];
  currentTurn: string | null;
  players: string[];
  isCreator: boolean;
  scores: { [playerName: string]: number }; // Add this
}

const initialState: GameState = {
  id: null,
  playerName: null,
  roomKey: null,
  status: "idle",
  expirationTime: null,
  board: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  currentTurn: null,
  players: [],
  isCreator: false,
  scores: {},
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateGameState: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateScores: (state, action) => {
      state.scores = action.payload;
    },
    updateBoard: (state, action) => {
      state.board = action.payload;
    },
    setCurrentTurn: (state, action) => {
      state.currentTurn = action.payload;
    },
    updatePlayers: (state, action) => {
      state.players = action.payload;
    },
    startGame: (state) => {
      state.status = "started";
    },
    resetGame: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGame.fulfilled, (state, action) => {
        state.roomKey = action.payload.roomKey;
        state.playerName = action.payload.playerName;
        state.players = [action.payload.playerName];
        state.status = "waiting";
        state.isCreator = true;
        state.currentTurn = action.payload.playerName;
      })
      .addCase(joinGame.fulfilled, (state, action) => {
        state.roomKey = action.payload.roomKey;
        state.playerName = action.meta.arg.playerName;
        state.players = action.payload.players;
        state.status =
          action.payload.players.length === 2 ? "ready" : "waiting";
        state.isCreator = false;
        state.currentTurn = action.payload.players[0];
      });
  },
});

export const {
  updateGameState,
  updateBoard,
  setCurrentTurn,
  updatePlayers,
  startGame,
  resetGame,
  updateScores,
} = gameSlice.actions;

export default gameSlice.reducer;
