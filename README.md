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
| `NEXT_PUBLIC_APP_URL` | no | Base URL for Stripe redirects and email links (default `http://localhost:3000`) |
| `OPENAI_API_KEY` | no | If set, task completion uses OpenAI chat completions; otherwise a deterministic markdown template |
| `OPENAI_MODEL` | no | OpenAI model override (default `gpt-4o-mini`) |
| `STRIPE_SECRET_KEY` | no | If set, Pay opens a real Stripe Checkout session; otherwise mock pay marks invoice PAID |
| `STRIPE_WEBHOOK_SECRET` | no | Stripe webhook signing secret for `POST /api/stripe/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no | Publishable key (documented for Checkout / future Elements) |
| `RESEND_API_KEY` | no | If set, completion and invoice emails go through Resend |
| `EMAIL_FROM` | no | From address for Resend (default `WorkBal <onboarding@resend.dev>`) |
| `WORKER_INTERVAL_MS` | no | Worker poll interval (default `3000`) |

When Resend is not configured, emails are printed to the console and appended to `logs/emails.log`.

### Stripe local webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Without a webhook, the invoices page still confirms payment via `GET /api/stripe/confirm?session_id=...` after the Checkout success redirect.

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

1. **Landing** — B2B / SMB hero, how it works, pricing tiers, acceptable-use notice
2. **Auth** — email/password with HTTP-only session cookies
3. **Client dashboard** — create tasks (optional file upload), list by status, view results
4. **Agent worker** — QUEUED to RUNNING to COMPLETED (+ invoice + emails) or FAILED
5. **AI completer** — OpenAI when keyed; template fallback; attachment text in context
6. **Invoices** — auto-created on completion; Pay via Stripe Checkout or mock
7. **Email** — Resend or console/logs/emails.log on task complete and invoice created
8. **Admin** — all-tasks queue, retry FAILED, process queue

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
  api/invoices/pay         Pay invoice (Stripe or mock)
  api/stripe/webhook       Stripe webhook -> mark PAID
  api/stripe/confirm       Success-redirect session verify
  api/tasks/[id]/attachment  Download attachment
  api/admin/retry          Retry failed task
uploads/                   Task attachments (gitignored)
logs/emails.log            Demo email sink (gitignored)
```
