import Link from "next/link";
import { getSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function logout() {
  "use server";
  await destroySession();
  redirect("/");
}

export async function Nav() {
  const session = await getSession();

  return (
    <header className="border-b border-ink-200/80 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white shadow-soft">
            W
          </span>
          <span>WorkBal</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/invoices"
                className="rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              >
                Invoices
              </Link>
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                >
                  Admin
                </Link>
              )}
              <span className="hidden sm:inline text-ink-400 px-2">{session.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 font-medium text-white shadow-soft hover:bg-brand-700"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
