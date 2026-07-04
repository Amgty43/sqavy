import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [palette, setPalette] = useState([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSubjects()
      .then((res) => {
        setSubjects(res.subjects);
        setPalette(res.palette);
        setColor(res.palette[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const { subject } = await api.createSubject({ name: name.trim(), color });
    setSubjects((prev) => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)));
    setName('');
  }

  async function handleDelete(id) {
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>Homeroom</span>
        </div>
        <Link className="icon-link" to="/">
          ← Back
        </Link>
      </header>

      <h1 className="page-title">Subjects</h1>
      <p className="auth-sub">Color-code your classes so your day is easy to scan.</p>

      <form className="subject-form" onSubmit={handleAdd}>
        <input placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="color-swatches">
          {palette.map((c) => (
            <button
              type="button"
              key={c}
              className={`swatch ${c === color ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Choose color ${c}`}
            />
          ))}
        </div>
        <button className="btn-primary" type="submit">
          Add subject
        </button>
      </form>

      <ul className="subject-list">
        {subjects.map((s) => (
          <li key={s.id} className="subject-list-item">
            <span className="subject-dot" style={{ backgroundColor: s.color }} />
            <span className="subject-name">{s.name}</span>
            <button className="delete-btn" onClick={() => handleDelete(s.id)} aria-label="Delete subject">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
