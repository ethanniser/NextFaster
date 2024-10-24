import { db } from "@/db";
import { cookies } from "next/headers";
import { z } from "zod";

const cartSchema = z.array(
  z.object({
    product: z.object({
      slug: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.string(), // numeric string
      subcategory_slug: z.string(),
      image_url: z.string().nullable(),
    }),
    categorySlug: z.string(),
    quantity: z.number(),
  }),
);

export type CartItem = z.infer<typeof cartSchema>[number];

export async function updateCart(newItems: CartItem[]) {
  const parsedItems = cartSchema.safeParse(newItems);
  if (!parsedItems.success) {
    throw new Error("Invalid cart items");
  }
  (await cookies()).set("cart", JSON.stringify(newItems), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getCart() {
  const cart = (await cookies()).get("cart");
  if (!cart) {
    return [];
  }
  try {
    return cartSchema.parse(JSON.parse(cart.value));
  } catch {
    console.error("Failed to parse cart cookie");
    await updateCart([]);
    return [];
  }
}

export async function detailedCart() {
  const cart = await getCart();

  const products = await db.query.products.findMany({
    where: (products, { inArray }) =>
      inArray(
        products.slug,
        cart.map((item) => item.product.slug),
      ),
    with: {
      subcategory: {
        with: {
          subcollection: true,
        },
      },
    },
  });

  const withQuantity = products.map((product) => ({
    ...product,
    quantity:
      cart.find((item) => item.product.slug === product.slug)?.quantity ?? 0,
  }));
  return withQuantity;
}
