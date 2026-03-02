# LMS Backend

Node.js + Express + MongoDB API. The frontend (port 5173) proxies `/api` to this server.

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Environment variables

Copy the example env file and edit it:

```bash
copy .env.example .env
```

Edit `.env` and set at least:

- **MONGODB_URI** – MongoDB connection string (default: `mongodb://localhost:27017/lms`)
- **JWT_SECRET** – Any long random string for signing tokens
- **REFRESH_SECRET** – Another long random string for refresh tokens

Optional: `PORT` (default 5000), `FRONTEND_URL` (default http://localhost:5173), Stripe keys for payments.

## 3. Run MongoDB

The backend needs MongoDB running.

- **Local:** Install [MongoDB Community](https://www.mongodb.com/try/download/community) and start the service, or run `mongod`.
- **Cloud:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a cluster, and set `MONGODB_URI` in `.env` to the connection string.

## 4. Start the server

```bash
npm run dev
```

Or for production:

```bash
npm start
```

You should see: `LMS server running on port 5000` and `MongoDB connected: ...`.

## 5. Create the first admin

The public register API cannot create admin accounts. To create or fix an admin account:

1. In `.env`, set **ADMIN_EMAIL** and **ADMIN_PASSWORD** (and optionally **ADMIN_NAME**, default `"Admin"`). These are used only by the seed script, not by the server at runtime.
2. From the backend directory, run:
   ```bash
   npm run seed:admin
   ```
3. If a user with that email already exists, they are promoted to admin. Otherwise a new admin user is created.
4. Log in on the frontend with that email and password; the user will have the admin role and access to the Admin area.

## 6. Test

- Backend: http://localhost:5000/api/health → `{"ok":true}`
- Frontend: run `npm run dev` in the `frontend` folder, then open http://localhost:5173 — login/signup will use the backend.
