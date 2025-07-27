import { useState } from 'react';
import axios from 'axios';

export default function ChatPanel({ token, sessionId, onAI }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    const userMsg = { role: 'user', content: prompt };
    setMessages((m) => [...m, userMsg]);
    setPrompt('');
    try {
      const { data } = await axios.post(
        '/api/ai/generate',
        { prompt, sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiMsg = { role: 'assistant', content: data.full };
      setMessages((m) => [...m, aiMsg]);
      onAI(data.jsx, data.css);
    } catch (err) {
      const errorMsg = { role: 'assistant', content: 'Error generating component.' };
      setMessages((m) => [...m, errorMsg]);
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
      </div>
      <div className="input-row">
        <input
          placeholder="Describe the component..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
        />
        <button onClick={sendPrompt}>Send</button>
      </div>
    </div>
  );
}