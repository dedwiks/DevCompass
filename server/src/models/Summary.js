import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true, index: true },
  highlights: { type: [String], default: [] },
  inProgress: { type: [String], default: [] },
  blockers: { type: [String], default: [] },
  summaryText: { type: String, default: "" },
  activityCounts: {
    commits: { type: Number, default: 0 },
    prs: { type: Number, default: 0 },
    issues: { type: Number, default: 0 },
  },
  windowDays: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Summary", summarySchema);
