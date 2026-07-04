const PRIORITY_LABEL = {
  overdue: 'Overdue',
  due_today: 'Due today',
  due_soon: 'Due soon',
  upcoming: 'Upcoming',
  done: 'Done',
};

function formatDueDate(dueDate, todayStr) {
  const today = new Date(`${todayStr}T00:00:00`);
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function AssignmentCard({ assignment, today, onToggleComplete, onDelete }) {
  const { title, dueDate, priority, subjectName, subjectColor, completed, notes } = assignment;

  return (
    <div className={`assignment-card priority-${priority}`}>
      <button
        className={`check ${completed ? 'checked' : ''}`}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        onClick={() => onToggleComplete(assignment.id, !completed)}
      >
        {completed ? '✓' : ''}
      </button>
      <div className="assignment-body">
        <div className="assignment-top-row">
          {subjectName && (
            <span
              className="subject-tag"
              style={{ color: subjectColor, backgroundColor: `${subjectColor}22` }}
            >
              {subjectName}
            </span>
          )}
          <span className={`priority-pill priority-pill-${priority}`}>
            {PRIORITY_LABEL[priority]}
          </span>
        </div>
        <div className={`assignment-title ${completed ? 'completed' : ''}`}>{title}</div>
        {notes && <div className="assignment-notes">{notes}</div>}
        <div className="assignment-due">{formatDueDate(dueDate, today)}</div>
      </div>
      <button className="delete-btn" aria-label="Delete assignment" onClick={() => onDelete(assignment.id)}>
        ×
      </button>
    </div>
  );
}
