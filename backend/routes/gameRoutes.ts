import express from "express";
import { createGame, joinGame } from "../controllers/gameController";

const router = express.Router();

router.post("/creategame", createGame);

router.post("/joingame", joinGame);

export default router;
