import mongoose from 'mongoose';
import { applyApiTransforms } from './plugins.js';

export const MESSAGE_STATUSES = ['unread', 'read'];

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, default: '', trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'unread', index: true },
    readAt: { type: Date, default: null },
    emailSent: { type: Boolean, default: false },
    meta: {
      ip: { type: String, default: '' },
      userAgent: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

applyApiTransforms(messageSchema);

messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);
