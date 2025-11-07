"use client";
import { Link } from "@/components/ui/link";
import NextImage from "next/image";
import { getImageProps } from "next/image";
import { Drop } from "@/db/schema";
import { useEffect } from "react";

export function getDropLinkImageProps(
  imageUrl: string,
  dropName: string,
) {
  return getImageProps({
    width: 48,
    height: 48,
    quality: 65,
    src: imageUrl,
    alt: `A small picture of ${dropName}`,
  });
}

export function ProductLink(props: {
  imageUrl?: string | null;
  ocean_slug: string;
  river_slug: string;
  loading: "eager" | "lazy";
  drop: Drop;
}) {
  const { ocean_slug, river_slug, drop, imageUrl } = props;

  // prefetch the main image for the drop page, if this is too heavy
  // we could only prefetch the first few cards, then prefetch on hover
  const prefetchProps = getImageProps({
    height: 256,
    quality: 80,
    width: 256,
    src: imageUrl ?? "/placeholder.svg?height=64&width=64",
    alt: `A small picture of ${drop.name}`,
  });
  useEffect(() => {
    try {
      const iprops = prefetchProps.props;
      const img = new Image();
      // Don't interfer with important requests
      img.fetchPriority = "low";
      // Don't block the main thread with prefetch images
      img.decoding = "async";
      // Order is important here, sizes must be set before srcset, srcset must be set before src
      if (iprops.sizes) img.sizes = iprops.sizes;
      if (iprops.srcSet) img.srcset = iprops.srcSet;
      if (iprops.src) img.src = iprops.src;
    } catch (e) {
      console.error("failed to preload", prefetchProps.props.src, e);
    }
  }, [prefetchProps]);
  return (
    <Link
      prefetch={true}
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      href={`/drops/${ocean_slug}/${river_slug}/${drop.slug}`}
    >
      <div className="py-2">
        <NextImage
          loading={props.loading}
          decoding="sync"
          src={imageUrl ?? "/placeholder.svg?height=48&width=48"}
          alt={`A small picture of ${drop.name}`}
          width={48}
          height={48}
          quality={65}
          className="h-auto w-12 flex-shrink-0 object-cover"
        />
      </div>
      <div className="px-2" />
      <div className="h-26 flex flex-grow flex-col items-start py-2">
        <div className="text-sm font-medium text-gray-700 group-hover:underline">
          {drop.name}
        </div>
        <p className="overflow-hidden text-xs">{drop.description}</p>
      </div>
    </Link>
  );
}
