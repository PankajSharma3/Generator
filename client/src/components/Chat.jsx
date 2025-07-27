import { useState } from 'react';
import { api } from '../api.js';

export default function Chat({ session, onUpdate }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { sessionId: session._id, prompt: input });
      onUpdate(data.messages, data.code, data.css);
      setInput('');
    } catch (err) {
      alert(err.response?.data?.message || 'Chat error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages">
        {session.messages?.map((m, idx) => (
          <div key={idx} className={`message ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI..."
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}