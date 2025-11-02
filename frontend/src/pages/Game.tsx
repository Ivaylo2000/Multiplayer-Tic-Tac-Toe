import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateBoard,
  setCurrentTurn,
  updatePlayers,
  updateScores,
  resetGame,
} from "../store/gameSlice";
import styles from "./GamePage.module.scss";
import GameBoard from "../components/GameBoard";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import PlayerScoreCard from "../components/PlayerScoreCard";

interface PlayerJoinedData {
  message: string;
  newPlayer: string;
  players: string[];
}

interface ClearBoardData {
  board: number[][];
  currentTurn: string;
  scores: { [playerName: string]: number };
  status: string;
  winner: string | null;
}

interface MoveMadeData extends ClearBoardData {
  playerWhoMoved: string;
  winningLine: any | null;
}

interface RoomClosedData {
  message: string;
  playerWhoLeft: string;
  reason: string;
}

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

  const { socket } = useSocket(roomKey || "", playerName || "");
  const [winner, setWinner] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  const startInactivityTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (socket && roomKey) {
        socket.emit("ROOM_INACTIVITY_CLOSE", roomKey);
      }
      dispatch(resetGame());
      alert("Game ended due to 3 minutes of inactivity");
      navigate("/");
    }, 180000);
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  useEffect(() => {
    if (!socket) return;

    startInactivityTimer();

    socket.on("PLAYER_JOINED", (data: PlayerJoinedData) => {
      const { players } = data;
      dispatch(updatePlayers(players));
    });

    socket.on("MOVE_MADE", (data: MoveMadeData) => {
      const { board, currentTurn, scores, winner, winningLine } = data;
      dispatch(updateBoard(board));
      dispatch(setCurrentTurn(currentTurn));

      if (scores) {
        dispatch(updateScores(scores));
      }

      if (winner) {
        setWinningLine(winningLine);
        setWinner(winner);
      } else {
        setWinner(null);
        setWinningLine(null);
      }

      resetInactivityTimer();
    });

    socket.on("CLEAR_BOARD", (data: ClearBoardData) => {
      const { board, currentTurn, scores } = data;

      dispatch(updateBoard(board));
      dispatch(setCurrentTurn(currentTurn));
      setWinningLine(null);
      setWinner(null);
      if (scores) {
        dispatch(updateScores(scores));
      }

      resetInactivityTimer();
    });

    socket.on("ROOM_CLOSED", (data: RoomClosedData) => {
      const { message, playerWhoLeft } = data;
      dispatch(resetGame());
      alert(`Game ended: ${message} player - ${playerWhoLeft} left the lobby`);
      navigate("/");
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      socket.off("PLAYER_JOINED");
      socket.off("GAME_STARTED");
      socket.off("MOVE_MADE");
      socket.off("ROOM_CLOSED");
    };
  }, [socket, dispatch]);

  const handleCellClick = (row: number, col: number) => {
    if (socket && roomKey && playerName) {
      socket.emit("MAKE_MOVE", {
        roomKey,
        row,
        col,
        player: playerName,
      });
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
      {isCreator && winner && (
        <Button onClick={handleClearBoard} className={styles["clear-button"]}>
          Clear Board
        </Button>
      )}

      {roomKey && players.length < 2 && (
        <div className={styles["room-link-holder"]}>
          {copied && (
            <p
              className={`${styles["copied-notification"]} ${styles["fade-in-out"]}`}
            >
              Text copied!
            </p>
          )}
          <h1> Room key: {roomKey}</h1>
          <Button
            onClick={() => copyToClipboard(roomKey)}
            className={styles["room-link"]}
          >
            Copy Room Link
          </Button>
        </div>
      )}

      <div className={styles["players-score"]}>
        {players.map((player, index) => (
          <PlayerScoreCard
            key={player}
            playerName={player}
            symbol={index === 0 ? "X" : "O"}
            score={scores[player] || 0}
            isCurrentTurn={currentTurn === player}
            playerClass={styles.player}
            nameArrowClass={styles["player-name-arrow"]}
            visibleClass={styles.visible}
          />
        ))}
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
