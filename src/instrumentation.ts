import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "next-faster",
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: ["next-faster.vercel.app"],
      },
    },
  });
}
