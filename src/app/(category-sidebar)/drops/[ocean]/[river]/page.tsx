import { notFound } from "next/navigation";
import { ProductLink } from "@/components/ui/product-card";
import type { Metadata } from "next";
import {
  getDropsForRiver,
  getRiver,
  getRiverDropCount,
} from "@/lib/queries";
// import { db } from "@/db";

// export async function generateStaticParams() {
//   const results = await db.query.rivers.findMany({
//     with: {
//       sea: {
//         with: {
//           ocean: true,
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     ocean: s.sea.ocean.slug,
//     river: s.slug,
//   }));
// }

export async function generateMetadata(props: {
  params: Promise<{ ocean: string; river: string }>;
}): Promise<Metadata> {
  const { river: riverParam } = await props.params;
  const urlDecodedRiver = decodeURIComponent(riverParam);

  const [river, rows] = await Promise.all([
    getRiver(urlDecodedRiver),
    getRiverDropCount(urlDecodedRiver),
  ]);

  if (!river) {
    return notFound();
  }

  const description = rows[0]?.count
    ? `Choose from over ${rows[0]?.count - 1} drops in ${river.name}. In stock and ready to ship.`
    : undefined;

  return {
    openGraph: { title: river.name, description },
  };
}

export default async function Page(props: {
  params: Promise<{
    river: string;
    ocean: string;
  }>;
}) {
  const { river, ocean } = await props.params;
  // const urlDecodedOcean = decodeURIComponent(ocean);
  const urlDecodedRiver = decodeURIComponent(river);
  const [drops, countRes] = await Promise.all([
    getDropsForRiver(urlDecodedRiver),
    getRiverDropCount(urlDecodedRiver),
  ]);

  if (!drops) {
    return notFound();
  }

  const finalCount = countRes[0]?.count;
  return (
    <div className="container mx-auto p-4">
      {finalCount > 0 ? (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Drop" : "Drops"}
        </h1>
      ) : (
        <p>No drops for this river</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {drops.map((drop) => (
          <ProductLink
            key={drop.name}
            loading="eager"
            ocean_slug={ocean}
            river_slug={river}
            drop={drop}
            imageUrl={drop.image_url}
          />
        ))}
      </div>
    </div>
  );
}
