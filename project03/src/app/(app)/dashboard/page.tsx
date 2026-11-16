import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GoalForm } from "@/components/forms/goal-form";
import { BookCard } from "@/components/book-card";
import { getDashboard, getShelf } from "@/lib/data/library";
import { requireUser } from "@/lib/data/session";

export const metadata: Metadata = { title: "Dashboard" };

function WidgetSkeleton() {
  return (
    <div
      className="h-60 animate-pulse rounded-2xl bg-slate-200"
      aria-label="Loading dashboard widget"
    />
  );
}

async function ShelfCounts() {
  const user = await requireUser();
  const { counts } = await getDashboard(user.id);
  const shelves = [
    { key: "want", label: "Want to read" },
    { key: "reading", label: "Reading" },
    { key: "read", label: "Read" },
  ] as const;
  return (
    <section aria-label="Books per shelf" className="grid gap-4 sm:grid-cols-3">
      {shelves.map(({ key, label }) => (
        <Link
          key={key}
          href={`/shelves/${key}`}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-400"
        >
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-5 text-5xl font-semibold">{counts[key]}</p>
          <p className="mt-3 text-sm text-amber-700">View shelf →</p>
        </Link>
      ))}
    </section>
  );
}

async function PagesWidget() {
  const user = await requireUser();
  const { pagesThisMonth } = await getDashboard(user.id);
  return (
    <section className="rounded-2xl bg-[#29443e] p-7 text-white">
      <p className="text-sm font-medium text-white/75">Pages read this month</p>
      <p className="mt-6 text-6xl font-semibold">{pagesThisMonth}</p>
      <p className="mt-4 text-sm text-white/75">Every page counts.</p>
    </section>
  );
}

async function GoalWidget() {
  const user = await requireUser();
  const { readThisYear, targetBooks, goalProgress } = await getDashboard(
    user.id,
  );
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7">
      <p className="text-sm font-medium text-slate-600">
        {new Date().getFullYear()} reading goal
      </p>
      <p className="mt-3 text-3xl font-semibold">
        {readThisYear}{" "}
        <span className="text-lg font-normal text-slate-500">
          / {targetBooks} books
        </span>
      </p>
      <div
        role="progressbar"
        aria-label="Reading goal progress"
        aria-valuenow={goalProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-amber-600"
          style={{ width: `${goalProgress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-600">{goalProgress}% complete</p>
      <GoalForm target={targetBooks} />
    </section>
  );
}

async function RecentReads() {
  const user = await requireUser();
  const books = await getShelf(user.id, "read");
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recently read</h2>
        <Link
          href="/shelves/read"
          className="text-sm font-semibold text-amber-700 hover:underline"
        >
          View all →
        </Link>
      </div>
      {books?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {books.slice(0, 5).map(({ book }) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-slate-600">
          Your finished books will appear here.
        </p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <main>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
        Your reading life
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        The dashboard
      </h1>
      <p className="mt-3 mb-9 text-slate-600">
        Your next great story starts here.
      </p>
      <Suspense fallback={<WidgetSkeleton />}>
        <ShelfCounts />
      </Suspense>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Suspense fallback={<WidgetSkeleton />}>
          <PagesWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <GoalWidget />
        </Suspense>
      </div>
      <Suspense fallback={<WidgetSkeleton />}>
        <RecentReads />
      </Suspense>
    </main>
  );
}
