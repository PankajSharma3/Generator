import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import Session from '../models/Session.js';

const router = express.Router();

router.post('/generate', protect, async (req, res) => {
  const { prompt, sessionId } = req.body;
  try {
    const session = await Session.findOne({ _id: sessionId, user: req.user.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const messagesForAI = session.messages.map((m) => ({ role: m.role, content: m.content }));
    messagesForAI.push({ role: 'user', content: prompt });

    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messagesForAI,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiContent = aiRes.data.choices[0].message.content;
    const [jsx, css = ''] = aiContent.split('---CSS---');

    session.messages.push({ role: 'user', content: prompt }, { role: 'assistant', content: aiContent });
    session.code = { jsx, css };
    await session.save();

    res.json({ jsx, css, full: aiContent });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;