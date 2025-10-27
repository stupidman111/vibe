// "use client";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { Client } from "./client";

// import { useTRPC } from "@/trpc/client";
// import { useQuery } from "@tanstack/react-query";

// const Page = () => {
//   const trpc = useTRPC();
//   //trpc.createAI.queryOptions({ text: "123" });
//   const { data } = useQuery(trpc.createAI.queryOptions({ text: "Zy" }));

//   return <div>{JSON.stringify(data)}</div>;
// };

// export default Page;

// const Page = async () => {
//   const data = await caller.createAI({ text: "Zy from server." });
//   return <div>{JSON.stringify(data)}</div>;
// };

// export default Page;

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.createAI.queryOptions({ text: "Zy PREFETCH" })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
