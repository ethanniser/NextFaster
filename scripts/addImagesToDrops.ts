import { eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../src/db";
import { oceans, drops, rivers } from "../src/db/schema";
import {
  Effect,
  Schedule,
  Console,
  Cause,
  Array,
  Predicate,
  Random,
} from "effect";
import { NodeRuntime } from "@effect/platform-node";

const main = Effect.gen(function* () {
  const oceanUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: oceans.image_url })
      .from(oceans)
      .where(isNotNull(oceans.image_url)),
  );

  const riverUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: rivers.image_url })
      .from(rivers)
      .where(isNotNull(rivers.image_url)),
  );

  const dropUrls = yield* Effect.tryPromise(() =>
    db
      .select({ imageUrl: drops.image_url })
      .from(drops)
      .where(isNotNull(drops.image_url)),
  );

  const allUrls = Array.dedupe(
    Array.filter(
      [
        ...oceanUrls.map((c) => c.imageUrl),
        ...riverUrls.map((s) => s.imageUrl),
        ...dropUrls.map((p) => p.imageUrl),
      ],
      Predicate.isNotNull,
    ),
  );

  yield* Effect.log(`Total unqiue image urls found: ${allUrls.length}`);

  const dropsWithoutImage = yield* Effect.tryPromise(() =>
    db
      .select({ slug: drops.slug })
      .from(drops)
      .where(isNull(drops.image_url)),
  );

  yield* Effect.log(
    `Drops without image urls found: ${dropsWithoutImage.length}`,
  );

  yield* Effect.all(
    dropsWithoutImage.map((drop, i) =>
      Effect.gen(function* () {
        yield* Effect.log(
          `Beginning update for index ${i} of ${dropsWithoutImage.length}`,
        );
        const randomImageUrl = yield* Random.choice(allUrls);
        yield* Effect.tryPromise(() =>
          db
            .update(drops)
            .set({ image_url: randomImageUrl })
            .where(eq(drops.slug, drop.slug)),
        );
      }),
    ),
    { mode: "either", concurrency: 10 },
  );
});

NodeRuntime.runMain(main);
