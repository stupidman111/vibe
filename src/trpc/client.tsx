"use client";
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

// 创建 tRPC 上下文工具
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

//根据环境创建 / 复用 QueryClient
let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    // 服务端：每次都创建新的 QueryClient
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  // 浏览器端：复用单例，避免重复创建
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// 获取 tRPC 接口的基础 URL
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""; // 浏览器端：用相对路径
    return process.env.NEXT_PUBLIC_APP_URL; // 服务端：用环境变量的基础 URL
  })();
  return `${base}/api/trpc`;
}

// 根提供者组件，用于包裹应用的根组件
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
