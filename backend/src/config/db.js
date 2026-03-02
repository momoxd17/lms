import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('No MONGODB_URI in .env — using default: mongodb://localhost:27017/lms');
    }
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    const isRefused =
      err?.cause?.code === 'ECONNREFUSED' ||
      err?.message?.includes('ECONNREFUSED') ||
      err?.cause?.message?.includes('ECONNREFUSED');
    if (isRefused) {
      const url = new URL(MONGODB_URI);
      console.error(
        `MongoDB connection refused at ${url.hostname}:${url.port || '27017'}. ` +
          'Ensure MongoDB is running locally, or set MONGODB_URI in .env to a valid instance (e.g. MongoDB Atlas).'
      );
    }
    console.error(err);
    process.exit(1);
  }
};
