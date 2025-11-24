import Button from "../components/Button";
import styles from "./HomePage.module.scss";
import { useEffect, useState } from "react";
import Modal from "../modal/Modal";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "../store/gameThunks";
import { useAppDispatch } from "../store/hooks";
import toast from "react-hot-toast";

const HomePage = () => {
  const [modalType, setModalType] = useState<"create" | "enter" | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [roomKey, setRoomKey] = useState<string>("");
  const [hasPendingGame, setHasPendingGame] = useState(false);
  const [pendingGame, setPendingGame] = useState<any>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const checkPendingGame = async () => {
      const pending = localStorage.getItem("pendingRejoin");
      if (pending) {
        const gameInfo = JSON.parse(pending);
        setRoomKey(gameInfo.roomKey);

        if (Date.now() - gameInfo.disconnectedAt < 120000) {
          try {
            const API_URL =
              import.meta.env.VITE_API_URL || "http://localhost:3000";
            const res = await fetch(
              `${API_URL}/api/games/checkexistinggame/${gameInfo.roomKey}`
            );
            const data = await res.json();

            if (data.exists) {
              setPendingGame(gameInfo);
              setHasPendingGame(true);
            } else {
              localStorage.removeItem("pendingRejoin");
              setHasPendingGame(false);
            }
          } catch (error) {
            localStorage.removeItem("pendingRejoin");
            setHasPendingGame(false);
          }
        } else {
          localStorage.removeItem("pendingRejoin");
          setHasPendingGame(false);
        }
      } else {
        setHasPendingGame(false);
      }
    };

    checkPendingGame();

    const interval = setInterval(checkPendingGame, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRejoin = () => {
    navigate(`/game/${roomKey}`, {
      state: {
        rejoin: true,
        roomKey: pendingGame.roomKey,
        playerName: pendingGame.playerName,
      },
    });
  };

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter a valid name!");
      return;
    }

    try {
      const result = await dispatch(createGame(playerName)).unwrap();

      navigate(`/game/${result.roomKey}`);
    } catch (error) {
      toast.error("Failed to create game!");
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomKey.trim()) {
      toast.error("Please enter both name and room key!");
      return;
    }

    try {
      const result = await dispatch(joinGame({ playerName, roomKey })).unwrap();
      navigate(`/game/${result.roomKey}`);
    } catch (error: any) {
      const errorData = JSON.parse(error.message);
      toast.error(errorData.message);
    }
  };

  const onRequest = () => {
    if (modalType === "create") {
      handleCreateGame();
    } else if (modalType === "enter") {
      handleJoinGame();
    }
  };
  return (
    <section className={styles["home-section"]}>
      <div className={styles.heading}>
        <h1>
          Hello ready to play some <br /> Tic-Tac-Toe
        </h1>
      </div>

      <div className={styles["button-holder"]}>
        {hasPendingGame ? (
          <Button onClick={() => handleRejoin()}>Rejoin Room</Button>
        ) : (
          <>
            <Button onClick={() => setModalType("create")}>Create Room</Button>
            <Button onClick={() => setModalType("enter")}>Enter Room</Button>
          </>
        )}
      </div>
      {modalType && (
        <Modal
          type={modalType}
          onClose={() => setModalType(null)}
          onRequest={onRequest}
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomKey={roomKey}
          setRoomKey={setRoomKey}
        />
      )}
    </section>
  );
};

export default HomePage;
