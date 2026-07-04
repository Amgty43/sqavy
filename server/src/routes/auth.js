import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

export const authRouter = Router();

const DEFAULT_SUBJECTS = [
  { name: 'Math', color: '#2563eb' },
  { name: 'English', color: '#7c3aed' },
  { name: 'Science', color: '#059669' },
  { name: 'History', color: '#d97706' },
];

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

authRouter.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const insert = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  );
  const { lastInsertRowid: userId } = insert.run(name.trim(), normalizedEmail, passwordHash);

  const insertSubject = db.prepare(
    'INSERT INTO subjects (user_id, name, color) VALUES (?, ?, ?)'
  );
  for (const subject of DEFAULT_SUBJECTS) {
    insertSubject.run(userId, subject.name, subject.color);
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(userId), user: publicUser(user) });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: signToken(user.id), user: publicUser(user) });
});

authRouter.get('/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});
