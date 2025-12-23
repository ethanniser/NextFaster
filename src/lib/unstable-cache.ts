import {
  cacheLife,
  cacheTag,
  unstable_cache as next_unstable_cache,
} from "next/cache";
import { cache } from "react";

// next_unstable_cache doesn't handle deduplication, so we wrap it in React's cache
export const unstable_cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number },
) => {
  return cache(callback);
};
