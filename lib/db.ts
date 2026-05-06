import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let _client: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!_client) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    _client = new PrismaClient({ adapter });
  }
  return _client;
}
