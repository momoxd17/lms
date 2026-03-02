import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    email: { type: String },
    message: { type: String, required: true },
    answer: { type: String },
    handledByBot: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
    from: { type: String, enum: ['user', 'admin'], default: 'user' },
    inReplyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

