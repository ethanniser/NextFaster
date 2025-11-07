import slugify from "slugify";
import { drops, rivers } from "../src/db/schema";
import { db } from "../src/db";
import { eq, isNull } from "drizzle-orm";

const readline = require("readline");
const fs = require("fs");

const getEmptyRivers = async () => {
  const riversWithoutDrops = await db
    .select()
    .from(rivers)
    .leftJoin(drops, eq(drops.river_slug, rivers.slug))
    .where(isNull(drops.river_slug));

  return riversWithoutDrops.map((s) => s.rivers.slug);
};

function getRandomObjects(arr: any[], count: number) {
  const result = [];
  const takenIndices = new Set();
  const arrLength = arr.length;

  while (result.length < count) {
    const randomIndex = Math.floor(Math.random() * arrLength);

    if (!takenIndices.has(randomIndex)) {
      result.push(arr[randomIndex]);
      takenIndices.add(randomIndex);
    }
  }

  return result;
}

const getBody = async () => {
  const fileStream = fs.createReadStream("scripts/out.jsonl");
  const rl = readline.createInterface({
    input: fileStream,
  });

  const body = [] as any[];
  rl.on("line", (line: string) => {
    try {
      const parsedLine = JSON.parse(line);
      const river_slug = parsedLine.custom_id;
      const response = JSON.parse(
        parsedLine.response.body.choices[0].message.content,
      );

      const dropsData = response.drops;

      const dropsToAdd = dropsData.map(
        (drop: { name: string; description: string }) => {
          const price = parseFloat((Math.random() * 20 + 5).toFixed(1));
          return {
            slug: slugify(drop.name, { lower: true }),
            name: drop.name,
            description: drop.description ?? "",
            price,
            river_slug,
          };
        },
      );
      body.push(...dropsToAdd);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      fs.appendFile("scripts/errors.txt", line + "\n", (err: any) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  });

  rl.on("close", async () => {
    console.log(body.length);
    for (let i = 0; i < body.length; i += 10000) {
      const chunk = body.slice(i, i + 10000);
      await db.insert(drops).values(chunk).onConflictDoNothing();
      console.log(`Inserted drops ${i} to ${i + chunk.length}`);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100 ms
    }

    // const data = [] as any[];
    // const riversData = await getEmptyRivers();
    // riversData.forEach((river) => {
    //   // get 30 random drops from body, regardless of river_slug
    //   const dropsData = getRandomObjects(body, 30).map((drop) => {
    //     return {
    //       ...drop,
    //       river_slug: river,
    //       slug: slugify(drop.name, { lower: true }) + "-1",
    //     };
    //   });
    //   data.push(...dropsData);
    // });

    // for (let i = 0; i < data.length; i += 10000) {
    //   const chunk = data.slice(i, i + 10000);
    //   await db.insert(drops).values(chunk).onConflictDoNothing();
    //   console.log(`Inserted drops ${i} to ${i + chunk.length}`);
    //   await new Promise((resolve) => setTimeout(resolve, 100)); // Delay of 0.1 second
    // }

    // console.log("Inserted drops");
  });
};

// getBody();

const duplicateDrops = async () => {
  for (let i = 0; i < 13; i += 1) {
    const d = await db
      .select()
      .from(drops)
      .limit(10000)
      .offset(i * 10000);

    const dropsToAdd = d.map((drop) => {
      return {
        ...drop,
        name: drop.name + " V2",
        slug: drop.slug + "-v2",
      };
    });

    await db.insert(drops).values(dropsToAdd).onConflictDoNothing();
    console.log(`Inserted drops ${i * 10000} to ${(i + 1) * 10000}`);
  }
  console.log("Inserted drops");
};

// duplicateDrops();
