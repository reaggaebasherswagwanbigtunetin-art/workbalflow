import Link from "next/link";
import { getSession } from "@/lib/auth";

const tiers = [
  {
    name: "Pay-per-task",
    price: "From $15",
    blurb: "Submit one-off briefs with your own price. Ideal for occasional SMB work.",
    features: ["Client-submitted instructions", "Markdown deliverable", "Invoice on completion", "Mock or Stripe pay"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$99/mo",
    blurb: "For local services and small teams running a steady stream of structured tasks.",
    features: [
      "Up to ~20 tasks / month*",
      "File uploads on tasks",
      "Email notifications",
      "Priority queue processing",
    ],
    cta: "Choose Starter",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$299/mo",
    blurb: "For growing SMBs that want volume, OpenAI-powered completer, and Stripe Checkout.",
    features: [
      "Higher monthly allowance*",
      "OpenAI completer (bring your key)",
      "Stripe Checkout + webhooks",
      "Admin queue & retry",
    ],
    cta: "Choose Growth",
    highlighted: false,
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-14 text-white shadow-card sm:px-12 sm:py-20">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-6">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-50 ring-1 ring-white/20">
            B2B automation for SMBs &amp; local services
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your team submits the brief. WorkBal completes it. You get invoiced when it&apos;s done.
          </h1>
          <p className="text-lg text-brand-50/90 leading-relaxed">
            WorkBal helps companies and local-service businesses offload structured online work —
            research briefs, onboarding copy, checklists, FAQ drafts, and internal summaries — from{" "}
            <strong className="text-white">instructions you provide</strong>. Acceptable use stays
            strict: no survey farming, CAPTCHA bypass, account theft, or ToS-violating scraping.
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
            <a
              href="#pricing"
              className="rounded-xl bg-transparent px-5 py-2.5 text-sm font-semibold text-white/90 underline-offset-4 hover:underline"
            >
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "1. Submit a task",
            body: "Describe the work, paste instructions, optional context, and attach a PDF or notes. Set a price in USD.",
          },
          {
            title: "2. Agent completes it",
            body: "A worker picks up QUEUED tasks, runs the completer (template or OpenAI), and stores a markdown result.",
          },
          {
            title: "3. Invoice & pay",
            body: "On completion we email you and create an invoice. Pay via mock checkout or real Stripe Checkout.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
            <h3 className="font-semibold text-ink-950">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-600 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
        <h2 className="text-lg font-semibold text-ink-950">Built for everyday business work</h2>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-3xl">
          Think local agencies, trades, clinics, and SaaS SMBs that need repeatable writing and
          research done from their own briefs — not anonymous gig farms. Upload source docs, get a
          clear deliverable, and settle with a simple invoice.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-ink-700">
          <li className="flex gap-2">
            <span className="text-brand-600 font-bold">✓</span> Client-owned instructions &amp; files
          </li>
          <li className="flex gap-2">
            <span className="text-brand-600 font-bold">✓</span> Optional OpenAI-powered reports
          </li>
          <li className="flex gap-2">
            <span className="text-brand-600 font-bold">✓</span> Stripe Checkout when keys are set
          </li>
          <li className="flex gap-2">
            <span className="text-brand-600 font-bold">✓</span> Email alerts on complete &amp; invoice
          </li>
        </ul>
      </section>

      <section id="pricing" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-ink-950">Simple pricing</h2>
          <p className="mt-2 text-sm text-ink-600">
            Placeholder USD tiers for planning — register to try the product with demo logins.
            Monthly allowances are illustrative until billing is wired to a plan.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl p-6 shadow-card ring-1 flex flex-col ${
                t.highlighted
                  ? "bg-brand-700 text-white ring-brand-800"
                  : "bg-white text-ink-900 ring-ink-100"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  t.highlighted ? "text-brand-100" : "text-brand-700"
                }`}
              >
                {t.name}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{t.price}</p>
              <p className={`mt-2 text-sm leading-relaxed ${t.highlighted ? "text-brand-50/90" : "text-ink-600"}`}>
                {t.blurb}
              </p>
              <ul className="mt-5 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className={t.highlighted ? "text-brand-100" : "text-brand-600"}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={session ? "/dashboard" : "/register"}
                className={`mt-6 inline-flex justify-center rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  t.highlighted
                    ? "bg-white text-brand-800 hover:bg-brand-50"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {session ? "Open dashboard" : t.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-ink-500">
          *Monthly task counts are placeholders for the demo. Pay-per-task uses the price you set on each job.
        </p>
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

      <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-950">Ready to try it?</h2>
          <p className="mt-1 text-sm text-ink-600">
            Demo: <span className="font-mono">demo@workbal.dev</span> /{" "}
            <span className="font-mono">demo1234</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={session ? "/dashboard" : "/register"}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {session ? "Dashboard" : "Register"}
          </Link>
          {!session && (
            <Link
              href="/login"
              className="rounded-xl bg-ink-100 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-200"
            >
              Log in
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
