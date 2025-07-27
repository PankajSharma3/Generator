import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../store/useAuth.js';
import ChatPanel from '../components/ChatPanel.jsx';
import Preview from '../components/Preview.jsx';
import CodeTabs from '../components/CodeTabs.jsx';

export default function Dashboard() {
  const { token } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [code, setCode] = useState({ jsx: '', css: '' });

  useEffect(() => {
    const createSession = async () => {
      const { data } = await axios.post(
        '/api/sessions',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionId(data._id);
    };
    createSession();
  }, [token]);

  const handleAIResponse = (jsx, css) => setCode({ jsx, css });

  if (!sessionId) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <ChatPanel token={token} sessionId={sessionId} onAI={handleAIResponse} />
      <div className="right-pane">
        <Preview jsx={code.jsx} css={code.css} />
        <CodeTabs jsx={code.jsx} css={code.css} />
      </div>
    </div>
  );
}