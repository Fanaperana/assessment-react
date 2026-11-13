import { getPublicProfile } from "@/lib/data/library";
import { escapeXml } from "@/lib/rss";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return new Response("Not found", { status: 404 });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const reviews = profile.readBooks
    .filter(({ entry }) => entry.review)
    .sort((a, b) => b.entry.updatedAt.getTime() - a.entry.updatedAt.getTime())
    .slice(0, 20);
  const items = reviews
    .map(
      ({ entry, book }) =>
        `<item><title>${escapeXml(book.title)}</title><link>${base}/books/${book.id}</link><guid>${base}/books/${book.id}#review-${entry.id}</guid><pubDate>${entry.updatedAt.toUTCString()}</pubDate><description>${escapeXml(entry.review ?? "")}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(profile.user.name)}'s reviews</title><link>${base}/u/${username}</link><description>Recent book reviews by ${escapeXml(profile.user.name)}</description>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
