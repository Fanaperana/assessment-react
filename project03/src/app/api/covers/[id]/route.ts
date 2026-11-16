import { getCoverDataUrl } from "@/lib/data/open-library";

const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" role="img"><rect width="200" height="300" fill="#f7e7bb"/><rect x="30" y="50" width="140" height="190" rx="8" fill="#17233a"/><path d="M55 80h90M55 105h75M55 130h85" stroke="#f7e7bb" stroke-width="6"/><text x="100" y="200" text-anchor="middle" fill="#f7e7bb" font-family="serif" font-size="19">Bookshelf</text></svg>`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id))
    return new Response("Invalid cover ID", { status: 400 });
  const src = await getCoverDataUrl(Number(id));
  if (src) {
    return new Response(Buffer.from(src.split(",")[1], "base64"), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
  return new Response(fallback, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
