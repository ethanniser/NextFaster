"use client";

import { PrefetchKind } from "next/dist/client/components/router-reducer/router-reducer-types";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`, {
    priority: "low",
  });
  // only throw in dev
  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();

export const Link: typeof NextLink = (({ children, ...props }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  let prefetchTimeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (props.prefetch === false) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeout = setTimeout(async () => {
            router.prefetch(String(props.href), {
              kind: PrefetchKind.FULL,
            });
            await sleep(0);

            if (!imageCache.has(String(props.href))) {
              void prefetchImages(String(props.href)).then((images) => {
                imageCache.set(String(props.href), images);
              }, console.error);
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }, [props.href, props.prefetch]);

  const handledRef = useRef(false);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onPointerDown={(e) => {
        handledRef.current = false;

        // Only left-button mouse. Ignore touch/pen (scroll), and ignore keyboard.
        if (e.pointerType !== "mouse") return;
        if (e.button !== 0) return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const url = new URL(String(props.href), window.location.href);
        if (url.origin !== window.location.origin) return;

        e.preventDefault(); // cancel native navigation + focus quirks
        handledRef.current = true;
        router.push(String(props.href)); // earliest safe point for mouse
      }}
      onClick={(e) => {
        // Only cancel default if we *actually* handled it on pointerdown.
        if (!handledRef.current) return;
        handledRef.current = false;
        e.preventDefault();
      }}
      onMouseEnter={() => {
        router.prefetch(String(props.href), {
          kind: PrefetchKind.FULL,
        });
        const images = imageCache.get(String(props.href)) || [];
        for (const image of images) prefetchImage(image);
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  img.sizes = image.sizes;
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;
}
