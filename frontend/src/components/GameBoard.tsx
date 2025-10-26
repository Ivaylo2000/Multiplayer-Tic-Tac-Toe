import styles from "./GameBoard.module.scss";
import elipse from "../assets/elipse.png";
import cross from "../assets/cross.png";
interface GameBoardProps {
  board: number[][];
  currentTurn: string | null;
  playerName: string | null;
  players: string[];
  onCellClick: (row: number, col: number) => void;
}

const GameBoard = ({
  board,
  onCellClick,
  currentTurn,
  playerName,
  players,
}: GameBoardProps) => {
  const handleClick = (row: number, col: number) => {
    console.log({ currentTurn, playerName });
    if (currentTurn === playerName && board && board[row][col] === 0) {
      onCellClick(row, col);
    }
  };

  return (
    <section>
      {players && players.length === 2 ? (
        <div className={styles["board"]}>
          <ul className={styles["lists-container"]}>
            <div className={styles["winning-line"]}></div>
            {board &&
              board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <li
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleClick(rowIndex, colIndex)}
                    className={styles.list}
                  >
                    {cell === 0 ? (
                      ""
                    ) : cell === 1 ? (
                      <img src={elipse} alt="" />
                    ) : (
                      <img src={cross} alt="" />
                    )}
                  </li>
                ))
              )}
          </ul>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default GameBoard;
