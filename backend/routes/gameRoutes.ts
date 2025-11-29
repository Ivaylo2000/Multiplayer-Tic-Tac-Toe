import express from "express";
import {
  chechExistingGame,
  createGame,
  joinGame,
  showRooms,
} from "../controllers/gameController";

const router = express.Router();

router.post("/creategame", createGame);

router.post("/joingame", joinGame);

router.get("/showrooms", showRooms);

router.get("/checkexistinggame/:roomKey", chechExistingGame);
export default router;
