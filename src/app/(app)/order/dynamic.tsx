import { cache } from "react";
import { detailedCart } from "@/lib/cart";
import { Link } from "@/components/ui/link";
import Image from "next/image";
import { removeFromCart } from "@/lib/actions";
import { X } from "lucide-react";

const getCartItems = cache(() => detailedCart());
type CartItem = Awaited<ReturnType<typeof getCartItems>>[number];

export async function CartItems() {
  const cart = await getCartItems();
  return (
    <>
      {cart.length > 0 && (
        <div className="pb-4">
          <p className="font-semibold text-accent1">Delivers in 2-4 weeks</p>
          <p className="text-sm text-gray-500">Need this sooner?</p>
        </div>
      )}
      {cart.length > 0 ? (
        <div className="flex flex-col space-y-10">
          {cart.map((item) => (
            <CartItem key={item.slug} product={item} />
          ))}
        </div>
      ) : (
        <p>No items in cart</p>
      )}
    </>
  );
}
function CartItem({ product }: { product: CartItem }) {
  if (!product) {
    return null;
  }
  // limit to 2 decimal places
  const cost = (Number(product.price) * product.quantity).toFixed(2);
  return (
    <div className="flex flex-row items-center justify-between border-t border-gray-200 pt-4">
      <Link
        prefetch={true}
        href={`/products/${product.subcategory.subcollection.category_slug}/${product.subcategory.slug}/${product.slug}`}
      >
        <div className="flex flex-row space-x-2">
          <div className="flex h-24 w-24 items-center justify-center bg-gray-100">
            <Image
              loading="eager"
              decoding="sync"
              src={product.image_url ?? "/placeholder.svg"}
              alt="Product"
              width={256}
              height={256}
              quality={80}
            />
          </div>
          <div className="max-w-[100px] flex-grow sm:max-w-full">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm md:text-base">{product.description}</p>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-center md:space-x-10">
        <div className="flex flex-col-reverse md:flex-row md:gap-4">
          <p>{product.quantity}</p>
          <div className="flex md:block">
            <div className="min-w-8 text-sm md:min-w-24 md:text-base">
              <p>${Number(product.price).toFixed(2)} each</p>
            </div>
          </div>
          <div className="min-w-24">
            <p className="font-semibold">${cost}</p>
          </div>
        </div>
        <form action={removeFromCart}>
          <button type="submit">
            <input type="hidden" name="productSlug" value={product.slug} />
            <X className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export async function TotalCost() {
  const cart = await getCartItems();

  const totalCost = cart.reduce(
    (acc, item) => acc + item.quantity * Number(item.price),
    0,
  );

  return <span> ${totalCost.toFixed(2)}</span>;
}
