import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { enablePushNotifications } from '../push';
import AssignmentCard from '../components/AssignmentCard.jsx';
import AssignmentForm from '../components/AssignmentForm.jsx';
import StreakBadge from '../components/StreakBadge.jsx';

const GROUPS = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'due_today', label: 'Due today' },
  { key: 'due_soon', label: 'Due soon' },
  { key: 'upcoming', label: 'Upcoming' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [streak, setStreak] = useState(0);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  async function refresh() {
    const [assignmentsRes, subjectsRes] = await Promise.all([
      api.getAssignments(),
      api.getSubjects(),
    ]);
    setAssignments(assignmentsRes.assignments);
    setStreak(assignmentsRes.streak);
    setToday(assignmentsRes.today);
    setSubjects(subjectsRes.subjects);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = { overdue: [], due_today: [], due_soon: [], upcoming: [], done: [] };
    for (const a of assignments) map[a.priority].push(a);
    return map;
  }, [assignments]);

  async function handleAdd(payload) {
    const { assignment } = await api.createAssignment(payload);
    setAssignments((prev) => [...prev, assignment]);
    setShowForm(false);
  }

  async function handleToggle(id, completed) {
    const { assignment, streak: newStreak } = await api.setComplete(id, completed);
    setAssignments((prev) => prev.map((a) => (a.id === id ? assignment : a)));
    setStreak(newStreak);
  }

  async function handleDelete(id) {
    await api.deleteAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleEnablePush() {
    setPushStatus('Requesting…');
    const result = await enablePushNotifications();
    setPushStatus(result.ok ? 'Push notifications enabled ✓' : result.reason);
  }

  if (loading) return <div className="page-loading">Loading…</div>;

  const activeCount = assignments.length - grouped.done.length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>Homeroom</span>
        </div>
        <div className="header-actions">
          <StreakBadge streak={streak} />
          <Link className="icon-link" to="/subjects" title="Manage subjects">
            Subjects
          </Link>
          <button className="icon-link" onClick={logout} title="Log out">
            Log out
          </button>
        </div>
      </header>

      <p className="greeting">
        Hi {user.name.split(' ')[0]}, you have {activeCount} assignment{activeCount === 1 ? '' : 's'}{' '}
        left to do.
      </p>

      <div className="push-row">
        <button className="btn-secondary" onClick={handleEnablePush}>
          🔔 Enable notifications
        </button>
        {pushStatus && <span className="push-status">{pushStatus}</span>}
      </div>

      {!showForm ? (
        <button className="btn-primary add-btn" onClick={() => setShowForm(true)}>
          + Add assignment
        </button>
      ) : (
        <AssignmentForm
          subjects={subjects}
          today={today}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {GROUPS.map(({ key, label }) =>
        grouped[key].length > 0 ? (
          <section key={key} className="assignment-group">
            <h2>
              {label} <span className="group-count">{grouped[key].length}</span>
            </h2>
            {grouped[key].map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                today={today}
                onToggleComplete={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </section>
        ) : null
      )}

      {assignments.length === 0 && (
        <p className="empty-state">Nothing on your list yet. Add your first assignment above.</p>
      )}

      {grouped.done.length > 0 && (
        <section className="assignment-group">
          <button className="completed-toggle" onClick={() => setShowCompleted((s) => !s)}>
            {showCompleted ? 'Hide' : 'Show'} completed ({grouped.done.length})
          </button>
          {showCompleted &&
            grouped.done.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                today={today}
                onToggleComplete={handleToggle}
                onDelete={handleDelete}
              />
            ))}
        </section>
      )}
    </div>
  );
}
