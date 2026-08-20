import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, requireDB } from "./db.js";
import reposRouter from "./routes/repos.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Render sits behind a reverse proxy that sets X-Forwarded-For. Without this,
// express-rate-limit's IP validation throws on every request (an unhandled
// rejection that crashes the process) instead of just rate-limiting by IP.
app.set("trust proxy", 1);

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/repos", requireDB, reposRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`DevPulse AI server listening on port ${PORT}`));
});
