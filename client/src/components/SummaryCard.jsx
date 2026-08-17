function BulletList({ title, items, emptyText }) {
  return (
    <div className="bullet-group">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="empty-hint">{emptyText}</p>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SummaryCard({ summary }) {
  const { highlights, inProgress, blockers, summaryText, activityCounts, windowDays, createdAt } =
    summary;

  return (
    <article className="summary-card">
      <div className="summary-card-header">
        <span>Last {windowDays} day(s)</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>

      <p className="summary-text">{summaryText}</p>

      <BulletList title="Highlights" items={highlights} emptyText="Nothing notable" />
      <BulletList title="In progress" items={inProgress} emptyText="Nothing in flight" />
      <BulletList title="Blockers" items={blockers} emptyText="No blockers detected" />

      <div className="activity-counts">
        {activityCounts.commits} commits · {activityCounts.prs} PRs · {activityCounts.issues}{" "}
        issues
      </div>
    </article>
  );
}
