import { createAsyncThunk } from "@reduxjs/toolkit";

export const createGame = createAsyncThunk(
  "game/createGame",
  async (playerName: string) => {
    console.log(playerName);
    const res = await fetch("http://localhost:3000/api/games/creategame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });
    return res.json();
  }
);

export const joinGame = createAsyncThunk(
  "game/joinGame",
  async ({ playerName, roomKey }: { playerName: string; roomKey: string }) => {
    const res = await fetch("http://localhost:3000/api/games/joingame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, roomKey }),
    });
    return res.json();
  }
);
