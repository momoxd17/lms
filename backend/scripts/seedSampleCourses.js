import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';

async function seedSampleCourses() {
  await connectDB();

  const instructor =
    (await User.findOne({ role: 'instructor' })) ||
    (await User.findOne({ role: 'admin' }));

  if (!instructor) {
    console.error('No instructor/admin user found. Create at least one instructor or admin before seeding sample courses.');
    await mongoose.connection.close();
    process.exit(1);
  }

  const baseCourses = [
    {
      title: 'Modern JavaScript Essentials',
      description: 'Learn the core concepts of modern JavaScript, from ES6 syntax to asynchronous programming.',
      category: 'Programming',
      level: 'beginner',
      price: 0,
      hasCertificate: true,
    },
    {
      title: 'React for Beginners',
      description: 'Build interactive UIs with React hooks, components, and state management best practices.',
      category: 'Programming',
      level: 'beginner',
      price: 19.99,
      hasCertificate: true,
    },
    {
      title: 'Advanced React Patterns',
      description: 'Dive into advanced patterns like compound components, render props, and custom hooks.',
      category: 'Programming',
      level: 'advanced',
      price: 39.0,
      hasCertificate: true,
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the principles of user experience and modern interface design.',
      category: 'Design',
      level: 'beginner',
      price: 15.0,
      hasCertificate: false,
    },
    {
      title: 'Productivity for Developers',
      description: 'Systems and habits to stay focused, ship faster, and avoid burnout.',
      category: 'Business',
      level: 'intermediate',
      price: 9.99,
      hasCertificate: false,
    },
    {
      title: 'Git & GitHub from Scratch',
      description: 'Version control your projects, collaborate with others, and contribute to open-source.',
      category: 'Programming',
      level: 'beginner',
      price: 0,
      hasCertificate: true,
    },
    {
      title: 'Node.js API Development',
      description: 'Build a RESTful API using Node.js, Express, and MongoDB.',
      category: 'Programming',
      level: 'intermediate',
      price: 24.99,
      hasCertificate: true,
    },
    {
      title: 'Responsive Web Design',
      description: 'Create websites that look great on mobile, tablet, and desktop using modern CSS.',
      category: 'Design',
      level: 'beginner',
      price: 12.0,
      hasCertificate: true,
    },
    {
      title: 'Data Structures & Algorithms Basics',
      description: 'Understand the most common data structures and algorithms used in interviews.',
      category: 'Programming',
      level: 'intermediate',
      price: 29.0,
      hasCertificate: true,
    },
    {
      title: 'Freelancing 101 for Developers',
      description: 'Learn how to find clients, price your work, and manage freelance projects.',
      category: 'Business',
      level: 'beginner',
      price: 14.0,
      hasCertificate: false,
    },
    {
      title: 'Intro to TypeScript',
      description: 'Add static typing to your JavaScript projects with TypeScript.',
      category: 'Programming',
      level: 'beginner',
      price: 11.99,
      hasCertificate: true,
    },
    {
      title: 'SQL & Databases for Beginners',
      description: 'Query data, design schemas, and understand relational database concepts.',
      category: 'Programming',
      level: 'beginner',
      price: 17.5,
      hasCertificate: true,
    },
  ];

  const existingTitles = new Set(
    (await Course.find({ title: { $in: baseCourses.map((c) => c.title) } }).select('title').lean()).map((c) => c.title)
  );

  const toInsert = baseCourses
    .filter((c) => !existingTitles.has(c.title))
    .map((c) => {
      const slug = c.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return {
        ...c,
        slug,
        instructor: instructor._id,
        published: true,
        curriculum: [
          {
            title: 'Section 1',
            lessons: [
              { title: 'Welcome', type: 'text', content: '<p>Welcome to the course!</p>' },
              { title: 'First steps', type: 'video', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            ],
          },
        ],
      };
    });

  if (toInsert.length === 0) {
    console.log('Sample courses already exist. Nothing to insert.');
  } else {
    await Course.insertMany(toInsert);
    console.log(`Inserted ${toInsert.length} sample courses for instructor ${instructor.email}.`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

seedSampleCourses().catch((err) => {
  console.error(err);
  process.exit(1);
});

