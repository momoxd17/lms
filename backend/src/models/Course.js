import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'text', 'quiz', 'attachment'], required: true },
  content: { type: String, default: '' },
  videoUrl: String,
  attachmentUrl: String,
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctIndex: Number,
    }],
  },
  order: { type: Number, default: 0 },
  durationMinutes: { type: Number, default: 0 },
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
  order: { type: Number, default: 0 },
}, { _id: true });

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    hasCertificate: { type: Boolean, default: false },
    certificateText: { type: String, default: '' },
    certificateTemplateUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    price: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    published: { type: Boolean, default: false },
    curriculum: [sectionSchema],
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, level: 1, price: 1 });
courseSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

export const Course = mongoose.model('Course', courseSchema);
