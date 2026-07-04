import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const subjectsRouter = Router();
subjectsRouter.use(requireAuth);

export const SUBJECT_COLORS = [
  '#2563eb', // blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#ea580c', // orange
  '#d97706', // amber
  '#059669', // green
  '#0891b2', // teal
  '#4f46e5', // indigo
];

subjectsRouter.get('/', (req, res) => {
  const subjects = db
    .prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY name COLLATE NOCASE')
    .all(req.userId);
  res.json({ subjects, palette: SUBJECT_COLORS });
});

subjectsRouter.post('/', (req, res) => {
  const { name, color } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Subject name is required' });
  const chosenColor = SUBJECT_COLORS.includes(color) ? color : SUBJECT_COLORS[0];
  const { lastInsertRowid } = db
    .prepare('INSERT INTO subjects (user_id, name, color) VALUES (?, ?, ?)')
    .run(req.userId, name.trim(), chosenColor);
  const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ subject });
});

subjectsRouter.put('/:id', (req, res) => {
  const subject = db
    .prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const name = req.body?.name?.trim() || subject.name;
  const color = SUBJECT_COLORS.includes(req.body?.color) ? req.body.color : subject.color;
  db.prepare('UPDATE subjects SET name = ?, color = ? WHERE id = ?').run(name, color, subject.id);
  res.json({ subject: db.prepare('SELECT * FROM subjects WHERE id = ?').get(subject.id) });
});

subjectsRouter.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Subject not found' });
  res.status(204).end();
});
