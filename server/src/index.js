import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB, requireDB } from "./db.js";
import reposRouter from "./routes/repos.js";

const app = express();
const PORT = process.env.PORT || 5000;

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
