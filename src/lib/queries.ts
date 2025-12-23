import { cookies } from "next/headers";
import { verifyToken } from "./session";
import {
  categories,
  products,
  subcategories,
  subcollections,
  users,
} from "@/db/schema";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { cacheTag, cacheLife } from "next/cache";
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

export async function getProductsForSubcategory(subcategorySlug: string) {
  // "use cache: remote";
  // cacheTag("subcategory-products");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting products for subcategory ", subcategorySlug, " cache for 2 hours");

  return db.query.products.findMany({
    where: (products, { eq, and }) =>
      and(eq(products.subcategory_slug, subcategorySlug)),
    orderBy: (products, { asc }) => asc(products.slug),
  });
}

export async function getCollections() {
  "use cache: remote";
  cacheTag("collections");
  cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting collections cache for 2 hours");

  return db.query.collections.findMany({
    with: {
      categories: true,
    },
    orderBy: (collections, { asc }) => asc(collections.name),
  });
}

export async function getProductDetails(productSlug: string) {
  // "use cache: remote";;
  // cacheTag("product");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting product details for", productSlug, " cache for 2 hours");

  return db.query.products.findFirst({
    where: (products, { eq }) => eq(products.slug, productSlug),
  });
}

export async function getSubcategory(subcategorySlug: string) {
  // "use cache: remote";;
  // cacheTag("subcategory");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting subcategory details for", subcategorySlug, " cache for 2 hours");

  return db.query.subcategories.findFirst({
    where: (subcategories, { eq }) => eq(subcategories.slug, subcategorySlug),
  });
}

export async function getCategory(categorySlug: string) {
  "use cache: remote";
  cacheTag("category");
  cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting category details for", categorySlug, " cache for 2 hours");

  return db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.slug, categorySlug),
    with: {
      subcollections: {
        with: {
          subcategories: true,
        },
      },
    },
  });
}

export async function getCollectionDetails(collectionSlug: string) {
  "use cache: remote";;
  cacheTag("collection");
  cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting collection details for", collectionSlug, " cache for 2 hours");

  return db.query.collections.findMany({
    with: {
      categories: true,
    },
    where: (collections, { eq }) => eq(collections.slug, collectionSlug),
    orderBy: (collections, { asc }) => asc(collections.slug),
  });
}

export async function getProductCount() {
  // "use cache: remote";;
  // cacheTag("total-product-count");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting product count cache for 2 hours");

  return db.select({ count: count() }).from(products);
}

// could be optimized by storing category slug on the products table
export async function getCategoryProductCount(categorySlug: string) {
  "use cache: remote";
  cacheTag("category-product-count");
  cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting category product count for", categorySlug, " cache for 2 hours");

  return db
    .select({ count: count() })
    .from(categories)
    .leftJoin(subcollections, eq(categories.slug, subcollections.category_slug))
    .leftJoin(
      subcategories,
      eq(subcollections.id, subcategories.subcollection_id),
    )
    .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
    .where(eq(categories.slug, categorySlug));
}

export async function getSubcategoryProductCount(subcategorySlug: string) {
  // "use cache: remote";;
  // cacheTag("subcategory-product-count");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting subcategory product count for", subcategorySlug, " cache for 2 hours");

  return db
    .select({ count: count() })
    .from(products)
    .where(eq(products.subcategory_slug, subcategorySlug));
}

export async function getSearchResults(searchTerm: string) {
  // "use cache: remote";;
  // cacheTag("search-results");
  // cacheLife({ revalidate: 60 * 60 * 2 }); // two hours

  console.log("Getting search results for", searchTerm, " cache for 2 hours");

  let results;

  // do we really need to do this hybrid search pattern?

  if (searchTerm.length <= 2) {
    // If the search term is short (e.g., "W"), use ILIKE for prefix matching
    results = await db
      .select()
      .from(products)
      .where(sql`${products.name} ILIKE ${searchTerm + "%"}`) // Prefix match
      .limit(5)
      .innerJoin(
        subcategories,
        sql`${products.subcategory_slug} = ${subcategories.slug}`,
      )
      .innerJoin(
        subcollections,
        sql`${subcategories.subcollection_id} = ${subcollections.id}`,
      )
      .innerJoin(
        categories,
        sql`${subcollections.category_slug} = ${categories.slug}`,
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
      .from(products)
      .where(
        sql`to_tsvector('english', ${products.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
      )
      .limit(5)
      .innerJoin(
        subcategories,
        sql`${products.subcategory_slug} = ${subcategories.slug}`,
      )
      .innerJoin(
        subcollections,
        sql`${subcategories.subcollection_id} = ${subcollections.id}`,
      )
      .innerJoin(
        categories,
        sql`${subcollections.category_slug} = ${categories.slug}`,
      );
  }

  return results;
}
