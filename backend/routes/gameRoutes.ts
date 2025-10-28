import express from "express";
import { createGame, joinGame, getGames } from "../controllers/gameController";

const router = express.Router();

router.post("/creategame", createGame);

router.post("/joingame", joinGame);

router.get("/kur", getGames);

export default router;
