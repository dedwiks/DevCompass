import { Router } from "express";
import rateLimit from "express-rate-limit";
import Repo from "../models/Repo.js";
import Summary from "../models/Summary.js";
import { fetchRepoActivity } from "../services/githubService.js";
import { generateSummary } from "../services/geminiService.js";

const router = Router();

const summaryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many summary requests, please try again later" },
});

router.get("/", async (req, res) => {
  const repos = await Repo.find().sort({ createdAt: -1 });
  res.json(repos);
});

router.post("/", async (req, res) => {
  const { owner, name } = req.body;
  if (!owner?.trim() || !name?.trim()) {
    return res.status(400).json({ error: "owner and name are required" });
  }

  try {
    const repo = await Repo.create({ owner: owner.trim(), name: name.trim() });
    res.status(201).json(repo);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Repo is already tracked" });
    }
    res.status(500).json({ error: "Failed to add repo" });
  }
});

router.delete("/:id", async (req, res) => {
  await Repo.findByIdAndDelete(req.params.id);
  await Summary.deleteMany({ repoId: req.params.id });
  res.status(204).send();
});

router.post("/:id/summaries", summaryLimiter, async (req, res) => {
  const windowDays = Number(req.body.windowDays) || 7;
  if (![1, 3, 7].includes(windowDays)) {
    return res.status(400).json({ error: "windowDays must be 1, 3, or 7" });
  }

  const repo = await Repo.findById(req.params.id);
  if (!repo) {
    return res.status(404).json({ error: "Repo not found" });
  }

  try {
    const activity = await fetchRepoActivity(repo.owner, repo.name, windowDays);
    const ai = await generateSummary(repo.owner, repo.name, windowDays, activity);

    const summary = await Summary.create({
      repoId: repo._id,
      ...ai,
      activityCounts: activity.counts,
      windowDays,
    });

    res.status(201).json(summary);
  } catch (err) {
    console.error("Summary generation failed:", err.message);
    res.status(502).json({ error: "Failed to generate summary" });
  }
});

router.get("/:id/summaries", async (req, res) => {
  const summaries = await Summary.find({ repoId: req.params.id }).sort({ createdAt: -1 });
  res.json(summaries);
});

export default router;
