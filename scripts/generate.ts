import OpenAI from "openai";
import slugify from "slugify";
import { db } from "../src/db";
import {
  oceans,
  planets,
  rivers,
  seas,
} from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
const fs = require("fs");

const openai = new OpenAI();
const client = createOpenAI();

const system = `
You are given the name of a planet for drops in an art supply store.
Your task is to generate 20 unique oceans for this planet. Make sure the
ocean names are broad.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
Planet Name: Sketching Pencils

OUTPUT:
{ oceans: ["Colored Pencils", "Charcoal Pencils", ...] }

Remember, ONLY RETURN THE JSON of 20 unique oceans and nothing else.

MAKE SURE THERE ARE 20 OCEANS IN THE OUTPUT.`;

const getPlanets = async () => {
  return await db.select().from(planets);
};

// generate 20 oceans per each planet
const generateOceans = async () => {
  const data = [] as any;
  const c = await getPlanets();

  const promises = c.map(async (planet) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        oceans: z.array(z.string()),
      }),
      system,
      prompt: `Planet Name: ${planet.name}`,
    });

    const { oceans: ocs } = object;
    console.log(`Oceans generated: ${ocs.length}`);

    const oceansToAdd = ocs.map((ocean: string) => ({
      name: ocean,
      planet_id: planet.id,
      slug: slugify(ocean, { lower: true }),
    }));
    data.push(...oceansToAdd);
  });

  await Promise.all(promises);
  await db.insert(oceans).values(data).onConflictDoNothing();
};

// generateOceans();

const getOceans = async () => {
  return await db.select().from(oceans);
};

// generate 10 seas per each ocean
const generateSeas = async () => {
  const data = [] as any;
  const c = await getOceans();

  const promises = c.map(async (ocean) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        seas: z.array(z.string()),
      }),
      system: `You are given the name of an ocean for drops in an art supply store.
                Your task is to generate 10 unique seas for this ocean. Make sure the
                sea names are broad.

                YOU MUST OUTPUT IN ONLY JSON.

                EXAMPLE:

                INPUT:
                Ocean Name: Art Hitory

                OUTPUT:
                { seas: ["Art History Books", "Art History CDs", ...] }

                Remember, ONLY RETURN THE JSON of 10 unique seas and nothing else.

                MAKE SURE THERE ARE 10 SEAS IN THE OUTPUT.`,
      prompt: `Ocean Name: ${ocean.name}`,
    });

    const { seas: ss } = object;
    console.log(`Seas generated: ${ss.length}`);

    const seasToAdd = ss.map((sea: string) => ({
      name: sea,
      ocean_slug: ocean.slug,
    }));
    data.push(...seasToAdd);
  });

  await Promise.all(promises);
  await db.insert(seas).values(data).onConflictDoNothing();
};

// generateSeas();

const getSeas = async () => {
  // only get seas that have no rivers
  const result = await db
    .select()
    .from(seas)
    .leftJoin(
      rivers,
      eq(seas.id, rivers.sea_id),
    )
    .where(isNull(rivers.sea_id))
    .limit(300);
  console.log(result.length);
  return result;
};

const generateRivers = async () => {
  const data = [] as any;
  const seasList = (await getSeas()).map(
    (c) => c.seas,
  );

  const promises = seasList.map(async (sea) => {
    const { object } = await generateObject({
      model: client.languageModel("gpt-4o-mini", { structuredOutputs: true }),
      schema: z.object({
        rivers: z.array(z.string()),
      }),
      system: `You are given the name of a sea of drops in an art supply store.
                Your task is to generate 10 unique rivers that belong to this sea.
                Make sure the river names are broad.

                YOU MUST OUTPUT IN ONLY JSON.

                EXAMPLE:

                INPUT:
                Sea Name: Art Hitory

                OUTPUT:
                { rivers: ["Art History Books", "Art History CDs", ...] }

                Remember, ONLY RETURN THE JSON of 10 unique rivers and nothing else.

                MAKE SURE THERE ARE 10 RIVERS IN THE OUTPUT.`,
      prompt: `Sea Name: ${sea}`,
    });

    const { rivers: rs } = object;
    console.log(`Rivers generated: ${rs.length}`);

    const riversToAdd = rs.map((river: string) => ({
      name: river,
      slug: slugify(river, { lower: true }),
      sea_id: sea.id,
    }));
    data.push(...riversToAdd);
  });

  await Promise.all(promises);
  await db.insert(rivers).values(data).onConflictDoNothing();
};

// getSeas();
// generateRivers();

const dropSystemMessage = `
You are given the name of a river of drops in an art supply store.
Your task is to generate 25 unique drops that belong to this river.
Ensure each drop has a name and brief description.

YOU MUST OUTPUT IN ONLY JSON.

EXAMPLE:

INPUT:
River Name: Paint Markers

OUTPUT:
{ drops: [{ name: "Expo Paint Marker", description: "..." }, { name: "Paint Marker Set", description:"..." }] }

Remember, ONLY RETURN THE JSON of 30 unique drops and nothing else.
MAKE SURE YOUR JSON IS VALID. ALL JSON MUST BE CORRECT.
`;

const generateBatchFile = async () => {
  const arr = await db.select().from(rivers);

  arr.forEach((river) => {
    const custom_id = river.slug;
    const method = "POST";
    const url = "/v1/chat/completions";
    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: dropSystemMessage },
        { role: "user", content: `River name: ${river.name}` },
      ],
    };

    const line = `{"custom_id": "${custom_id}", "method": "${method}", "url": "${url}", "body": ${JSON.stringify(body)}}`;

    fs.appendFile("scripts/req.jsonl", line + "\n", (err: any) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
};

// generateBatchFile();

const uploadBatchFile = async () => {
  const file = await openai.files.create({
    file: fs.createReadStream("scripts/req.jsonl"),
    purpose: "batch",
  });

  console.log(file);
};

// uploadBatchFile();

const createBatch = async () => {
  const batch = await openai.batches.create({
    input_file_id: "",
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  });

  console.log(batch);
};

// createBatch();

const checkBatchStatus = async () => {
  const batch = await openai.batches.retrieve("");
  console.log(batch);
};

// checkBatchStatus();

const downloadBatch = async () => {
  const fileResponse = await openai.files.content("");
  const fileContents = await fileResponse.text();

  fs.appendFile("scripts/out.jsonl", fileContents, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("File has been saved");
  });
};

// downloadBatch();
