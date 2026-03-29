# Novelle Journal

A luxury digital space curated for your life's most beautiful dreams and aspirations. Novelle Journal acts as a premium digital bucket list, vision board, and cherished memory tracker. 

## Features
- **Sophisticated Aesthetics**: Hand-curated light/dark mode color palettes with rose gold, warm cream, and taupe accents.
- **Vision Board Mode**: A distraction-free, full-screen immersive collage of your pursuits.
- **Cherished Memories Timeline**: Seamlessly move active goals into a nostalgic history timeline with sepia image effects.
- **Robust Authentication**: Email/Password authentication powered by JSON Web Tokens and bcrypt password hashing.
- **Smooth Animations**: High-fidelity interactions using Framer Motion (modal spring physics, staggered entrances, layout transitions) and canvas-confetti.

---

## Architecture Requirements
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Axios, Lucide React.
- **Backend**: Node.js, Express, `pg`, JWT, Bcrypt, Helmet.
- **Database**: PostgreSQL (We strongly recommend a free Supabase PostgreSQL instance).

---

## Local Development Guide

### 1. Database Setup
1. Create a PostgreSQL database (locally or via Supabase/Neon).
2. Execute the `server/schema.sql` file in your SQL query editor to generate the `users`, `goals`, and `completed_goals` tables.

### 2. Backend Setup
Navigate to the `server/` directory:
```bash
cd server
npm install
```
Create a `.env` file in `server/` with the following variables:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/novelle
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the `client/` directory:
```bash
cd client
npm install
```
Create a `.env` file in `client/` containing your backend API URL if not running locally:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend dev server:
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## Deployment Strategy

### Deploying the Backend to Render or Railway
1. Push this repository to GitHub.
2. Link the repository to Render/Railway.
3. For Render, create a new "Web Service".
4. Set the Root Directory to `server`.
5. Build Command: `npm install`
6. Start Command: `npm start`
7. In the environment variables section, input your `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` (the Vercel app URL).

### Deploying the Frontend to Vercel
1. In Vercel, import your GitHub repository.
2. Set the Root Directory mapping to `client`.
3. The framework preset should correctly auto-detect **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add your Environment Variable: `VITE_API_URL` pointing to your deployed Render backend (e.g., `https://novelle-journal-backend.onrender.com/api`).
7. Deploy!

### Security Considerations
- The backend utilizes `helmet` to mask headers and restrict malicious traffic.
- Express rate limiting is actively enabled on authentication routes to stop brute force attacks.
- Passwords are encrypted before database insertion using highly secure `bcrypt` iterations.
