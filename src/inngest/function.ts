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

import { Sandbox } from "@e2b/code-interpreter";

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

  async ({ event, step }) => {
    //
    const tmplName = "vibe-nextjs-test-09132247";

    // 创建沙箱环境
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create(tmplName);
      console.log("created sandbox id:", sandbox.sandboxId); //created sandbox id: iqsg0ejflfmlnrn4rwygp
      return sandbox.sandboxId;
    });

    // 直接复用 handler
    const result = await handleHelloWorld({ value: event.data?.value ?? "" });

    // 获取沙箱环境 URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await Sandbox.create(tmplName);
      //const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      console.log("sandbox host:", host);
      console.log("sandbox url:", `https://${host}`);
      return `https://${host}`;
    });

    console.log(sandboxUrl);

    return { output: result.output, sandboxUrl };
  }
);
