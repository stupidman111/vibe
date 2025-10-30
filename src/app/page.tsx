"use client";

import { Button } from "@/components/ui/button";
import { inngest } from "@/inngest/client";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success("Background job started");
      },
    })
  );

  const handleTrigger = async () => {
    console.log("handleTrigger");
    // 发送事件 "test/hello.world"，触发 helloWorld 函数
    await inngest.send({
      name: "test/hello.world", // 必须与函数监听的事件名称一致
      data: { email: "user@example.com" }, // 传递给函数的事件数据
    });
    alert("事件已发送，helloWorld 函数将被触发");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button
        disabled={invoke.isPending}
        onClick={() => invoke.mutate({ text: "John" })}
      >
        Invoke Background Job
      </Button>

      <Button onClick={handleTrigger}>Click me</Button>
    </div>
  );
};

export default Page;
