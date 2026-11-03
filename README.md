# StudyClock ⏱️ — Modern Study Timer & Duration Tracker with MongoDB

StudyClock is a modern, responsive, precision study-tracking web application designed to help students, developers, and lifelong learners maintain focus, measure duration accurately, and build lasting study habits.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🗄️ Database & Cloud Persistence

StudyClock is connected to **MongoDB Atlas Cloud**:
- **MongoDB Cluster**: `Cluster0` (`cluster0.mndhh.mongodb.net`)
- **Database**: `studyclock`
- **Security & Multi-Tenancy**:
  - Full **Tenant Isolation**: All sessions, subjects, and goals are strictly scoped to the authenticated user ID (`userId`).
  - **Zero Shared Data**: Other users cannot view, edit, or delete your study sessions.
  - **Zero Mock Data**: Clean initial state tracking only real user activity.
  - **NoSQL Injection & Mass Assignment Protection**: Whitelisted schemas and strictly typed parameters.
  - **CSV Formula Injection Sanitization**: Safe export preventing spreadsheet DDE execution.
- **Collections**:
  - `users`: User credentials (PBKDF2 SHA-512 salted password hashes, JWT tokens).
  - `sessions`: Exact study logs scoped by `userId`.
  - `subjects`: User study subjects scoped by `userId`.
  - `goals`: User daily and weekly targets scoped by `userId`.

---

## ⚙️ Environment Variables

Add these to your local `.env` and in your **Vercel Project Settings &rarr; Environment Variables**:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mndhh.mongodb.net/studyclock?appName=Cluster0` | MongoDB Atlas Connection String |
| `MONGODB_DB` | `studyclock` | Target Database Name |
| `JWT_SECRET` | `<32_CHAR_RANDOM_SECRET>` | Key for signing user authentication tokens |

> **Security Note:** Never commit your real `.env` file to version control. The repository's `.gitignore` automatically excludes `.env`.

---

## 🚀 Deploying to Vercel

The application is pre-configured with `vercel.json` and Vercel Serverless Functions in `/api` (`/api/auth`, `/api/sessions`, `/api/subjects`, `/api/goals`).

### Step-by-Step Vercel Deployment:

1. Commit and push your changes to your Git repository:
   ```bash
   git add .
   git commit -m "fix(security): resolve all OWASP Top 10 vulnerabilities"
   git push origin main
   ```
2. Open [Vercel Dashboard](https://vercel.com/new) and import your repository.
3. Under **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI with your database user & password.
   - `MONGODB_DB`: `studyclock`
   - `JWT_SECRET`: A secure random secret string.
4. Click **Deploy**.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Run local dev server with MongoDB API middleware
pnpm run dev

# 3. Build for production
pnpm run build
```

---

## 📦 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Database & Backend**: MongoDB Atlas + Vercel Serverless Functions (`/api/*`)
- **Authentication**: Salted PBKDF2 Password Hashing + HMAC SHA-256 JWT
- **Icons**: Lucide React
- **Charts**: Recharts
- **Celebration Effects**: Canvas Confetti
- **Audio Engine**: Web Audio API (Synthesizer & Ambient Noise Generator)
