import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
  owner: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

repoSchema.index({ owner: 1, name: 1 }, { unique: true });

export default mongoose.model("Repo", repoSchema);
