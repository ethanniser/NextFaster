import { put } from "@vercel/blob";
import { db } from "../src/db";
import { Effect, Schedule } from "effect";
import {
  drops as drops_table,
  oceans as oceans_table,
  rivers as rivers_table,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

const generateImage = (prompt: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() =>
      fetch("https://api.getimg.ai/v1/stable-diffusion/text-to-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GETIMG_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: "blurry",
          width: 512,
          height: 512,
          response_format: "url",
        }),
      }),
    );
    const json = yield* Effect.tryPromise(() => res.json());
    console.log(json);
    return json;
  });
const uploadImage = (imageUrl: string, path: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(imageUrl));
    const blob = yield* Effect.tryPromise(() => res.blob());
    return yield* Effect.tryPromise(() =>
      put(path, blob, { access: "public" }),
    );
  });

const main = Effect.gen(function* () {
  const drops = yield* Effect.tryPromise(() =>
    db.query.drops.findMany({
      where: (drops, { isNull }) => isNull(drops.image_url),
    }),
  );
  console.log(`found ${drops.length} drops`);

  yield* Effect.all(
    drops.map((drop) =>
      Effect.gen(function* () {
        console.log(`generating image for ${drop.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product:
            Product Name: ${drop.name}
            Product Description: ${drop.description}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${drop.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `drops/${drop.slug}`,
        );
        console.log(`uploaded image for ${drop.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(drops_table)
            .set({ image_url: url })
            .where(eq(drops_table.slug, drop.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );

  const oceans = yield* Effect.tryPromise(() =>
    db.query.oceans.findMany({
      where: (oceans, { isNull }) => isNull(oceans.image_url),
    }),
  );

  console.log(`found ${oceans.length} oceans`);

  yield* Effect.all(
    oceans.map((ocean) =>
      Effect.gen(function* () {
        console.log(`generating image for ${ocean.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product category:
            Category Name: ${ocean.name}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${ocean.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `oceans/${ocean.slug}`,
        );
        console.log(`uploaded image for ${ocean.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(oceans_table)
            .set({ image_url: url })
            .where(eq(oceans_table.slug, ocean.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );

  const rivers = yield* Effect.tryPromise(() =>
    db.query.rivers.findMany({
      where: (rivers, { isNull }) => isNull(rivers.image_url),
    }),
  );

  console.log(`found ${rivers.length} rivers`);

  yield* Effect.all(
    rivers.map((river) =>
      Effect.gen(function* () {
        console.log(`generating image for ${river.name}`);
        const imageRes = yield* generateImage(`
            Generate a product photo for this product category:
            Category Name: ${river.name}`);
        const imageUrl = imageRes.url;
        if (!imageUrl) {
          return yield* Effect.fail("no image");
        }
        console.log(`uploading image for ${river.name} - ${imageUrl}`);
        const { url } = yield* uploadImage(
          imageUrl,
          `rivers/${river.slug}`,
        );
        console.log(`uploaded image for ${river.name}`);
        yield* Effect.tryPromise(() =>
          db
            .update(rivers_table)
            .set({ image_url: url })
            .where(eq(rivers_table.slug, river.slug)),
        );
      }),
    ),
    { concurrency: 10 },
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced("10 seconds") })),
);
console.log(exit.toString());
