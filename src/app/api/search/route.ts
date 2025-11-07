import { getSearchResults } from "@/lib/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // format is /api/search?q=term
  const searchTerm = request.nextUrl.searchParams.get("q");
  if (!searchTerm || !searchTerm.length) {
    return Response.json([]);
  }

  const results = await getSearchResults(searchTerm);

  const searchResults: DropSearchResult = results.map((item) => {
    const href = `/drops/${item.oceans.slug}/${item.rivers.slug}/${item.drops.slug}`;
    return {
      ...item.drops,
      href,
    };
  });
  const response = Response.json(searchResults);
  // cache for 10 minutes
  response.headers.set("Cache-Control", "public, max-age=600");
  return response;
}

export type DropSearchResult = {
  href: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string;
  price: string;
  river_slug: string;
}[];
