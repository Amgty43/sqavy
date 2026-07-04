import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const pushRouter = Router();
pushRouter.use(requireAuth);

pushRouter.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

pushRouter.post('/subscribe', (req, res) => {
  const subscription = req.body?.subscription;
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'A valid push subscription is required' });
  }
  db.prepare(
    `INSERT INTO push_subscriptions (user_id, endpoint, subscription_json)
     VALUES (?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, subscription_json = excluded.subscription_json`
  ).run(req.userId, subscription.endpoint, JSON.stringify(subscription));
  res.status(201).json({ ok: true });
});

pushRouter.post('/unsubscribe', (req, res) => {
  const endpoint = req.body?.endpoint;
  if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });
  db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?').run(
    endpoint,
    req.userId
  );
  res.status(204).end();
});
