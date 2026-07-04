import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { priorityFor, computeStreak, today } from '../services/priority.js';

export const assignmentsRouter = Router();
assignmentsRouter.use(requireAuth);

function serialize(row) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date,
    completed: !!row.completed,
    completedAt: row.completed_at,
    subjectId: row.subject_id,
    subjectName: row.subject_name,
    subjectColor: row.subject_color,
    priority: priorityFor(row.due_date, row.completed),
  };
}

const SELECT_BASE = `
  SELECT a.*, s.name AS subject_name, s.color AS subject_color
  FROM assignments a
  LEFT JOIN subjects s ON s.id = a.subject_id
  WHERE a.user_id = ?
`;

assignmentsRouter.get('/', (req, res) => {
  const rows = db
    .prepare(`${SELECT_BASE} ORDER BY a.due_date ASC, a.created_at ASC`)
    .all(req.userId);
  res.json({
    assignments: rows.map(serialize),
    streak: computeStreak(req.userId),
    today: today(),
  });
});

assignmentsRouter.post('/', (req, res) => {
  const { title, dueDate, subjectId, notes } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return res.status(400).json({ error: 'dueDate must be in YYYY-MM-DD format' });
  }

  let resolvedSubjectId = null;
  if (subjectId) {
    const subject = db
      .prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?')
      .get(subjectId, req.userId);
    if (!subject) return res.status(400).json({ error: 'Invalid subject' });
    resolvedSubjectId = subject.id;
  }

  const { lastInsertRowid } = db
    .prepare(
      'INSERT INTO assignments (user_id, subject_id, title, notes, due_date) VALUES (?, ?, ?, ?, ?)'
    )
    .run(req.userId, resolvedSubjectId, title.trim(), notes?.trim() || null, dueDate);

  const created = db
    .prepare(
      `SELECT a.*, s.name AS subject_name, s.color AS subject_color
       FROM assignments a LEFT JOIN subjects s ON s.id = a.subject_id
       WHERE a.id = ?`
    )
    .get(lastInsertRowid);
  res.status(201).json({ assignment: serialize(created) });
});

assignmentsRouter.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assignment not found' });

  const { title, dueDate, subjectId, notes } = req.body || {};
  let resolvedSubjectId = existing.subject_id;
  if (subjectId !== undefined) {
    if (subjectId === null) {
      resolvedSubjectId = null;
    } else {
      const subject = db
        .prepare('SELECT id FROM subjects WHERE id = ? AND user_id = ?')
        .get(subjectId, req.userId);
      if (!subject) return res.status(400).json({ error: 'Invalid subject' });
      resolvedSubjectId = subject.id;
    }
  }

  db.prepare(
    'UPDATE assignments SET title = ?, notes = ?, due_date = ?, subject_id = ? WHERE id = ?'
  ).run(
    title?.trim() || existing.title,
    notes !== undefined ? notes?.trim() || null : existing.notes,
    dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : existing.due_date,
    resolvedSubjectId,
    existing.id
  );

  const updated = db
    .prepare(
      `SELECT a.*, s.name AS subject_name, s.color AS subject_color
       FROM assignments a LEFT JOIN subjects s ON s.id = a.subject_id
       WHERE a.id = ?`
    )
    .get(existing.id);
  res.json({ assignment: serialize(updated) });
});

assignmentsRouter.patch('/:id/complete', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM assignments WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assignment not found' });

  const completed = !!req.body?.completed;
  db.prepare('UPDATE assignments SET completed = ?, completed_at = ? WHERE id = ?').run(
    completed ? 1 : 0,
    completed ? new Date().toISOString() : null,
    existing.id
  );

  const updated = db
    .prepare(
      `SELECT a.*, s.name AS subject_name, s.color AS subject_color
       FROM assignments a LEFT JOIN subjects s ON s.id = a.subject_id
       WHERE a.id = ?`
    )
    .get(existing.id);
  res.json({ assignment: serialize(updated), streak: computeStreak(req.userId) });
});

assignmentsRouter.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM assignments WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Assignment not found' });
  res.status(204).end();
});
