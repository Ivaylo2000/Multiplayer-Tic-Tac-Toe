// backend/sockets/gameSocket.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { games } from "../gamesandkeys/gamesandkeys";

export const setupSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // your Vite frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a game room
    socket.on(
      "JOIN_ROOM",
      async (data: { roomKey: string; playerName: string }) => {
        const { roomKey, playerName } = data;

        socket.join(roomKey);
        (socket as any).roomKey = roomKey;
        (socket as any).playerName = playerName;

        console.log(`Player ${playerName} joined room ${roomKey}`);

        // Get the updated game state with both players
        const game = games.find((g) => g.roomKey === roomKey);

        // Notify others in the room with full players list
        socket.to(roomKey).emit("PLAYER_JOINED", {
          players: game?.players || [playerName],
          newPlayer: playerName,
          message: `${playerName} joined the game`,
        });
      }
    );

    // Start the game
    socket.on("START_GAME", (roomKey: string) => {
      io.to(roomKey).emit("GAME_STARTED", {
        message: "Game is starting!",
      });
    });

    // Handle player move
    socket.on(
      "MAKE_MOVE",
      (data: { roomKey: string; row: number; col: number; player: string }) => {
        const { roomKey, row, col, player } = data;

        // Find the game
        const game = games.find((g) => g.roomKey === roomKey);
        if (!game) return;

        // Validate move
        if (game.currentTurn !== player || game.board[row][col] !== 0) {
          return; // Invalid move
        }

        // Update the board on backend (THIS IS KEY!)
        const symbol = game.players[0] === player ? 1 : 2; // 1 = X, 2 = O
        game.board[row][col] = symbol;

        // Switch turns
        game.currentTurn =
          game.players.find((p) => p !== player) || game.players[0];

        console.log("Updated backend board:", game.board);

        // Send the ENTIRE updated board to frontend
        io.to(roomKey).emit("MOVE_MADE", {
          board: game.board, // Send the whole board
          currentTurn: game.currentTurn,
          playerWhoMoved: player,
        });
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const roomKey = (socket as any).roomKey;
      if (roomKey) {
        socket.to(roomKey).emit("PLAYER_LEFT", {
          playerName: (socket as any).playerName,
        });
      }
    });
  });

  return io;
};
