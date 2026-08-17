import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    return;
  }

  mongoose.connection.on("connected", () => console.log("MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err.message));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    console.error("Initial MongoDB connection failed:", err.message);
  }
}

// Mongoose buffers operations while disconnected, which makes requests hang
// instead of failing fast. Guard DB-touching routes with this so a dropped
// connection returns an immediate 503 rather than a multi-second timeout.
export function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database unavailable, try again shortly" });
  }
  next();
}
