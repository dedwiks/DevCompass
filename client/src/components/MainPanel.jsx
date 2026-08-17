import { useState } from "react";
import SummaryCard from "./SummaryCard.jsx";

const WINDOW_OPTIONS = [1, 3, 7];

export default function MainPanel({ repo, summaries, loading, onGenerate }) {
  const [windowDays, setWindowDays] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      await onGenerate(windowDays);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (!repo) {
    return (
      <main className="main-panel">
        <p className="empty-hint centered">Select or add a repo to get started</p>
      </main>
    );
  }

  return (
    <main className="main-panel">
      <div className="main-panel-header">
        <h2>{repo.owner}/{repo.name}</h2>
        <div className="generate-controls">
          <select value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))}>
            {WINDOW_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Last {d} day{d > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating… (server may be waking up)" : "Generate summary"}
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-feed">
        {loading && <p className="empty-hint">Loading summaries…</p>}
        {!loading && summaries.length === 0 && (
          <p className="empty-hint">No summaries yet — generate the first one above</p>
        )}
        {summaries.map((s) => (
          <SummaryCard key={s._id} summary={s} />
        ))}
      </div>
    </main>
  );
}
