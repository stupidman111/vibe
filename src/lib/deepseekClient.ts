// lib/deepseekClient.ts
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function deepseekChat(opts: {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  timeoutMs?: number;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error(
      "DeepSeek API key not found (set DEEPSEEK_API_KEY or OPENAI_API_KEY)"
    );

  const base = (
    process.env.DEEPSEEK_API_BASE ??
    process.env.OPENAI_API_BASE ??
    "https://api.deepseek.com/v1"
  ).replace(/\/$/, "");
  const model =
    opts.model ?? process.env.PREFERRED_DEEPSEEK_MODEL ?? "deepseek-chat";
  const max_tokens = opts.max_tokens ?? 800;

  const body = { model, messages: opts.messages, max_tokens };

  const controller = new AbortController();
  const timeout = opts.timeoutMs ?? 30000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const respText = await res.text();

    if (!res.ok) {
      // 尝试解析错误信息
      let parsed: any = null;
      try {
        parsed = JSON.parse(respText);
      } catch (error) {
        /* ignore */
      }

      const errMsg = parsed?.error?.message ?? respText ?? `HTTP ${res.status}`;

      // 若模型不存在，则自动 fallback 到 deepseek-chat（除非已经是 deepseek-chat）
      if (
        typeof errMsg === "string" &&
        errMsg.toLowerCase().includes("model not exist") &&
        model !== "deepseek-chat"
      ) {
        console.warn(
          `[deepseekClient] model "${model}" not exist, falling back to "deepseek-chat"`
        );
        return deepseekChat({
          messages: opts.messages,
          model: "deepseek-chat",
          max_tokens,
          timeoutMs: timeout,
        });
      }

      throw new Error(`DeepSeek API error ${res.status}: ${errMsg}`);
    }

    // 成功返回，解析 JSON
    const json = JSON.parse(respText);
    const content =
      json?.choices?.[0]?.message?.content ?? json?.choices?.[0]?.text ?? "";
    return { raw: json, text: String(content) };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`DeepSeek request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
