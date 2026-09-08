# WorkBal

Companies submit online tasks; an automated agent completes them from **client-provided instructions**; the company is invoiced when done.

> **Acceptable use:** The agent only does client-submitted work from your instructions. No survey farming, CAPTCHA bypass, account theft, or ToS-violating scraping.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (`prisma/dev.db`)
- Session cookies via signed JWT (`jose` + `bcryptjs`)
- Background worker (`scripts/worker.ts`) or in-app **Process queue** button

## Setup

```bash
cd /workspace/workbalflow
npm install

# create DB + generate client
npx prisma db push
# seed demo users + sample completed tasks/invoices
npm run db:seed

# start the web app
npm run dev
```

Open http://localhost:3000

### Worker (optional background process)

In a second terminal:

```bash
npm run worker
```

If you skip the worker, use the **Process queue** button on the dashboard or admin page (calls `POST /api/worker`).

## Environment variables

Copy `.env.example` to `.env` (a working `.env` is already included for local SQLite).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | SQLite path, e.g. `file:./dev.db` |
| `AUTH_SECRET` | yes | Secret for signing session cookies |
| `OPENAI_API_KEY` | no | If set, task completion uses OpenAI; otherwise a deterministic markdown template |
| `STRIPE_SECRET_KEY` | no | If set, Pay opens a Stripe Checkout session; otherwise mock pay marks invoice PAID |
| `STRIPE_AUTO_MARK_PAID` | no | If `true` with Stripe, mark invoice PAID when Checkout session is created (MVP stub) |
| `NEXT_PUBLIC_APP_URL` | no | Base URL for Stripe success/cancel redirects (default `http://localhost:3000`) |
| `WORKER_INTERVAL_MS` | no | Worker poll interval (default `3000`) |

## Demo logins

| Email | Password | Role |
|-------|----------|------|
| `demo@workbal.dev` | `demo1234` | CLIENT |
| `admin@workbal.dev` | `admin1234` | ADMIN |

Seeded data includes 1-2 completed sample tasks and invoices so the UI is not empty after login.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run worker` | Poll and process QUEUED tasks |
| `npm run db:seed` | Seed users + sample tasks |
| `npm run db:push` | Push Prisma schema to SQLite |

## Features

1. **Landing** — product explanation + acceptable-use notice
2. **Auth** — email/password with HTTP-only session cookies
3. **Client dashboard** — create tasks, list by status, view results
4. **Agent worker** — QUEUED to RUNNING to COMPLETED (+ invoice) or FAILED
5. **Invoices** — auto-created on completion; Pay (Stripe or mock)
6. **Admin** — all-tasks queue, retry FAILED, process queue

## Project layout (main routes)

```
src/app/
  page.tsx                 Landing
  login/                   Login
  register/                Register
  dashboard/               Client task list
  dashboard/tasks/new      Create task
  dashboard/tasks/[id]     Task detail + result
  dashboard/invoices/      Invoices + Pay
  admin/                   Admin queue
  api/auth/*               Login / logout / register
  api/tasks                Create / list tasks
  api/worker               Process queue
  api/invoices/pay         Pay invoice
  api/admin/retry          Retry failed task
```
