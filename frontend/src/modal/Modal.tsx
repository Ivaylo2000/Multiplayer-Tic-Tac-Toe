import Button from "../components/Button";
import Input from "../components/Input";
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
  const handlePlayerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleRoomKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomKey(e.target.value);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={handleModalClick}>
        <h1>{type === "create" ? "Create a Room" : "Enter a Room"}</h1>

        {type === "create" ? (
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={handlePlayerNameChange}
            className={styles.input}
          />
        ) : (
          <>
            <Input
              type="text"
              name="roomkey"
              placeholder="Paste room key"
              value={roomKey}
              onChange={handleRoomKeyChange}
            />

            <Input
              type="text"
              name="nickname"
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
