import { ProductLink } from "@/components/ui/product-card";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Metadata } from "next";

import { getDropDetails, getDropsForRiver } from "@/lib/queries";
// import { db } from "@/db";

// export async function generateStaticParams() {
//   const results = await db.query.drops.findMany({
//     with: {
//       river: {
//         with: {
//           sea: {
//             with: {
//               ocean: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   return results.map((s) => ({
//     ocean: s.river.sea.ocean.slug,
//     river: s.river.slug,
//     drop: s.slug,
//   }));
// }

export async function generateMetadata(props: {
  params: Promise<{ drop: string; ocean: string; river: string }>;
}): Promise<Metadata> {
  const { drop: dropParam } = await props.params;
  const urlDecodedDrop = decodeURIComponent(dropParam);

  const drop = await getDropDetails(urlDecodedDrop);

  if (!drop) {
    return notFound();
  }

  return {
    openGraph: { title: drop.name, description: drop.description },
  };
}

export default async function Page(props: {
  params: Promise<{
    drop: string;
    river: string;
    ocean: string;
  }>;
}) {
  const { drop, river, ocean } = await props.params;
  const urlDecodedDrop = decodeURIComponent(drop);
  const urlDecodedRiver = decodeURIComponent(river);
  const [dropData, relatedUnshifted] = await Promise.all([
    getDropDetails(urlDecodedDrop),
    getDropsForRiver(urlDecodedRiver),
  ]);

  if (!dropData) {
    return notFound();
  }
  const currentDropIndex = relatedUnshifted.findIndex(
    (p) => p.slug === dropData.slug,
  );
  const related = [
    ...relatedUnshifted.slice(currentDropIndex + 1),
    ...relatedUnshifted.slice(0, currentDropIndex),
  ];

  return (
    <div className="container p-4">
      <h1 className="border-t-2 pt-1 text-xl font-bold text-accent1">
        {dropData.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Image
            loading="eager"
            decoding="sync"
            src={dropData.image_url ?? "/placeholder.svg?height=64&width=64"}
            alt={`A small picture of ${dropData.name}`}
            height={256}
            quality={80}
            width={256}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="flex-grow text-base">{dropData.description}</p>
        </div>
        <p className="text-xl font-bold">
          ${parseFloat(dropData.price).toFixed(2)}
        </p>
        <AddToCartForm dropSlug={dropData.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="text-lg font-bold text-accent1">
            Explore more drops
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related?.map((drop) => (
            <ProductLink
              key={drop.name}
              loading="lazy"
              ocean_slug={ocean}
              river_slug={river}
              drop={drop}
              imageUrl={drop.image_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
