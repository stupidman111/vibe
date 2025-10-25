import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * 在非生产环境下，把 prisma 缓存在 global 上
 * （主要解决在开发环境中使用 Next.js 或 Vite 时，
 * 由于热重载导致 PrismaClient 被重复实例化的问题，
 * 否则会出现数据库连接过多的错误。）
 *
 * 生产环境不会缓存，因为每次部署都希望是干净的实例。
 */
