import { Router } from 'express';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';
import generateComponent from '../utils/generateComponent.js';

const router = Router();
router.use(auth);

router.post('/', async (req, res) => {
  const { sessionId, prompt } = req.body;
  if (!sessionId || !prompt) return res.status(400).json({ message: 'sessionId and prompt required' });
  const session = await Session.findOne({ _id: sessionId, userId: req.userId });
  if (!session) return res.status(404).json({ message: 'Session not found' });

  session.messages.push({ role: 'user', content: prompt });
  const { assistantMessage, code, css } = await generateComponent(session.messages);
  session.messages.push({ role: 'assistant', content: assistantMessage });
  if (code) session.componentCode = code;
  if (css) session.css = css;
  await session.save();

  res.json({ messages: session.messages, code: session.componentCode, css: session.css });
});

export default router;