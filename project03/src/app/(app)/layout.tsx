import Link from "next/link";
import { Suspense } from "react";
import { signOutAction } from "@/actions/auth";
import { requireUser } from "@/lib/data/session";

async function AuthenticatedShell({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <>
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tight"
          >
            Bookshelf<span className="text-amber-600">.</span>
          </Link>
          <nav
            aria-label="Library navigation"
            className="flex flex-wrap items-center gap-4 text-sm font-semibold sm:gap-7"
          >
            <Link href="/dashboard" className="hover:text-amber-700">
              Dashboard
            </Link>
            <Link href="/search" className="hover:text-amber-700">
              Find books
            </Link>
            <Link href="/shelves/reading" className="hover:text-amber-700">
              My shelves
            </Link>
            <Link href={`/u/${user.username}`} className="hover:text-amber-700">
              Public profile
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {children}
      </div>
      {modal}
    </>
  );
}

export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl animate-pulse space-y-8 px-6 py-10">
          <div className="h-16 rounded-xl bg-slate-200" />
          <div className="h-72 rounded-xl bg-slate-200" />
        </div>
      }
    >
      <AuthenticatedShell modal={modal}>{children}</AuthenticatedShell>
    </Suspense>
  );
}
