import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/data/library";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  const name = profile?.user.name ?? "Bookshelf reader";
  const books = profile?.readBooks ?? [];
  const thisYear = books.filter(
    ({ entry }) => entry.finishedAt?.getFullYear() === new Date().getFullYear(),
  ).length;
  const covers = books.filter(({ book }) => book.coverId).slice(0, 3);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#142038",
        color: "#fff",
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 30,
          maxWidth: 600,
        }}
      >
        <div style={{ fontSize: 30, color: "#fbbf24" }}>
          BOOKSHELF · READER PROFILE
        </div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 34 }}>{thisYear} books read this year</div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {covers.map(({ book }) => (
          // ImageResponse renders standard image elements; next/image is unavailable here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={book.id}
            src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
            alt=""
            width={130}
            height={195}
            style={{ objectFit: "cover", borderRadius: 10 }}
          />
        ))}
      </div>
    </div>,
    size,
  );
}
