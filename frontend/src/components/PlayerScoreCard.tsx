import arrowLeft from "../assets/arrow-left.png";

interface PlayerScoreCardProps {
  playerName: string;
  symbol: string;
  score: number;
  isCurrentTurn: boolean;
  playerClass: string;
  nameArrowClass: string;
  visibleClass: string;
}

const PlayerScoreCard = ({
  playerName,
  symbol,
  score,
  isCurrentTurn,
  playerClass,
  nameArrowClass,
  visibleClass,
}: PlayerScoreCardProps) => {
  return (
    <div className={playerClass}>
      <h2>score: {score}</h2>
      <div className={nameArrowClass}>
        <h1>
          {playerName} - {symbol}
        </h1>
        <img
          src={arrowLeft}
          alt="Current turn"
          className={isCurrentTurn ? visibleClass : undefined}
        />
      </div>
    </div>
  );
};

export default PlayerScoreCard;
