import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

/**
 *
 * @returns 一个新的 QueryClient 实例，配置了默认选项，包括数据转换和查询状态管理。
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, //定义了数据被视为 “新鲜”（未过期）的时间。
      },
      //dehydrate 与 hydrate：服务端渲染（SSR）的 “脱水” 与 “注水”
      dehydrate: {
        serializeData: superjson.serialize, // 服务端序列化
        // 定义了哪些查询状态需要 “脱水”（即序列化）。
        // 这里包括默认的 dehydrate 条件，以及状态为 “pending” 的查询。
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize, // 客户端反序列化
      },
    },
  });
}
