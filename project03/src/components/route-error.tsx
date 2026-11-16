"use client";

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-10 text-center"
    >
      <h2 className="text-2xl font-semibold">
        We couldn&apos;t load this page
      </h2>
      <p className="mt-2 text-slate-600">Please try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
