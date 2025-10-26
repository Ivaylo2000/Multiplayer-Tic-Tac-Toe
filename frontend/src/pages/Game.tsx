// GamePage.tsx
import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateBoard,
  setCurrentTurn,
  updatePlayers,
  startGame,
} from "../store/gameSlice";
import styles from "./GamePage.module.scss";
import GameBoard from "../components/GameBoard";

const GamePage = () => {
  const dispatch = useAppDispatch();

  const { board, currentTurn, playerName, players, roomKey, isCreator } =
    useAppSelector((state) => state.game);

  // Initialize WebSocket connection
  const { socket } = useSocket(roomKey || "", playerName || "");

  // Listen for WebSocket events
  useEffect(() => {
    if (!socket) return;

    // When a player joins
    socket.on("PLAYER_JOINED", (data) => {
      console.log("Player joined:", data);
      dispatch(updatePlayers(data.players));
    });

    // When game starts
    socket.on("GAME_STARTED", (data) => {
      console.log("Game started!");
      dispatch(startGame());
    });

    // When a move is made
    socket.on("MOVE_MADE", (data) => {
      console.log("Move made:", data);
      // Update board and current turn from server
      dispatch(updateBoard(data.board));
      dispatch(setCurrentTurn(data.currentTurn));
    });

    // Clean up listeners
    return () => {
      socket.off("PLAYER_JOINED");
      socket.off("GAME_STARTED");
      socket.off("MOVE_MADE");
    };
  }, [socket, dispatch]);

  const handleCellClick = (row: number, col: number) => {
    if (socket && roomKey && playerName) {
      // Send move to server via WebSocket
      socket.emit("MAKE_MOVE", {
        roomKey,
        row,
        col,
        player: playerName,
      });
    }
  };

  const handleStartGame = () => {
    if (socket && roomKey && isCreator) {
      socket.emit("START_GAME", roomKey);
    }
  };

  return (
    <section className={styles["game-page-section"]}>
      {/* Show start button if creator and 2 players */}
      {isCreator && players.length === 2 && (
        <button onClick={handleStartGame} className={styles["start-button"]}>
          Start Game
        </button>
      )}

      <div className={styles["players-score"]}>
        <div className={styles["player-one"]}>
          <h2>score: 0</h2>
          <h1>
            {players[0]} - X {currentTurn === players[0] && "👈"}
          </h1>
        </div>
        <div className={styles["player-two"]}>
          <h2>score: 0</h2>
          <h1>
            {players[1] || "Waiting..."} - O{" "}
            {currentTurn === players[1] && "👈"}
          </h1>
        </div>
      </div>
      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        currentTurn={currentTurn}
        playerName={playerName}
        players={players}
      />
    </section>
  );
};

export default GamePage;
