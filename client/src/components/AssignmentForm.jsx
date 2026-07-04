import { useState } from 'react';

export default function AssignmentForm({ subjects, today, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        dueDate,
        subjectId: subjectId || null,
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setNotes('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="assignment-form" onSubmit={handleSubmit}>
      <input
        className="assignment-form-title"
        placeholder="Assignment name (e.g. Read chapter 5)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="assignment-form-row">
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">No subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </div>
      <input
        className="assignment-form-notes"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="assignment-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Adding…' : 'Add assignment'}
        </button>
      </div>
    </form>
  );
}
