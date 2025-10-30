// import { createAgent, openai } from "@inngest/agent-kit";
// import { inngest } from "./client";

// export const helloWorld = inngest.createFunction(
//   { id: "hello-world" },
//   { event: "test/hello.world" },
//   async ({ event }) => {
//     const summarizer = createAgent({
//       name: "summarizer",
//       system: "You are an expert summarizer.  You summarize in 2 words",
//       model: openai({ model: "gpt-4o" }),
//     });

//     const { output } = await summarizer.run(
//       `summarize the following text: ${event.data.value}`
//     );

//     return { output };
//   }
// );

// functions/helloWorld.ts

import { ChatMessage, deepseekChat } from "../lib/deepseekClient";
import { inngest } from "./client";

export async function handleHelloWorld(eventData: { value: string }) {
  const inputText = eventData?.value ?? "";
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an expert next.js developer. You write readable, maintainable code. You write simple Next.js & React snippets.",
    },
    {
      role: "user",
      content: `Write the following snippet: ${inputText}`,
    },
  ];

  // 优先使用环境变量里指定的 model，否则默认 "deepseek-chat"
  const model = process.env.PREFERRED_DEEPSEEK_MODEL ?? "deepseek-chat";

  const { text, raw } = await deepseekChat({
    messages,
    model,
    max_tokens: 600,
    timeoutMs: 25000,
  });

  // 仅记录简要日志，避免写入敏感原始数据
  console.info("[handleHelloWorld] used model:", model);
  return { output: text, rawMeta: { id: raw?.id ?? null } };
}

// 导出给 Inngest 使用
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    // 直接复用 handler
    const result = await handleHelloWorld({ value: event.data?.value ?? "" });
    return result;
  }
);
