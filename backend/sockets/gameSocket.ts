import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { games } from "../gamesandkeys/gamesandkeys";

export const setupSocketIO = (server: HttpServer) => {
  const rawClientUrl = process.env.CLIENT_URL || "";
  const clientUrlNoSlash = rawClientUrl.replace(/\/$/, "");
  const allowedOrigins = [clientUrlNoSlash, `${clientUrlNoSlash}/`];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on(
      "JOIN_ROOM",
      async (data: { roomKey: string; playerName: string }) => {
        const { roomKey, playerName } = data;

        socket.join(roomKey);
        (socket as any).roomKey = roomKey;
        (socket as any).playerName = playerName;

        const game = games.find((g) => g.roomKey === roomKey);
        if (!game) return;

        const playerNames = game.players.map((p) => p.name);

        socket.to(roomKey).emit("PLAYER_JOINED", {
          players: playerNames,
          newPlayer: playerName,
          message: `${playerName} joined the game`,
        });
      }
    );

    socket.on("CLEAR_BOARD", (roomKey: string) => {
      const game = games.find((g) => g.roomKey === roomKey);
      if (!game) return;

      game.board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];

      game.starterIndex = (game.starterIndex + 1) % 2;
      game.currentTurn = game.players[game.starterIndex].name;

      game.status = "in progress";
      game.winner = null;

      io.to(roomKey).emit("CLEAR_BOARD", {
        board: game.board,
        currentTurn: game.currentTurn,
        status: game.status,
        scores: game.scores,
        winner: null,
      });
    });

    socket.on(
      "MAKE_MOVE",
      (data: { roomKey: string; row: number; col: number; player: string }) => {
        const { roomKey, row, col, player } = data;

        const game = games.find((g) => g.roomKey === roomKey);

        if (!game) return;

        if (game.currentTurn !== player || game.board[row][col] !== 0) {
          return;
        }

        const symbol = game.players[0].name === player ? 1 : 2;
        game.board[row][col] = symbol;

        game.currentTurn =
          game.players.find((p) => p.name !== player)?.name ||
          game.players[0].name;

        let winner = null;
        let winningLine = null;

        for (let i = 0; i < 3; i++) {
          if (
            game.board[i][0] !== 0 &&
            game.board[i][0] === game.board[i][1] &&
            game.board[i][1] === game.board[i][2]
          ) {
            winner =
              game.board[i][0] === 1
                ? game.players[0].name
                : game.players[1].name;
            winningLine = { type: "row", index: i };
            break;
          }
        }

        for (let j = 0; j < 3; j++) {
          if (
            game.board[0][j] !== 0 &&
            game.board[0][j] === game.board[1][j] &&
            game.board[1][j] === game.board[2][j]
          ) {
            winner =
              game.board[0][j] === 1
                ? game.players[0].name
                : game.players[1].name;
            winningLine = { type: "column", index: j }; // Column win
            break;
          }
        }

        if (
          game.board[0][0] !== 0 &&
          game.board[0][0] === game.board[1][1] &&
          game.board[1][1] === game.board[2][2]
        ) {
          winner =
            game.board[0][0] === 1
              ? game.players[0].name
              : game.players[1].name;
          winningLine = { type: "diagonal", direction: "main" }; // Main diagonal
        }

        if (
          game.board[0][2] !== 0 &&
          game.board[0][2] === game.board[1][1] &&
          game.board[1][1] === game.board[2][0]
        ) {
          winner =
            game.board[0][2] === 1
              ? game.players[0].name
              : game.players[1].name;
          winningLine = { type: "diagonal", direction: "anti" }; // Anti-diagonal
        }

        if (!winner) {
          const isBoardFull = game.board.flat().every((cell) => cell !== 0);
          game.currentTurn =
            game.players.find((p) => p.name !== player)?.name ||
            game.players[0].name;

          if (isBoardFull) {
            winner = "draw";
          }
        }

        if (winner) {
          if (winner !== "draw") {
            game.scores[winner] = (game.scores[winner] || 0) + 1;
          }
          game.status = "finished";
          game.winner = winner;
        }

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

    socket.on("ROOM_INACTIVITY_CLOSE", (roomKey: string) => {
      const gameIndex = games.findIndex((g) => g.roomKey === roomKey);
      if (gameIndex > -1) {
        games.splice(gameIndex, 1);
      }
    });

    socket.on("disconnect", () => {
      const roomKey = (socket as any).roomKey;
      const playerName = (socket as any).playerName;

      if (roomKey) {
        const game = games.find((g) => g.roomKey === roomKey);
        if (game) {
          const player = game.players.find((p) => p.name === playerName);
          if (player) {
            player.status = "disconnected";
            player.disconnectedAt = new Date();
            player.socketId = socket.id;

            // Clear any existing timer
            if (player.reconnectTimer) {
              clearTimeout(player.reconnectTimer);
            }

            // Calculate remaining time from previous disconnects
            const timeToUse = player.reconnectBudget;
            player.remainingTime = timeToUse;

            // Set timer with the remaining budget
            player.reconnectTimer = setTimeout(() => {
              const currentGame = games.find((g) => g.roomKey === roomKey);
              if (currentGame) {
                const stillDisconnected = currentGame.players.find(
                  (p) => p.name === playerName && p.status === "disconnected"
                );

                if (stillDisconnected) {
                  io.to(roomKey).emit("ROOM_CLOSED", {
                    message: `${playerName} used all reconnect time. Game ended.`,
                    playerWhoLeft: playerName,
                    reason: "reconnect_budget_exhausted",
                  });
                  games.splice(games.indexOf(currentGame), 1);
                }
              }
            }, timeToUse);

            // Notify with remaining time
            io.to(roomKey).emit("PLAYER_DISCONNECTED", {
              message: `${playerName} disconnected. ${Math.floor(
                timeToUse / 1000 / 60
              )} minutes remaining to reconnect.`,
              playerWhoLeft: playerName,
              roomKey: roomKey,
              timeout: timeToUse,
            });
          }
        }
      }
    });

    socket.on(
      "PLAYER_RECONNECT",
      (data: { roomKey: string; playerName: string }) => {
        const { roomKey, playerName } = data;
        const game = games.find((g) => g.roomKey === roomKey);

        if (game) {
          const player = game.players.find((p) => p.name === playerName);
          if (player && player.status === "disconnected") {
            if (player.disconnectedAt) {
              const timeElapsed = Date.now() - player.disconnectedAt.getTime();
              const timeUsed = Math.min(timeElapsed, player.reconnectBudget);

              player.reconnectBudget -= timeUsed;
              console.log(
                `⏰ ${playerName} used ${timeUsed}ms, ${player.reconnectBudget}ms remaining`
              );
            }

            if (player.reconnectTimer) {
              clearTimeout(player.reconnectTimer);
              player.reconnectTimer = undefined;
            }

            player.status = "connected";
            player.disconnectedAt = undefined;

            io.to(roomKey).emit("PLAYER_RECONNECTED", {
              message: `${playerName} reconnected!`,
              playerName: playerName,
              board: game.board,
              currentTurn: game.currentTurn,
              players: game.players.map((p) => p.name),
              scores: game.scores,
              status: game.status,
              winner: game.winner,
            });
          }
        }
      }
    );
  });

  return io;
};
