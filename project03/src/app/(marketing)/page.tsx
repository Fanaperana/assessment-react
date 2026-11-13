import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-slate-900"
        >
          Bookshelf<span className="text-amber-600">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-5 text-sm font-semibold"
        >
          <Link href="/sign-in" className="hover:text-amber-700">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-slate-900 px-5 py-3 text-white hover:bg-slate-700"
          >
            Start reading
          </Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-amber-700">
            A home for every story
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-7xl">
            Make room for your next{" "}
            <em className="font-serif text-amber-700">chapter.</em>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
            Keep the books you love close. Follow your reading progress, build a
            thoughtful shelf, and share your story with friends.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-amber-600 px-7 py-4 font-semibold text-white shadow-lg shadow-amber-900/10 hover:bg-amber-700"
            >
              Create your bookshelf →
            </Link>
            <Link
              href="/u/mayareads"
              className="rounded-full border border-slate-300 px-7 py-4 font-semibold hover:bg-white"
            >
              Explore a reader&apos;s shelf
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="relative mx-auto grid h-[420px] w-full max-w-lg grid-cols-3 items-end gap-4 rounded-[2rem] bg-[#e8e3d5] p-8 shadow-inner sm:h-[520px]"
        >
          <div className="flex h-4/5 -rotate-6 flex-col justify-between rounded-xl bg-[#29443e] p-5 text-white shadow-2xl">
            <span className="text-xs uppercase tracking-widest text-white/60">
              Volume one
            </span>
            <span className="font-serif text-3xl italic text-white">
              The art of
              <br />
              getting lost
            </span>
            <span className="text-white/60">✦ ✦ ✦</span>
          </div>
          <div className="flex h-full rotate-3 flex-col justify-between rounded-xl bg-[#c26b48] p-5 shadow-2xl">
            <span className="text-xs uppercase tracking-widest text-white/70">
              A good book
            </span>
            <span className="font-serif text-3xl italic text-white">
              Between
              <br />
              the lines
            </span>
            <span className="text-white/70">Stories stay with us</span>
          </div>
          <div className="flex h-3/4 -rotate-3 flex-col justify-between rounded-xl bg-[#4a5671] p-5 shadow-2xl">
            <span className="text-xs uppercase tracking-widest text-white/60">
              The collection
            </span>
            <span className="font-serif text-3xl italic text-white">
              Onward,
              <br />
              always
            </span>
            <span className="text-white/60">01 / 12</span>
          </div>
        </div>
      </section>
      <section className="border-t border-slate-200 bg-white/60 px-6 py-12 text-center text-sm text-slate-600">
        Your reading life, all in one beautifully simple place.
      </section>
    </main>
  );
}
