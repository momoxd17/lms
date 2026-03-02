import mongoose from 'mongoose';

const progressItemSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.Mixed, required: true },
  completedAt: { type: Date, default: Date.now },
});

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: [progressItemSchema],
    completedAt: Date,
    certificateUrl: String,
    paymentId: String,
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
