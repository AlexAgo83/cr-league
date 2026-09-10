import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 6's engine read `?schema=` off the connection URL and applied it to
 * everything. The driver adapter does neither by itself:
 *
 * - it takes the schema as an option, which qualifies *generated* queries only;
 * - raw queries (`$queryRaw`, `$executeRawUnsafe`) are passed through verbatim,
 *   so they resolve against the connection's `search_path`.
 *
 * `persistence.ts` locks rows with unqualified raw SQL, so the search_path has
 * to be set on the connection as well, not just the adapter option.
 */
export function schemaFromUrl(connectionString: string): string | undefined {
  return new URL(connectionString).searchParams.get("schema") ?? undefined;
}

export function createPgAdapter(connectionString: string) {
  const schema = schemaFromUrl(connectionString);
  return new PrismaPg(
    { connectionString, options: schema ? `-c search_path="${schema}"` : undefined },
    { schema }
  );
}
