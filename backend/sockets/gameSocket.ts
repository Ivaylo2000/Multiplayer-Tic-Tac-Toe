// backend/sockets/gameSocket.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Board, games } from "../gamesandkeys/gamesandkeys";

export const setupSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
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

    socket.on("CLEAR_BOARD", (roomKey: string) => {
      const game = games.find((g) => g.roomKey === roomKey);
      if (!game) return;

      // Reset the board
      game.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      // Alternate who starts first (so it's fair)
      game.starterIndex = (game.starterIndex + 1) % 2;
      game.currentTurn = game.players[game.starterIndex];

      game.status = "in progress";
      game.winner = null;

      console.log("Game reset for room:", roomKey);

      // Notify all players
      io.to(roomKey).emit("CLEAR_BOARD", {
        board: game.board,
        currentTurn: game.currentTurn,
        status: game.status,
        scores: game.scores,
        winner: null,
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
        console.log("🎮 BEFORE MOVE:");
        console.log("  - currentTurn:", game.currentTurn);
        console.log("  - player making move:", player);
        console.log("  - players:", game.players);
        // Validate move
        if (game.currentTurn !== player || game.board[row][col] !== 0) {
          return; // Invalid move
        }

        // Update the board
        const symbol = game.players[0] === player ? 1 : 2;
        game.board[row][col] = symbol;

        // Switch turns to the other player!
        game.currentTurn =
          game.players.find((p) => p !== player) || game.players[0];
        console.log("🔄 TURN SWITCHED TO:", game.currentTurn);

        let winner = null;

        let winningLine = null;
        // Check for win
        for (let i = 0; i < 3; i++) {
          if (
            game.board[i][0] !== 0 &&
            game.board[i][0] === game.board[i][1] &&
            game.board[i][1] === game.board[i][2]
          ) {
            winner = game.board[i][0] === 1 ? game.players[0] : game.players[1];
            winningLine = { type: "row", index: i }; // Row win
            break;
          }
        }

        for (let j = 0; j < 3; j++) {
          if (
            game.board[0][j] !== 0 &&
            game.board[0][j] === game.board[1][j] &&
            game.board[1][j] === game.board[2][j]
          ) {
            winner = game.board[0][j] === 1 ? game.players[0] : game.players[1];
            winningLine = { type: "column", index: j }; // Column win
            break;
          }
        }

        if (
          game.board[0][0] !== 0 &&
          game.board[0][0] === game.board[1][1] &&
          game.board[1][1] === game.board[2][2]
        ) {
          winner = game.board[0][0] === 1 ? game.players[0] : game.players[1];
          winningLine = { type: "diagonal", direction: "main" }; // Main diagonal
        }

        if (
          game.board[0][2] !== 0 &&
          game.board[0][2] === game.board[1][1] &&
          game.board[1][1] === game.board[2][0]
        ) {
          winner = game.board[0][2] === 1 ? game.players[0] : game.players[1];
          winningLine = { type: "diagonal", direction: "anti" }; // Anti-diagonal
        }

        // Check for draw (if no winner and all cells filled)
        if (!winner) {
          const isBoardFull = game.board.flat().every((cell) => cell !== 0);
          game.currentTurn =
            game.players.find((p) => p !== player) || game.players[0];
          if (isBoardFull) {
            winner = "draw";
          }
        }

        // Update game state
        if (winner) {
          // Update the score!
          if (winner !== "draw") {
            game.scores[winner] = (game.scores[winner] || 0) + 1;
          }

          game.status = "finished";
          game.winner = winner;

          console.log("Scores updated:", game.scores);
        }

        console.log("Updated backend board:", game.board);

        // Send the updated game state to frontend
        io.to(roomKey).emit("MOVE_MADE", {
          board: game.board,
          currentTurn: game.currentTurn,
          winningLine: winningLine,
          playerWhoMoved: player,
          winner: winner,
          scores: game.scores,
          status: game.status,
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
