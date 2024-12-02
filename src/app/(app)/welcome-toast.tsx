"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 850) return;
    if (!document.cookie.includes("welcome-toast=3")) {
      toast("🚀 Welcome to NextFaster!", {
        id: "welcome-toast",
        duration: Infinity,
        onDismiss: () => {
          document.cookie += "welcome-toast=3;max-age=31536000";
        },
        description: (
          <>
            This is a highly performant e-commerce template using Next.js. All
            of the 1M products on this site are AI generated.
            <hr className="my-2" />
            This demo is to highlight the speed a full-stack Next.js site can
            achieve.{" "}
            <a
              href="https://github.com/ethanniser/NextFaster"
              className="font-semibold text-accent1 hover:underline"
              target="_blank"
            >
              Get the Source
            </a>
            .
          </>
        ),
      });
    }
  }, []);

  return null;
}
