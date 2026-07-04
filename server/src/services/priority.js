import { db } from '../db.js';

// Dates are stored as 'YYYY-MM-DD' strings, which compare correctly as plain strings.
export function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function priorityFor(dueDate, completed) {
  if (completed) return 'done';
  const t = today();
  if (dueDate < t) return 'overdue';
  if (dueDate === t) return 'due_today';
  if (dueDate <= addDays(t, 2)) return 'due_soon';
  return 'upcoming';
}

// Consecutive days (walking backward from yesterday) where every assignment
// due that day was completed. Days with no assignments due are skipped and
// don't break the streak. Stops at the first day with an incomplete assignment.
export function computeStreak(userId) {
  const rows = db
    .prepare(
      `SELECT due_date, completed FROM assignments
       WHERE user_id = ? AND due_date < ?
       ORDER BY due_date DESC`
    )
    .all(userId, today());

  const byDate = new Map();
  for (const row of rows) {
    if (!byDate.has(row.due_date)) byDate.set(row.due_date, []);
    byDate.get(row.due_date).push(!!row.completed);
  }

  const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1));
  let streak = 0;
  for (const date of dates) {
    const allDone = byDate.get(date).every(Boolean);
    if (!allDone) break;
    streak += 1;
  }
  return streak;
}
