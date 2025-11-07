import { db } from "../src/db";
import { Effect, Schedule, Console, Cause } from "effect";
import {
  drops as drops_table,
  oceans,
  rivers as rivers_table,
  rivers,
  drops,
  seas,
} from "../src/db/schema";
import { eq, sql, lt } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";
import slugify from "slugify";

const dropValidator = z.object({
  drops: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
    }),
  ),
});

const riverValidator = z.object({
  rivers: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

const openai = new OpenAI();

const makeDropPrompt = (riverName: string) => `
  You are given the name of a river (product category) for drops (products) in an art supply store.
  Your task is to generate 10 drops. Each drop has a name, description, and price.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  River Name: Painting Supplies

  OUTPUT:
  {
    "drops": [
      {
        "name": "Acrylic Paints (Basic and Professional Grades)",
        "description": "High-quality, student-grade acrylic paint with smooth consistency.",
        "price": 19.99,
      },
    ...
  }

  NOW YOUR TURN,

  INPUT:
  River Name: ${riverName}

  OUTPUT:`;

const makeRiverPrompt = (seaName: string) => `
  You are given the name of a sea (category) for rivers (subcategories) in an art supply store.
  Your task is to generate 10 rivers. Each river has a name.

  YOU MUST OUTPUT IN ONLY JSON.

  EXAMPLE:

  INPUT:
  Sea Name: Sketching Pencils

  OUTPUT:
  {
    "rivers": [
      {
        "name": "Colored Pencils",
      },
      {
        "name": "Charcoal Pencils",
      },
    ...
  }

  NOW YOUR TURN,

  INPUT:
  Sea Name: ${seaName}

  OUTPUT:`;

const main = Effect.gen(function* () {
  // find seas with less than 5 rivers
  // const seasWithLessThan5Rivers = yield* Effect.tryPromise(
  //   () =>
  //     db
  //       .select({
  //         seaId: seas.id,
  //         seaName: seas.name,
  //         riverCount: sql<number>`COUNT(${rivers.slug})`,
  //       })
  //       .from(seas)
  //       .leftJoin(
  //         rivers,
  //         eq(seas.id, rivers.sea_id),
  //       )
  //       .groupBy(seas.id, seas.name)
  //       .having(eq(sql<number>`COUNT(${rivers.slug})`, 0)),
  // );
  // console.log(
  //   `found ${seasWithLessThan5Rivers.length} seas with no rivers`,
  // );
  // let counter1 = 0;
  // yield* Effect.all(
  //   seasWithLessThan5Rivers.map((sea) =>
  //     Effect.gen(function* () {
  //       console.log(
  //         `starting ${counter1++} of ${seasWithLessThan5Rivers.length}`,
  //       );
  //       console.log("starting", sea.seaName);
  //       const res = yield* Effect.tryPromise(() =>
  //         openai.chat.completions.create({
  //           model: "gpt-3.5-turbo",
  //           messages: [
  //             {
  //               role: "user",
  //               content: makeRiverPrompt(sea.seaName),
  //             },
  //           ],
  //         }),
  //       ).pipe(Effect.tapErrorCause((e) => Console.error("hi", e)));
  //       const text = res.choices[0].message.content;
  //       if (!text) {
  //         return yield* Effect.fail("no json");
  //       }
  //       const json = yield* Effect.try(() => JSON.parse(text));
  //       const res2 = riverValidator.safeParse(json);
  //       if (!res2.success) {
  //         return yield* Effect.fail("invalid json");
  //       }
  //       yield* Effect.all(
  //         res2.data.rivers
  //           .map(
  //             (river) =>
  //               ({
  //                 ...river,
  //                 slug: slugify(river.name),
  //                 sea_id: sea.seaId,
  //               }) as const,
  //           )
  //           .map((x) =>
  //             Effect.tryPromise(() => db.insert(rivers).values(x)).pipe(
  //               Effect.catchAll((e) => Effect.void),
  //             ),
  //           ),
  //       );
  //       console.log("data inserted");
  //     }),
  //   ),
  //   { mode: "either", concurrency: 4 },
  // );
  // // find rivers with less than 5 drops
  const riversWithLessThan5Drops = yield* Effect.tryPromise(() =>
    db
      .select({
        riverSlug: rivers.slug,
        riverName: rivers.name,
        dropCount: sql<number>`COUNT(${drops.slug})`,
      })
      .from(rivers)
      .leftJoin(drops, eq(rivers.slug, drops.river_slug))
      .groupBy(rivers.slug, rivers.name)
      .having(eq(sql<number>`COUNT(${drops.slug})`, 0)),
  );
  console.log(
    `found ${riversWithLessThan5Drops.length} rivers with no drops`,
  );
  let counter2 = 0;
  yield* Effect.all(
    riversWithLessThan5Drops.map((river) =>
      Effect.gen(function* () {
        console.log(
          `starting ${counter2++} of ${riversWithLessThan5Drops.length}`,
        );
        console.log("starting", river.riverName);
        const res = yield* Effect.tryPromise(() =>
          openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: makeDropPrompt(river.riverName),
              },
            ],
          }),
        );
        const json = res.choices[0].message.content;
        if (!json) {
          return yield* Effect.fail("no json");
        }
        const res2 = dropValidator.safeParse(JSON.parse(json));
        if (!res2.success) {
          return yield* Effect.fail("invalid json");
        }
        yield* Effect.all(
          res2.data.drops
            .map((drop) => ({
              ...drop,
              price: drop.price.toString(),
              river_slug: river.riverSlug,
              slug: slugify(drop.name),
            }))
            .map((x) =>
              Effect.tryPromise(() => db.insert(drops).values(x)).pipe(
                Effect.catchAll((e) => Effect.void),
              ),
            ),
          {
            concurrency: 5,
          },
        );
      }),
    ),
    { concurrency: 3 },
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced("1 seconds") })),
);
console.log(exit.toString());
