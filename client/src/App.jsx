import { useEffect, useState } from "react";
import { api } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import MainPanel from "./components/MainPanel.jsx";
import "./App.css";

export default function App() {
  const [repos, setRepos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  useEffect(() => {
    api.listRepos().then(setRepos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSummaries([]);
      return;
    }
    setLoadingSummaries(true);
    api
      .listSummaries(selectedId)
      .then(setSummaries)
      .catch(() => setSummaries([]))
      .finally(() => setLoadingSummaries(false));
  }, [selectedId]);

  async function handleAdd(owner, name) {
    const repo = await api.addRepo(owner, name);
    setRepos((prev) => [repo, ...prev]);
    setSelectedId(repo._id);
  }

  async function handleRemove(id) {
    await api.removeRepo(id);
    setRepos((prev) => prev.filter((r) => r._id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  async function handleGenerate(windowDays) {
    const summary = await api.generateSummary(selectedId, windowDays);
    setSummaries((prev) => [summary, ...prev]);
  }

  const selectedRepo = repos.find((r) => r._id === selectedId) || null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="wordmark">
          <h1>devpulse</h1>
          <span className="tagline">standup summaries from repo activity</span>
        </div>
        <div className="header-right">
          <a
            className="companion-link"
            href="https://task-it-three.vercel.app/"
            target="_blank"
            rel="noreferrer"
          >
            TaskIt (Slack bot) →
          </a>
          <span className="badge">{repos.length} repo{repos.length === 1 ? "" : "s"} tracked</span>
        </div>
      </header>
      <div className="app-body">
        <Sidebar
          repos={repos}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
        <MainPanel
          repo={selectedRepo}
          summaries={summaries}
          loading={loadingSummaries}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
