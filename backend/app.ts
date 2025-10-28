// backend/app.ts
import express from "express";
import cors from "cors";
import http from "http";
import gameRoutes from "./routes/gameRoutes";
import bodyParser from "body-parser";
import { setupSocketIO } from "./sockets/gameSocket";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// Routes
app.use("/api/games", gameRoutes);

// Create HTTP server and setup Socket.io
const server = http.createServer(app);
const io = setupSocketIO(server);
app.set("io", io);
// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
