"use server";

import { getCart, updateCart } from "./cart";

export async function addToCart(prevState: unknown, formData: FormData) {
  const prevCart = await getCart();
  const dropSlug = formData.get("dropSlug");
  if (typeof dropSlug !== "string") {
    return;
  }
  const itemAlreadyExists = prevCart.find(
    (item) => item.dropSlug === dropSlug,
  );
  if (itemAlreadyExists) {
    const newQuantity = itemAlreadyExists.quantity + 1;
    const newCart = prevCart.map((item) => {
      if (item.dropSlug === dropSlug) {
        return {
          ...item,
          quantity: newQuantity,
        };
      }
      return item;
    });
    await updateCart(newCart);
  } else {
    const newCart = [
      ...prevCart,
      {
        dropSlug,
        quantity: 1,
      },
    ];
    await updateCart(newCart);
  }

  return "Item added to cart";
}

export async function removeFromCart(formData: FormData) {
  const prevCart = await getCart();
  const dropSlug = formData.get("dropSlug");
  if (typeof dropSlug !== "string") {
    return;
  }
  const itemAlreadyExists = prevCart.find(
    (item) => item.dropSlug === dropSlug,
  );
  if (!itemAlreadyExists) {
    return;
  }
  const newCart = prevCart.filter((item) => item.dropSlug !== dropSlug);
  await updateCart(newCart);
}
