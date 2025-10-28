import styles from "./GameBoard.module.scss";
import elipse from "../assets/elipse.png";
import cross from "../assets/cross.png";
interface GameBoardProps {
  board: number[][];
  currentTurn: string | null;
  playerName: string | null;
  players: string[];
  onCellClick: (row: number, col: number) => void;
  winner: string | null;
  winningLine: any;
}

const GameBoard = ({
  board,
  onCellClick,
  currentTurn,
  playerName,
  players,
  winner,
  winningLine,
}: GameBoardProps) => {
  const handleClick = (row: number, col: number) => {
    console.log({ currentTurn, playerName });
    if (currentTurn === playerName && board && board[row][col] === 0) {
      onCellClick(row, col);
    }
  };
  const getLineStyle = () => {
    if (!winningLine) return {};

    switch (winningLine.type) {
      case "row":
        // Horizontal lines - adjust top position
        const topPosition =
          winningLine.index === 0
            ? "15%"
            : winningLine.index === 1
            ? "50%"
            : "85%";
        return {
          top: topPosition,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "15px",
          rotate: "0deg",
        };

      case "column":
        // Vertical lines - adjust left position
        const leftPosition =
          winningLine.index === 0
            ? "15%"
            : winningLine.index === 1
            ? "50%"
            : "85%";
        return {
          top: "50%",
          left: leftPosition,
          transform: "translate(-50%, -50%) rotate(90deg)",
          width: "100%",
          height: "15px",
        };

      case "diagonal":
        if (winningLine.direction === "main") {
          // Diagonal from top-left to bottom-right
          return {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: "100%", // Longer for diagonal
            height: "15px",
          };
        } else {
          // Diagonal from top-right to bottom-left
          return {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            width: "100%",
            height: "15px",
          };
        }

      default:
        return {};
    }
  };
  return (
    <section>
      {players && players.length === 2 ? (
        <div className={styles["board"]}>
          <ul className={styles["lists-container"]}>
            {winner && winningLine && (
              <div className={styles["winning-line"]} style={getLineStyle()} />
            )}
            {board &&
              board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <li
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleClick(rowIndex, colIndex)}
                    className={
                      winningLine
                        ? `${styles.list} ${styles.locked}`
                        : styles.list
                    }
                  >
                    {cell === 0 ? (
                      ""
                    ) : cell === 1 ? (
                      <img src={cross} alt="" />
                    ) : (
                      <img src={elipse} alt="" />
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
