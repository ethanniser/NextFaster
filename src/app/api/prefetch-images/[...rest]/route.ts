import { NextRequest, NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { cacheLife } from "next/cache";

function getHostname() {
  if (process.env.NODE_ENV === "development") {
    return "localhost:3000";
  }
  if (process.env.VERCEL_ENV === "production") {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  if (process.env.VERCEL_BRANCH_URL) {
    return process.env.VERCEL_BRANCH_URL;
  }
  return "localhost:3000";
}

async function fetchAndProcessImages(url: string) {
  "use cache";

  const response = await fetch(url);
  if (!response.ok) {
    return { error: true, status: response.status, images: null };
  }
  const body = await response.text();
  const { document } = parseHTML(body);
  const images = Array.from(document.querySelectorAll("main img"))
    .map((img) => ({
      srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
      sizes: img.getAttribute("sizes"),
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      loading: img.getAttribute("loading"),
    }))
    .filter((img) => img.src);

  return { error: false, status: 200, images };
}

export async function GET(
  _: NextRequest,
  { params }: { params: { rest: string[] } },
) {
  const schema = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = getHostname();
  if (!host) {
    return new Response("Failed to get hostname from env", { status: 500 });
  }
  const href = (await params).rest.join("/");
  if (!href) {
    return new Response("Missing url parameter", { status: 400 });
  }
  const url = `${schema}://${host}/${href}`;

  const result = await fetchAndProcessImages(url);

  if (result.error) {
    return new Response("Failed to fetch", { status: result.status });
  }

  return NextResponse.json(
    { images: result.images },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
