import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPublicUsernames } from "@/lib/data/library";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const users = await getPublicUsernames();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...users.map(({ username }) => ({
      url: `${base}/u/${username}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
