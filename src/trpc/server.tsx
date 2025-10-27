import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import "server-only"; // <-- ensure this file cannot be imported from the client
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.

// 为 QueryClient 创建一个稳定的获取器（使用 cache），确保同一次请求中返回同一个实例
export const getQueryClient = cache(makeQueryClient);

// 创建 tRPC 选项代理，用于服务端调用
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext, // 上下文创建函数
  router: appRouter, // 后端路由定义
  queryClient: getQueryClient, // 服务端的 QueryClient 实例
});

export const caller = appRouter.createCaller(createTRPCContext);
