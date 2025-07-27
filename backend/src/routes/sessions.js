import express from 'express';
import Session from '../models/Session.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const sessions = await Session.find({ user: req.user.id }).select('-messages');
  res.json(sessions);
});

router.post('/', protect, async (req, res) => {
  const session = await Session.create({ user: req.user.id, name: req.body.name || 'Untitled Session' });
  res.status(201).json(session);
});

router.get('/:id', protect, async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  res.json(session);
});

router.patch('/:id', protect, async (req, res) => {
  const session = await Session.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
  res.json(session);
});

router.delete('/:id', protect, async (req, res) => {
  await Session.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ message: 'Deleted' });
});

export default router;