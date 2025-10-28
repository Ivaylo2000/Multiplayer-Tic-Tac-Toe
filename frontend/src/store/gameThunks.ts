import { createAsyncThunk } from "@reduxjs/toolkit";

export const createGame = createAsyncThunk(
  "game/createGame",
  async (playerName: string) => {
    const apiUrl = process.env.REACT_APP_API_URL_CREATE_GAME!;
    const res = await fetch(apiUrl, {
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
    const apiUrl = process.env.REACT_APP_API_URL_jOIN_GAME!;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, roomKey }),
    });

    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.log("❌ Error response:", errorText);
      throw new Error(errorText);
    }

    const data = await res.json();
    console.log("✅ Join response:", data);
    return data;
  }
);
