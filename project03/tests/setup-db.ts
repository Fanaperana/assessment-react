import { join } from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

export default async function setupDatabase() {
  const client = createClient({
    url: process.env.E2E_DATABASE_URL ?? "file:./test-e2e.db",
  });
  await migrate(drizzle(client), {
    migrationsFolder: join(process.cwd(), "drizzle"),
  });
  client.close();
}
