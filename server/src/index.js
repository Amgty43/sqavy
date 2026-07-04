import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './db.js';
import { authRouter } from './routes/auth.js';
import { subjectsRouter } from './routes/subjects.js';
import { assignmentsRouter } from './routes/assignments.js';
import { pushRouter } from './routes/push.js';
import { scheduleDailyDigest, runDailyDigest } from './cron/dailyDigest.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/push', pushRouter);

// Manual trigger for local testing: POST /api/admin/run-digest
app.post('/api/admin/run-digest', async (req, res) => {
  await runDailyDigest();
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Homeroom API listening on http://localhost:${port}`);
  scheduleDailyDigest();
});
