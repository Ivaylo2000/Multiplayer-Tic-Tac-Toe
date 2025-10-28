import { Request, Response } from "express";
import { games, Game, Board } from "../gamesandkeys/gamesandkeys";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

export const createGame = (req: Request, res: Response) => {
  const { playerName } = req.body;

  if (!playerName) {
    return res.status(400).json({ message: "Player name is required" });
  }

  const roomKey = uuidv4();
  const expirationTime = moment().add(10, "minutes");
  const gameId = uuidv4();

  const board: Board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  const newGame: Game = {
    id: gameId,
    playerName,
    roomKey: roomKey,
    status: "waiting",
    expirationTime: expirationTime.toISOString(),
    board,
    currentTurn: playerName,
    starterIndex: 0,
    players: [playerName],
    scores: { [playerName]: 0 },
  };

  games.push(newGame);

  res.status(201).json({
    roomKey: newGame.roomKey,
    playerName: newGame.playerName,
    players: newGame.players,
  });
};
export const getGames = (req: Request, res: Response) => {
  res.status(201).json({
    games,
  });
};

export const joinGame = (req: Request, res: Response) => {
  const { playerName, roomKey } = req.body;

  const existingGame = games.find((game) => game.roomKey === roomKey);

  if (!existingGame) {
    return res.status(400).json({ message: "Game Not Found" });
  }

  const currentTime = moment();
  if (moment(existingGame.expirationTime).isBefore(currentTime)) {
    return res.status(400).json({ message: "Game has expired" });
  }

  if (existingGame.players.length >= 2) {
    return res.status(400).json({ message: "Game is full" });
  }

  if (!playerName) {
    return res.status(400).json({ message: "Player name is required" });
  }

  existingGame.scores[playerName] = 0;
  existingGame.players.push(playerName);
  const io = req.app.get("io");
  io.to(roomKey).emit("PLAYER_JOINED", {
    players: existingGame.players,
    newPlayer: playerName,
  });

  if (existingGame.players.length === 2) {
    existingGame.status = "in progress";
  }
  console.log(games);
  res.status(201).json({
    players: existingGame.players,
    roomKey: roomKey,
  });
};
