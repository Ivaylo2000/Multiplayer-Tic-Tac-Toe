import Button from "../components/Button";
import styles from "./HomePage.module.scss";
import { useState } from "react";
import Modal from "../modal/Modal";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "../store/gameThunks";
import { useAppDispatch } from "../store/hooks";

const HomePage = () => {
  const [modalType, setModalType] = useState<"create" | "enter" | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [roomKey, setRoomKey] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert("Please enter a valid name!");
      return;
    }

    try {
      const result = await dispatch(createGame(playerName)).unwrap();

      navigate(`/game/${result.roomKey}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      alert("Failed to create game!");
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomKey.trim()) {
      alert("Please enter both name and room key!");
      return;
    }

    try {
      const result = await dispatch(joinGame({ playerName, roomKey })).unwrap();

      navigate(`/game/${result.roomKey}`);
    } catch (error) {
      console.error("Failed to join game:", error);
      alert("Failed to join game!");
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
        <Button onClick={() => setModalType("create")}>Create Room</Button>
        <Button onClick={() => setModalType("enter")}>Enter Room</Button>
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
