import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 6 read `?schema=` off the connection URL itself. The driver adapter
 * does not: it takes the schema as an option, and without it every query runs
 * against `public` while migrations land in the schema the URL names.
 */
export function schemaFromUrl(connectionString: string): string | undefined {
  return new URL(connectionString).searchParams.get("schema") ?? undefined;
}

export function createPgAdapter(connectionString: string) {
  return new PrismaPg({ connectionString }, { schema: schemaFromUrl(connectionString) });
}
