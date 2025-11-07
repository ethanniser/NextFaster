import { Link } from "@/components/ui/link";
import { db } from "@/db";
import { planets } from "@/db/schema";
import { getPlanetDetails } from "@/lib/queries";

import Image from "next/image";

export async function generateStaticParams() {
  return await db.select({ planet: planets.slug }).from(planets);
}

export default async function Home(props: {
  params: Promise<{
    planet: string;
  }>;
}) {
  const planetName = decodeURIComponent((await props.params).planet);

  const planets = await getPlanetDetails(planetName);
  let imageCount = 0;

  return (
    <div className="w-full p-4">
      {planets.map((planet) => (
        <div key={planet.name}>
          <h2 className="text-xl font-semibold">{planet.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {planet.oceans.map((ocean) => (
              <Link
                prefetch={true}
                key={ocean.name}
                className="flex w-[125px] flex-col items-center text-center"
                href={`/drops/${ocean.slug}`}
              >
                <Image
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  decoding="sync"
                  src={ocean.image_url ?? "/placeholder.svg"}
                  alt={`A small picture of ${ocean.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  width={48}
                  height={48}
                  quality={65}
                />
                <span className="text-xs">{ocean.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
