import { db } from "@/db";
import { cookies } from "next/headers";
import { z } from "zod";

const cartSchema = z.array(
  z.object({
    dropSlug: z.string(),
    quantity: z.number(),
  }),
);

export type CartItem = z.infer<typeof cartSchema>[number];

export async function updateCart(newItems: CartItem[]) {
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
    return [];
  }
}

export async function detailedCart() {
  const cart = await getCart();

  const drops = await db.query.drops.findMany({
    where: (drops, { inArray }) =>
      inArray(
        drops.slug,
        cart.map((item) => item.dropSlug),
      ),
    with: {
      river: {
        with: {
          sea: true,
        },
      },
    },
  });

  const withQuantity = drops.map((drop) => ({
    ...drop,
    quantity:
      cart.find((item) => item.dropSlug === drop.slug)?.quantity ?? 0,
  }));
  return withQuantity;
}
