import webpush from 'web-push';
import { db } from '../db.js';

let configured = false;
let warned = false;

function ensureConfigured() {
  if (configured) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    if (!warned) {
      console.warn('[push] VAPID keys not set — skipping push notifications.');
      warned = true;
    }
    return false;
  }
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  configured = true;
  return true;
}

export async function sendPushToUser(userId, payload) {
  if (!ensureConfigured()) return 0;
  const subs = db
    .prepare('SELECT * FROM push_subscriptions WHERE user_id = ?')
    .all(userId);

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(JSON.parse(sub.subscription_json), JSON.stringify(payload));
      sent += 1;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(sub.id);
      } else {
        console.error('[push] send failed:', err.message);
      }
    }
  }
  return sent;
}
