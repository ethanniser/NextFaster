"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

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

export const Link: typeof NextLink = (({ children, ...props }) => {
  const [preloading, setPreloading] = useState<(() => void)[]>([]);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={async () => {
        const images = await prefetchImages(String(props.href));
        router.prefetch(String(props.href));
        if (preloading.length) return;
        const p: (() => void)[] = [];
        for (const image of images) {
          const remove = prefetchImage(image);
          if (remove) p.push(remove);
        }
        setPreloading(p);
      }}
      onMouseLeave={() => {
        for (const remove of preloading) {
          remove();
        }
        setPreloading([]);
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
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
  let done = false;
  img.onload = img.onerror = () => {
    done = true;
  };
  return () => {
    if (done) return;
    img.src = img.srcset = "";
    seen.delete(image.srcset);
  };
}
