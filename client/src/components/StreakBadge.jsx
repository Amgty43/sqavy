export default function StreakBadge({ streak }) {
  if (!streak) return null;
  return (
    <div className="streak-badge" title={`${streak} day streak of everything turned in on time`}>
      <span>🔥</span>
      <span>{streak}</span>
    </div>
  );
}
