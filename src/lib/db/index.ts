import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // In dev we want a clear error; in build we tolerate (e.g. during static analysis)
  if (process.env.NODE_ENV !== "production" && process.env.SKIP_DB_CHECK !== "1") {
    console.warn("[evalo] DATABASE_URL not set");
  }
}

const client =
  globalForDb.client ??
  postgres(connectionString ?? "postgresql://placeholder", {
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
