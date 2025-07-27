import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Untitled Session' },
    messages: [MessageSchema],
    code: {
      jsx: { type: String, default: '' },
      css: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Session', SessionSchema);