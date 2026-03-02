# LearnHub - LMS (Learning Management System)

Full-stack LMS built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**. Features courses, enrollments, progress tracking, certificates, Stripe payments, and role-based dashboards.

## Features

- **Roles:** Admin, Instructor, Student
- **Auth:** Register, login, JWT (cookie + Bearer), password reset
- **Courses:** CRUD by Instructor/Admin; curriculum (sections → lessons); types: video, text, quiz, attachment
- **Enrollment:** Free or paid (Stripe); progress per lesson; certificates on completion
- **Reviews & ratings** per course
- **Search & filters:** category, level, price
- **Dashboards:** Student (my courses, progress), Instructor (my courses), Admin (users, courses)

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, React Query, Axios
- **Backend:** Node.js, Express, JWT, express-validator
- **Database:** MongoDB (Mongoose)
- **Payments:** Stripe (checkout session + webhook)

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd lms/backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, optional STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### Frontend

```bash
cd lms/frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` to the backend.

### Environment variables (backend .env)

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for access tokens |
| REFRESH_SECRET | Secret for refresh tokens |
| FRONTEND_URL | Frontend origin for CORS (e.g. http://localhost:5173) |
| STRIPE_SECRET_KEY | Stripe secret key (optional, for paid courses) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret (optional) |

## First-time use

1. Register a user; on the backend you can change their role in the database to `instructor` or `admin` if needed.
2. As Instructor: go to "Create course" to add a course with curriculum.
3. As Student: browse courses, enroll (free or pay via Stripe), and use "Learn" to mark lessons complete.

## Deployment

- **Backend:** Deploy to Render, Railway, or similar. Set env vars and ensure MongoDB is reachable. For Stripe webhooks, use the raw body for `/api/payments/webhook`.
- **Frontend:** Build with `npm run build` and deploy to Vercel/Netlify. Set `VITE_API_URL` or proxy to your backend.
# lms
