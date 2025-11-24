import { createAsyncThunk } from "@reduxjs/toolkit";

export const createGame = createAsyncThunk(
  "game/createGame",
  async (playerName: string) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(`${API_URL}/api/games/creategame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });

    const data = await res.json();

    localStorage.setItem(
      "pendingRejoin",
      JSON.stringify({
        roomKey: data.roomKey,
        playerName: data.playerName,
      })
    );

    return data;
  }
);

export const joinGame = createAsyncThunk(
  "game/joinGame",
  async ({ playerName, roomKey }: { playerName: string; roomKey: string }) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(`${API_URL}/api/games/joingame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, roomKey }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const data = await res.json();

    console.log(data);

    localStorage.setItem(
      "pendingRejoin",
      JSON.stringify({
        roomKey: data.roomKey,
        playerName: data.playerName,
      })
    );
    return data;
  }
);
