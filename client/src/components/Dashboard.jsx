import { useEffect, useState } from 'react';
import { api } from '../api.js';
import SessionList from './SessionList.jsx';
import Chat from './Chat.jsx';
import Preview from './Preview.jsx';
import CodeTabs from './CodeTabs.jsx';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [code, setCode] = useState('');
  const [css, setCss] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data } = await api.get('/sessions');
    setSessions(data);
  };

  const createSession = async () => {
    const { data } = await api.post('/sessions', {});
    setSessions((prev) => [...prev, data]);
    loadSession(data._id);
  };

  const loadSession = async (id) => {
    const { data } = await api.get(`/sessions/${id}`);
    setCurrentSession(data);
    setCode(data.componentCode);
    setCss(data.css);
  };

  const handleChatUpdate = (messages, newCode, newCss) => {
    setCurrentSession((prev) => ({ ...prev, messages }));
    if (newCode) setCode(newCode);
    if (newCss) setCss(newCss);
  };

  return (
    <div className="dashboard">
      <SessionList sessions={sessions} onSelect={loadSession} onCreate={createSession} />
      {currentSession ? (
        <>
          <Chat session={currentSession} onUpdate={handleChatUpdate} />
          <Preview code={code} css={css} />
          <CodeTabs code={code} css={css} />
        </>
      ) : (
        <p className="empty-state">Select or create a session to begin.</p>
      )}
    </div>
  );
}