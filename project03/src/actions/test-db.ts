import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";

export const testClient = createClient({ url: ":memory:" });
export const testDb = drizzle(testClient, { schema });
