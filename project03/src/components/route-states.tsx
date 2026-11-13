export function LoadingState({
  label = "Loading your books",
}: {
  label?: string;
}) {
  return (
    <div aria-label={label} className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export function MissingState({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-slate-600">This page is not available.</p>
    </main>
  );
}
