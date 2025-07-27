export default function SessionList({ sessions, onSelect, onCreate }) {
  return (
    <aside className="session-list">
      <button onClick={onCreate} className="new-session-btn">
        + New Session
      </button>
      <div className="sessions">
        {sessions.map((s) => (
          <div key={s._id} className="session-item" onClick={() => onSelect(s._id)}>
            {s.title}
          </div>
        ))}
      </div>
    </aside>
  );
}