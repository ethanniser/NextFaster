import { cookies } from "next/headers";
import { verifyToken } from "./session";
import {
  oceans,
  drops,
  rivers,
  seas,
  users,
} from "@/db/schema";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { unstable_cache } from "./unstable-cache";
import { sql } from "drizzle-orm";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export const getDropsForRiver = unstable_cache(
  (riverSlug: string) =>
    db.query.drops.findMany({
      where: (drops, { eq, and }) =>
        and(eq(drops.river_slug, riverSlug)),
      orderBy: (drops, { asc }) => asc(drops.slug),
    }),
  ["river-drops"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getPlanets = unstable_cache(
  () =>
    db.query.planets.findMany({
      with: {
        oceans: true,
      },
      orderBy: (planets, { asc }) => asc(planets.name),
    }),
  ["planets"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getDropDetails = unstable_cache(
  (dropSlug: string) =>
    db.query.drops.findFirst({
      where: (drops, { eq }) => eq(drops.slug, dropSlug),
    }),
  ["drop"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getRiver = unstable_cache(
  (riverSlug: string) =>
    db.query.rivers.findFirst({
      where: (rivers, { eq }) => eq(rivers.slug, riverSlug),
    }),
  ["river"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getOcean = unstable_cache(
  (oceanSlug: string) =>
    db.query.oceans.findFirst({
      where: (oceans, { eq }) => eq(oceans.slug, oceanSlug),
      with: {
        seas: {
          with: {
            rivers: true,
          },
        },
      },
    }),
  ["ocean"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getPlanetDetails = unstable_cache(
  async (planetSlug: string) =>
    db.query.planets.findMany({
      with: {
        oceans: true,
      },
      where: (planets, { eq }) => eq(planets.slug, planetSlug),
      orderBy: (planets, { asc }) => asc(planets.slug),
    }),
  ["planet"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getDropCount = unstable_cache(
  () => db.select({ count: count() }).from(drops),
  ["total-drop-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

// could be optimized by storing ocean slug on the drops table
export const getOceanDropCount = unstable_cache(
  (oceanSlug: string) =>
    db
      .select({ count: count() })
      .from(oceans)
      .leftJoin(
        seas,
        eq(oceans.slug, seas.ocean_slug),
      )
      .leftJoin(
        rivers,
        eq(seas.id, rivers.sea_id),
      )
      .leftJoin(drops, eq(rivers.slug, drops.river_slug))
      .where(eq(oceans.slug, oceanSlug)),
  ["ocean-drop-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getRiverDropCount = unstable_cache(
  (riverSlug: string) =>
    db
      .select({ count: count() })
      .from(drops)
      .where(eq(drops.river_slug, riverSlug)),
  ["river-drop-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSearchResults = unstable_cache(
  async (searchTerm: string) => {
    let results;

    // do we really need to do this hybrid search pattern?

    if (searchTerm.length <= 2) {
      // If the search term is short (e.g., "W"), use ILIKE for prefix matching
      results = await db
        .select()
        .from(drops)
        .where(sql`${drops.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          rivers,
          sql`${drops.river_slug} = ${rivers.slug}`,
        )
        .innerJoin(
          seas,
          sql`${rivers.sea_id} = ${seas.id}`,
        )
        .innerJoin(
          oceans,
          sql`${seas.ocean_slug} = ${oceans.slug}`,
        );
    } else {
      // For longer search terms, use full-text search with tsquery
      const formattedSearchTerm = searchTerm
        .split(" ")
        .filter((term) => term.trim() !== "") // Filter out empty terms
        .map((term) => `${term}:*`)
        .join(" & ");

      results = await db
        .select()
        .from(drops)
        .where(
          sql`to_tsvector('english', ${drops.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          rivers,
          sql`${drops.river_slug} = ${rivers.slug}`,
        )
        .innerJoin(
          seas,
          sql`${rivers.sea_id} = ${seas.id}`,
        )
        .innerJoin(
          oceans,
          sql`${seas.ocean_slug} = ${oceans.slug}`,
        );
    }

    return results;
  },
  ["search-results"],
  { revalidate: 60 * 60 * 2 }, // two hours
);
