import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const planets = pgTable("planets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export type Planet = typeof planets.$inferSelect;

export const oceans = pgTable(
  "oceans",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    planet_id: integer("planet_id")
      .notNull()
      .references(() => planets.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    planetIdIdx: index("oceans_planet_id_idx").on(
      table.planet_id,
    ),
  }),
);

export type Ocean = typeof oceans.$inferSelect;

export const seas = pgTable(
  "seas",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    ocean_slug: text("ocean_slug")
      .notNull()
      .references(() => oceans.slug, { onDelete: "cascade" }),
  },
  (table) => ({
    oceanSlugIdx: index("seas_ocean_slug_idx").on(
      table.ocean_slug,
    ),
  }),
);

export type Sea = typeof seas.$inferSelect;

export const rivers = pgTable(
  "rivers",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    sea_id: integer("sea_id")
      .notNull()
      .references(() => seas.id, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    seaIdIdx: index("rivers_sea_id_idx").on(
      table.sea_id,
    ),
  }),
);

export type River = typeof rivers.$inferSelect;

export const drops = pgTable(
  "drops",
  {
    slug: text("slug").notNull().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: numeric("price").notNull(),
    river_slug: text("river_slug")
      .notNull()
      .references(() => rivers.slug, { onDelete: "cascade" }),
    image_url: text("image_url"),
  },
  (table) => ({
    nameSearchIndex: index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
    nameTrgmIndex: index("name_trgm_index")
      .using("gin", sql`${table.name} gin_trgm_ops`)
      .concurrently(),
    riverSlugIdx: index("drops_river_slug_idx").on(
      table.river_slug,
    ),
  }),
);

export type Drop = typeof drops.$inferSelect;

export const planetsRelations = relations(planets, ({ many }) => ({
  oceans: many(oceans),
}));

export const oceansRelations = relations(oceans, ({ one, many }) => ({
  planet: one(planets, {
    fields: [oceans.planet_id],
    references: [planets.id],
  }),
  seas: many(seas),
}));

export const seasRelations = relations(
  seas,
  ({ one, many }) => ({
    ocean: one(oceans, {
      fields: [seas.ocean_slug],
      references: [oceans.slug],
    }),
    rivers: many(rivers),
  }),
);

export const riversRelations = relations(
  rivers,
  ({ one, many }) => ({
    sea: one(seas, {
      fields: [rivers.sea_id],
      references: [seas.id],
    }),
    drops: many(drops),
  }),
);

export const dropsRelations = relations(drops, ({ one }) => ({
  river: one(rivers, {
    fields: [drops.river_slug],
    references: [rivers.slug],
  }),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
