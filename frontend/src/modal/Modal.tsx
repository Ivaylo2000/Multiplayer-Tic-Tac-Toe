import Button from "../components/Button";
import styles from "./Modal.module.scss";
import type { ChangeEvent } from "react";

interface ModalProps {
  type: "create" | "enter" | null;
  onClose: () => void;
  onRequest: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  roomKey: string;
  setRoomKey: (key: string) => void;
}

const Modal = ({
  type,
  onClose,
  onRequest,
  playerName,
  setPlayerName,
  roomKey,
  setRoomKey,
}: ModalProps) => {
  // Handle input changes
  const handlePlayerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleRoomKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomKey(e.target.value);
  };

  // Prevent modal from closing when clicking inside the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={handleModalClick}>
        <h1>{type === "create" ? "Create a Room" : "Enter a Room"}</h1>

        {/* Conditional rendering of inputs based on modal type */}
        {type === "create" ? (
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={handlePlayerNameChange}
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Paste room key"
              value={roomKey}
              onChange={handleRoomKeyChange}
            />
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={handlePlayerNameChange}
            />
          </>
        )}

        <div className={styles.actions}>
          <Button onClick={onRequest}>
            {type === "create" ? "Create" : "Enter"}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
