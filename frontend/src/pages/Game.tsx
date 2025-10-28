// GamePage.tsx
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateBoard,
  setCurrentTurn,
  updatePlayers,
  // startGame,
  updateScores,
} from "../store/gameSlice";
import styles from "./GamePage.module.scss";
import GameBoard from "../components/GameBoard";

const GamePage = () => {
  const dispatch = useAppDispatch();

  const {
    board,
    currentTurn,
    playerName,
    players,
    roomKey,
    isCreator,
    scores,
  } = useAppSelector((state) => state.game);

  // Initialize WebSocket connection
  const { socket } = useSocket(roomKey || "", playerName || "");
  const [winner, setWinner] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<any>(null);
  // Listen for WebSocket events
  useEffect(() => {
    if (!socket) return;

    // When a player joins
    socket.on("PLAYER_JOINED", (data) => {
      console.log("Player joined:", data);
      dispatch(updatePlayers(data.players));
    });

    // When game starts
    // socket.on("GAME_STARTED", (data) => {
    //   console.log("Game started!");
    //   dispatch(startGame());
    // });

    // When a move is made
    socket.on("MOVE_MADE", (data) => {
      dispatch(updateBoard(data.board));
      dispatch(setCurrentTurn(data.currentTurn));

      if (data.scores) {
        dispatch(updateScores(data.scores));
      }

      if (data.winner) {
        setWinningLine(data.winningLine);
        console.log("winner", data.winner);
        setWinner(data.winner);
      } else {
        setWinner(null);
        setWinningLine(null);
      }
    });

    socket.on("CLEAR_BOARD", (data) => {
      dispatch(updateBoard(data.board));
      dispatch(setCurrentTurn(data.currentTurn));
      setWinningLine(null);
      if (data.scores) {
        dispatch(updateScores(data.scores));
      }
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

  const handleClearBoard = () => {
    if (socket && roomKey && isCreator) {
      socket.emit("CLEAR_BOARD", roomKey);
    }
  };

  async function copyToClipboard(text: string) {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  }

  return (
    <section className={styles["game-page-section"]}>
      {/* Show start button if creator and 2 players */}
      {isCreator && players.length === 2 && (
        <button onClick={handleStartGame} className={styles["start-button"]}>
          Start Game
        </button>
      )}

      {isCreator && winner && (
        <button onClick={handleClearBoard} className={styles["start-button"]}>
          Clear Board
        </button>
      )}

      {/* Show room key  */}
      {roomKey && players.length < 2 && (
        <div className={styles["room-link-holder"]}>
          {copied ? (
            <p
              className={`${styles["copied-notification"]} ${styles["fade-in-out"]}`}
            >
              Text copied!
            </p>
          ) : (
            ""
          )}
          <h1> Room key: {roomKey}</h1>
          <button
            onClick={() => copyToClipboard(roomKey)}
            className={styles["room-link"]}
          >
            copy Room Link
          </button>
        </div>
      )}

      <div className={styles["players-score"]}>
        <div className={styles["player-one"]}>
          <h2>score: {scores[players[0]] || 0}</h2>
          <h1>
            {players[0]} - X {currentTurn === players[0] && "👈"}
          </h1>
        </div>
        <div className={styles["player-two"]}>
          <h2>score: {scores[players[1]] || 0}</h2>
          <h1>
            {players[1]} - O {currentTurn === players[1] && "👈"}
          </h1>
        </div>
      </div>
      <GameBoard
        board={board}
        onCellClick={handleCellClick}
        currentTurn={currentTurn}
        playerName={playerName}
        players={players}
        winner={winner}
        winningLine={winningLine}
      />
    </section>
  );
};

export default GamePage;
