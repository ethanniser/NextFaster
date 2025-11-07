import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOcean } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ocean: string }>;
}): Promise<Metadata> {
  const { ocean: oceanParam } = await params;
  const urlDecoded = decodeURIComponent(oceanParam);
  const ocean = await getOcean(urlDecoded);

  if (!ocean) {
    return notFound();
  }

  const examples = ocean.seas
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ")
    .toLowerCase();

  return {
    title: `${ocean.name}`,
    openGraph: {
      title: `${ocean.name}`,
      description: `Choose from our selection of ${ocean.name.toLowerCase()}, including ${examples + (ocean.seas.length > 1 ? "," : "")} and more. In stock and ready to ship.`,
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
