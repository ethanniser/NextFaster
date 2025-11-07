-- Seed data for dropz hierarchy system
-- Hierarchy: Planet > Ocean > Sea > River > Drop

-- Insert Planets
INSERT INTO planets (id, name, slug) VALUES
(1, 'Art Supplies', 'art-supplies'),
(2, 'Office Equipment', 'office-equipment'),
(3, 'Crafts & DIY', 'crafts-diy')
ON CONFLICT (id) DO NOTHING;

-- Insert Oceans
INSERT INTO oceans (slug, name, planet_id, image_url) VALUES
('markers', 'Markers', 1, NULL),
('pencils', 'Pencils', 1, NULL),
('paints', 'Paints', 1, NULL),
('pens', 'Pens', 2, NULL),
('paper', 'Paper', 2, NULL),
('glue', 'Glue', 3, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Insert Seas
INSERT INTO seas (id, name, ocean_slug) VALUES
(1, 'Permanent Markers', 'markers'),
(2, 'Dry Erase Markers', 'markers'),
(3, 'Colored Pencils', 'pencils'),
(4, 'Drawing Pencils', 'pencils'),
(5, 'Acrylic Paints', 'paints'),
(6, 'Watercolor Paints', 'paints'),
(7, 'Ballpoint Pens', 'pens'),
(8, 'Gel Pens', 'pens'),
(9, 'Copy Paper', 'paper'),
(10, 'Craft Paper', 'paper'),
(11, 'Liquid Glue', 'glue'),
(12, 'Glue Sticks', 'glue')
ON CONFLICT (id) DO NOTHING;

-- Insert Rivers
INSERT INTO rivers (slug, name, sea_id, image_url) VALUES
('sharpie-fine', 'Sharpie Fine Point', 1, NULL),
('expo-classic', 'Expo Classic', 2, NULL),
('prismacolor', 'Prismacolor Premier', 3, NULL),
('staedtler-mars', 'Staedtler Mars Lumograph', 4, NULL),
('liquitex-basics', 'Liquitex BASICS', 5, NULL),
('winsor-newton', 'Winsor & Newton Cotman', 6, NULL),
('bic-cristal', 'BIC Cristal', 7, NULL),
('pilot-g2', 'Pilot G2', 8, NULL),
('hp-copy', 'HP Copy & Print', 9, NULL),
('astrobrights', 'Astrobrights', 10, NULL),
('elmers-school', 'Elmer''s School Glue', 11, NULL),
('elmers-stick', 'Elmer''s Glue Stick', 12, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Insert Drops (sample products)
INSERT INTO drops (slug, name, description, price, river_slug, image_url) VALUES
('sharpie-black-12pk', 'Sharpie Fine Point Black 12-Pack', 'Classic black permanent markers with fine point tips', 15.99, 'sharpie-fine', NULL),
('sharpie-assorted-24pk', 'Sharpie Fine Point Assorted 24-Pack', 'Vibrant assorted colors in permanent markers', 24.99, 'sharpie-fine', NULL),
('expo-black-4pk', 'Expo Classic Black 4-Pack', 'Low-odor dry erase markers in black', 8.99, 'expo-classic', NULL),
('expo-assorted-8pk', 'Expo Classic Assorted 8-Pack', 'Bright colors for whiteboards', 12.99, 'expo-classic', NULL),
('prismacolor-48', 'Prismacolor Premier 48 Set', 'Professional quality colored pencils', 89.99, 'prismacolor', NULL),
('prismacolor-72', 'Prismacolor Premier 72 Set', 'Extensive color range for artists', 129.99, 'prismacolor', NULL),
('staedtler-6b-2b', 'Staedtler Mars Lumograph Drawing Set', 'Professional drawing pencils 6B-2B', 22.99, 'staedtler-mars', NULL),
('liquitex-acrylic-set', 'Liquitex BASICS 48-Color Set', 'High-quality acrylic paints for all surfaces', 45.99, 'liquitex-basics', NULL),
('winsor-watercolor-12', 'Winsor & Newton Cotman 12-Color Set', 'Student quality watercolors', 18.99, 'winsor-newton', NULL),
('bic-blue-12pk', 'BIC Cristal Blue 12-Pack', 'Reliable ballpoint pens in blue', 4.99, 'bic-cristal', NULL),
('pilot-g2-black-12pk', 'Pilot G2 Black 12-Pack', 'Smooth gel ink pens 0.7mm', 12.99, 'pilot-g2', NULL),
('hp-copy-ream', 'HP Copy & Print Paper 500 Sheets', 'Bright white multipurpose paper', 8.99, 'hp-copy', NULL),
('astrobrights-assorted', 'Astrobrights Assorted Colors 500 Sheets', 'Vibrant colored paper for projects', 14.99, 'astrobrights', NULL),
('elmers-glue-4oz', 'Elmer''s School Glue 4oz', 'Washable white school glue', 2.99, 'elmers-school', NULL),
('elmers-sticks-6pk', 'Elmer''s Glue Sticks 6-Pack', 'Disappearing purple glue sticks', 5.99, 'elmers-stick', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Reset sequences (adjust max values as needed)
SELECT setval('planets_id_seq', (SELECT MAX(id) FROM planets));
SELECT setval('seas_id_seq', (SELECT MAX(id) FROM seas));
