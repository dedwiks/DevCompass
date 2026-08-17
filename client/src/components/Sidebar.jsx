import { useState } from "react";

export default function Sidebar({ repos, selectedId, onSelect, onAdd, onRemove }) {
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!owner.trim() || !name.trim()) return;
    setAdding(true);
    setError("");
    try {
      await onAdd(owner.trim(), name.trim());
      setOwner("");
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <aside className="sidebar">
      <h2>Tracked repos</h2>

      <form className="add-repo-form" onSubmit={handleSubmit}>
        <input
          placeholder="owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <input
          placeholder="repo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={adding}>
          {adding ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <ul className="repo-list">
        {repos.length === 0 && <li className="empty-hint">No repos tracked yet</li>}
        {repos.map((repo) => (
          <li
            key={repo._id}
            className={repo._id === selectedId ? "repo-item selected" : "repo-item"}
          >
            <button className="repo-select" onClick={() => onSelect(repo._id)}>
              {repo.owner}/{repo.name}
            </button>
            <button
              className="repo-remove"
              title="Remove repo"
              onClick={() => onRemove(repo._id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
