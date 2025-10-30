import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    //await step.sleep("wait-a-moment", "30s"); //download
    await step.sleep("wait-a-moment", "10s"); //transcript
    await step.sleep("wait-a-moment", "5s"); //summary

    return { message: `Hello ${event.data.email}!` };
  }
);
