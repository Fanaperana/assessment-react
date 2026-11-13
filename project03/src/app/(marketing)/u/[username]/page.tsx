import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublicProfile } from "@/lib/data/library";
import { LoadingState } from "@/components/route-states";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Reader not found" };
  const title = `${profile.user.name}'s reading profile`;
  const description = `Explore ${profile.user.name}'s ${profile.readBooks.length} finished books and reviews.`;
  return {
    title,
    description,
    alternates: { canonical: `/u/${username}` },
    openGraph: { title, description, type: "profile" },
  };
}

async function Profile({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();
  const thisYear = profile.readBooks.filter(
    ({ entry }) => entry.finishedAt?.getFullYear() === new Date().getFullYear(),
  ).length;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="text-sm font-semibold text-amber-800 hover:underline"
      >
        ← Bookshelf
      </Link>
      <header className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          Reader profile
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold">
          {profile.user.name}
        </h1>
        <p className="mt-2 text-slate-600">
          @{username} · {thisYear} books read this year
        </p>
        <a
          className="mt-5 inline-block text-sm font-semibold text-amber-800 underline"
          href={`/u/${username}/feed.xml`}
        >
          Subscribe to reviews
        </a>
      </header>
      <section className="mt-12" aria-labelledby="read-heading">
        <h2 id="read-heading" className="font-serif text-3xl font-bold">
          Finished books
        </h2>
        {profile.readBooks.length === 0 ? (
          <p className="mt-6 text-slate-600">No finished books yet.</p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profile.readBooks.map(({ entry, book }) => (
              <li key={entry.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  {book.coverId ? (
                    <Image
                      src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                      alt={`Cover of ${book.title}`}
                      width={80}
                      height={120}
                      className="h-30 w-20 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="h-30 w-20 rounded bg-amber-100"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <h3 className="font-serif text-lg font-bold">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600">{book.authors}</p>
                    {entry.rating && (
                      <p
                        className="mt-2"
                        aria-label={`${entry.rating} out of 5 stars`}
                      >
                        {"★".repeat(entry.rating)}
                        <span aria-hidden="true">
                          {"☆".repeat(5 - entry.rating)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {entry.review && (
                  <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">
                    {entry.review}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function ProfilePage(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-12">
          <LoadingState label="Loading profile" />
        </main>
      }
    >
      <Profile {...props} />
    </Suspense>
  );
}
