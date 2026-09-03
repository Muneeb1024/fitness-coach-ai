import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['BAN_USER', 'UNBAN_USER', 'OVERRIDE_PLAN', 'MODERATE_IMAGE', 'MODERATE_CHAT', 'UPDATE_PROMPT',
             'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_PASSWORD'],
      required: true
    },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String, required: true }
  },
  { timestamps: true }
);

export const AdminLog = mongoose.model('AdminLog', adminLogSchema);
