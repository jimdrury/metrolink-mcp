import { Client } from "pg";

// Get DATABASE_URL directly from process.env
const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return url;
};

const isLocalDatabase = (connectionString: string): boolean => {
  return connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
};

const databaseUrl = getDatabaseUrl();
const isLocal = isLocalDatabase(databaseUrl);

// Create a new client for each query - simpler and avoids pool conflicts during HMR
const createClient = (): Client => {
  return new Client({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    statement_timeout: 10000, // 10 second timeout
    query_timeout: 10000,
    connectionTimeoutMillis: 5000,
  });
};

// Database query helper - creates a new connection for each query
export const query = async <T>(text: string, params?: unknown[]): Promise<T[]> => {
  const client = createClient();

  try {
    await client.connect();
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    // Close the client connection without awaiting - let it cleanup asynchronously
    // Awaiting client.end() can hang when multiple connections are closing concurrently
    client.end().catch(() => {});
  }
};
