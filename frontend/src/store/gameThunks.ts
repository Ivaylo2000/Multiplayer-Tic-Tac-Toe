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
    console.log("📡 Sending join request...");
    const res = await fetch("http://localhost:3000/api/games/joingame", {
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
