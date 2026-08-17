const GITHUB_API = "https://api.github.com";
const PER_PAGE = 50;

function authHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubGet(path, params) {
  const url = new URL(`${GITHUB_API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchCommits(owner, name, since) {
  const commits = await githubGet(`/repos/${owner}/${name}/commits`, {
    since,
    per_page: PER_PAGE,
  });
  return commits.map((c) => ({
    type: "commit",
    message: c.commit?.message?.split("\n")[0] ?? "",
    author: c.commit?.author?.name ?? c.author?.login ?? "unknown",
    url: c.html_url,
    timestamp: c.commit?.author?.date ?? null,
  }));
}

async function fetchPullRequests(owner, name, since) {
  const prs = await githubGet(`/repos/${owner}/${name}/pulls`, {
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: PER_PAGE,
  });
  const sinceTime = new Date(since).getTime();
  return prs
    .filter((pr) => new Date(pr.updated_at).getTime() >= sinceTime)
    .map((pr) => ({
      type: "pr",
      title: pr.title,
      author: pr.user?.login ?? "unknown",
      state: pr.merged_at ? "merged" : pr.state,
      url: pr.html_url,
      timestamp: pr.updated_at,
    }));
}

async function fetchIssues(owner, name, since) {
  const issues = await githubGet(`/repos/${owner}/${name}/issues`, {
    state: "all",
    since,
    per_page: PER_PAGE,
  });
  // The issues endpoint also returns PRs; exclude anything with a pull_request field.
  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      type: "issue",
      title: issue.title,
      author: issue.user?.login ?? "unknown",
      state: issue.state,
      url: issue.html_url,
      timestamp: issue.updated_at,
    }));
}

export async function fetchRepoActivity(owner, name, windowDays) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const [commits, prs, issues] = await Promise.all([
    fetchCommits(owner, name, since),
    fetchPullRequests(owner, name, since),
    fetchIssues(owner, name, since),
  ]);

  return {
    commits,
    prs,
    issues,
    counts: { commits: commits.length, prs: prs.length, issues: issues.length },
  };
}
