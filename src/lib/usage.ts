import { auth } from "@clerk/nextjs/server";
import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";

const FREE_POINTS = 2;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60; //30 days
const GENERATION_COST = 1;

export async function getUsageTracker() {
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: "pro" });

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma, //使用 Prisma 来持久化数据；
    tableName: "Usage", //把限流记录存储在数据库表 Usage 中；
    points: hasPremiumAccess ? PRO_POINTS : FREE_POINTS, //每个用户有 5 个点；
    duration: DURATION, //每个周期持续 30 天。
  });

  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST);

  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);

  return result;
}
