# Arche Fitness — Modular SaaS Web Application

A scalable full-stack SaaS platform for fitness tracking, client management, workout programming, and performance analytics.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **UI**: React 19, Tailwind CSS v4, Lucide React Icons
- **State Management**: Redux Toolkit & React-Redux
- **ORM**: Prisma ORM 7
- **Database**: Neon PostgreSQL
- **Validation**: Zod
- **Repository**: [https://github.com/Davaadorj8/arche.fitness-web-app.git](https://github.com/Davaadorj8/arche.fitness-web-app.git)
- **Hosting / Deployments**: Vercel

---

## Architectural Flow

```text
Next.js UI (App Router)
    ↓
Redux Toolkit / Client State (Slices: clients, workouts, ui)
    ↓
Next.js Server Layer (API Route Handlers)
    ↓
Validation Layer (Zod)
    ↓
Business Logic / Domain Services (ClientService, WorkoutService, StatsService)
    ↓
Prisma ORM Client (lib/prisma.ts)
    ↓
Neon PostgreSQL
```

---

## Getting Started

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your database URL:

```bash
DATABASE_URL="postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 2. Run Database Migrations
Generate the Prisma client and push schema to Neon:

```bash
npx prisma generate
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Pushing to your GitHub Repository

To sync this codebase with your repository:

```bash
git remote add origin https://github.com/Davaadorj8/arche.fitness-web-app.git
git branch -M main
git push -u origin main
```
