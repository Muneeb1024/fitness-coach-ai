import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
      {
        sender: { type: String, enum: ['user', 'ai', 'system'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    flagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },
    moderatedByAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ChatLog = mongoose.model('ChatLog', chatLogSchema);
