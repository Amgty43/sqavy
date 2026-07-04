import cron from 'node-cron';
import { db } from '../db.js';
import { today } from '../services/priority.js';
import { sendDigestEmail } from '../services/email.js';
import { sendPushToUser } from '../services/push.js';

export async function runDailyDigest() {
  const t = today();
  const users = db.prepare('SELECT id, name, email FROM users').all();

  for (const user of users) {
    const overdue = db
      .prepare(
        `SELECT a.*, s.name AS subjectName FROM assignments a
         LEFT JOIN subjects s ON s.id = a.subject_id
         WHERE a.user_id = ? AND a.completed = 0 AND a.due_date < ?`
      )
      .all(user.id, t);
    const dueToday = db
      .prepare(
        `SELECT a.*, s.name AS subjectName FROM assignments a
         LEFT JOIN subjects s ON s.id = a.subject_id
         WHERE a.user_id = ? AND a.completed = 0 AND a.due_date = ?`
      )
      .all(user.id, t);

    if (overdue.length === 0 && dueToday.length === 0) continue;

    await sendDigestEmail(user, { overdue, dueToday }).catch((err) =>
      console.error(`[digest] email failed for user ${user.id}:`, err.message)
    );

    const count = overdue.length + dueToday.length;
    await sendPushToUser(user.id, {
      title: 'Homeroom',
      body: `${count} assignment${count === 1 ? '' : 's'} need attention today.`,
    }).catch((err) => console.error(`[digest] push failed for user ${user.id}:`, err.message));
  }
}

export function scheduleDailyDigest() {
  const hour = Number(process.env.DIGEST_HOUR) || 7;
  const minute = Number(process.env.DIGEST_MINUTE) || 0;
  const expression = `${minute} ${hour} * * *`;
  cron.schedule(expression, () => {
    runDailyDigest().catch((err) => console.error('[digest] run failed:', err));
  });
  console.log(`[digest] scheduled daily at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
}
