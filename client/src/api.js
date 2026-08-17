const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  listRepos: () => request("/api/repos"),
  addRepo: (owner, name) =>
    request("/api/repos", { method: "POST", body: JSON.stringify({ owner, name }) }),
  removeRepo: (id) => request(`/api/repos/${id}`, { method: "DELETE" }),
  listSummaries: (repoId) => request(`/api/repos/${repoId}/summaries`),
  generateSummary: (repoId, windowDays) =>
    request(`/api/repos/${repoId}/summaries`, {
      method: "POST",
      body: JSON.stringify({ windowDays }),
    }),
};
