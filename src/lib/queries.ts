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
import { unstable_cache } from "./unstable-cache";
import { sql } from "drizzle-orm";
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("next-faster");

export async function getUser() {
  return tracer.startActiveSpan("db.getUser", async (span) => {
    try {
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
    } finally {
      span.end();
    }
  });
}

export const getProductsForSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    tracer.startActiveSpan("db.getProductsForSubcategory", async (span) => {
      try {
        span.setAttribute("subcategory.slug", subcategorySlug);
        return await db.query.products.findMany({
          where: (products, { eq, and }) =>
            and(eq(products.subcategory_slug, subcategorySlug)),
          orderBy: (products, { asc }) => asc(products.slug),
        });
      } finally {
        span.end();
      }
    }),
  ["subcategory-products"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollections = unstable_cache(
  () =>
    tracer.startActiveSpan("db.getCollections", async (span) => {
      try {
        return await db.query.collections.findMany({
          with: {
            categories: true,
          },
          orderBy: (collections, { asc }) => asc(collections.name),
        });
      } finally {
        span.end();
      }
    }),
  ["collections"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductDetails = unstable_cache(
  (productSlug: string) =>
    tracer.startActiveSpan("db.getProductDetails", async (span) => {
      try {
        span.setAttribute("product.slug", productSlug);
        return await db.query.products.findFirst({
          where: (products, { eq }) => eq(products.slug, productSlug),
        });
      } finally {
        span.end();
      }
    }),
  ["product"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    tracer.startActiveSpan("db.getSubcategory", async (span) => {
      try {
        span.setAttribute("subcategory.slug", subcategorySlug);
        return await db.query.subcategories.findFirst({
          where: (subcategories, { eq }) =>
            eq(subcategories.slug, subcategorySlug),
        });
      } finally {
        span.end();
      }
    }),
  ["subcategory"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCategory = unstable_cache(
  (categorySlug: string) =>
    tracer.startActiveSpan("db.getCategory", async (span) => {
      try {
        span.setAttribute("category.slug", categorySlug);
        return await db.query.categories.findFirst({
          where: (categories, { eq }) => eq(categories.slug, categorySlug),
          with: {
            subcollections: {
              with: {
                subcategories: true,
              },
            },
          },
        });
      } finally {
        span.end();
      }
    }),
  ["category"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollectionDetails = unstable_cache(
  async (collectionSlug: string) =>
    tracer.startActiveSpan("db.getCollectionDetails", async (span) => {
      try {
        span.setAttribute("collection.slug", collectionSlug);
        return await db.query.collections.findMany({
          with: {
            categories: true,
          },
          where: (collections, { eq }) => eq(collections.slug, collectionSlug),
          orderBy: (collections, { asc }) => asc(collections.slug),
        });
      } finally {
        span.end();
      }
    }),
  ["collection"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductCount = unstable_cache(
  () =>
    tracer.startActiveSpan("db.getProductCount", async (span) => {
      try {
        return await db.select({ count: count() }).from(products);
      } finally {
        span.end();
      }
    }),
  ["total-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

// could be optimized by storing category slug on the products table
export const getCategoryProductCount = unstable_cache(
  (categorySlug: string) =>
    tracer.startActiveSpan("db.getCategoryProductCount", async (span) => {
      try {
        span.setAttribute("category.slug", categorySlug);
        return await db
          .select({ count: count() })
          .from(categories)
          .leftJoin(
            subcollections,
            eq(categories.slug, subcollections.category_slug),
          )
          .leftJoin(
            subcategories,
            eq(subcollections.id, subcategories.subcollection_id),
          )
          .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
          .where(eq(categories.slug, categorySlug));
      } finally {
        span.end();
      }
    }),
  ["category-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategoryProductCount = unstable_cache(
  (subcategorySlug: string) =>
    tracer.startActiveSpan(
      "db.getSubcategoryProductCount",
      async (span) => {
        try {
          span.setAttribute("subcategory.slug", subcategorySlug);
          return await db
            .select({ count: count() })
            .from(products)
            .where(eq(products.subcategory_slug, subcategorySlug));
        } finally {
          span.end();
        }
      },
    ),
  ["subcategory-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSearchResults = unstable_cache(
  async (searchTerm: string) =>
    tracer.startActiveSpan("db.getSearchResults", async (span) => {
      try {
        span.setAttribute("search.term", searchTerm);
        span.setAttribute(
          "search.strategy",
          searchTerm.length <= 2 ? "prefix" : "fulltext",
        );

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

        span.setAttribute("search.resultCount", results.length);
        return results;
      } finally {
        span.end();
      }
    }),
  ["search-results"],
  { revalidate: 60 * 60 * 2 }, // two hours
);
