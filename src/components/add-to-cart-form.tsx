"use client";
import { useActionState } from "react";
import { addToCart } from "@/lib/actions";

export function AddToCartForm({ dropSlug }: { dropSlug: string }) {
  const [message, formAction, isPending] = useActionState(addToCart, null);
  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <input type="hidden" name="dropSlug" value={dropSlug} />
      <button
        type="submit"
        className="max-w-[150px] rounded-[2px] bg-accent1 px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {isPending && <p>Adding to cart...</p>}
      {!isPending && message && <p>{message}</p>}
    </form>
  );
}
