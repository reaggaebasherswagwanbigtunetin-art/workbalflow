import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-14 text-white shadow-card sm:px-12 sm:py-20">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl space-y-6">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-50 ring-1 ring-white/20">
            Client-submitted work only
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Submit the task. The agent does the work. You get invoiced when it&apos;s done.
          </h1>
          <p className="text-lg text-brand-50/90 leading-relaxed">
            WorkBal is for companies that need structured online work completed from{" "}
            <strong className="text-white">their own instructions</strong> — research briefs,
            drafts, summaries, checklists, and more. No survey farming. No CAPTCHA bypass. No
            account theft. No ToS-violating scraping.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-soft hover:bg-brand-50"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-soft hover:bg-brand-50"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/15"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "1. Submit a task",
            body: "Describe the work, paste instructions and optional context, set a price in USD.",
          },
          {
            title: "2. Agent completes it",
            body: "A background worker picks up QUEUED tasks, runs a completer, and stores a markdown result.",
          },
          {
            title: "3. Invoice & pay",
            body: "On completion we auto-create an invoice. Pay via mock checkout or Stripe when configured.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            <h3 className="font-semibold text-ink-950">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-amber-950">Acceptable use</h2>
        <p className="mt-2 text-sm text-amber-900/90 leading-relaxed max-w-3xl">
          The WorkBal agent only performs <strong>client-submitted</strong> work from instructions
          you provide. It must not be used for survey farming, CAPTCHA solving or bypass, stealing
          or accessing third-party accounts, or scraping that violates a site&apos;s Terms of
          Service. Tasks that request those activities will be refused or fail.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
        <h2 className="text-lg font-semibold text-ink-950">Demo logins</h2>
        <ul className="mt-3 space-y-1 text-sm text-ink-600 font-mono">
          <li>demo@workbal.dev / demo1234 (client)</li>
          <li>admin@workbal.dev / admin1234 (admin)</li>
        </ul>
      </section>
    </div>
  );
}
