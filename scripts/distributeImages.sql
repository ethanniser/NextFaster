-- Step 1: Create a temporary table of image URLs with a random order and assign a row number
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM oceans WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM rivers WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM drops WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),

-- Step 2: Create a temporary table of drops with NULL image_url and assign a random row number
numbered_drops AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM drops
  WHERE image_url IS NULL
)

-- Step 3: Update drops by matching the row numbers modulo the count of image URLs
UPDATE drops d
SET image_url = niu.image_url
FROM numbered_drops nd
JOIN numbered_image_urls niu
  ON ((nd.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE d.slug = nd.slug;

-- Update oceans with NULL image_url
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM oceans WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM rivers WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM drops WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),
numbered_oceans AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM oceans
  WHERE image_url IS NULL
)
UPDATE oceans o
SET image_url = niu.image_url
FROM numbered_oceans no
JOIN numbered_image_urls niu
  ON ((no.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE o.slug = no.slug;


-- Update rivers with NULL image_url
WITH numbered_image_urls AS (
  SELECT image_url, ROW_NUMBER() OVER () AS rn
  FROM (
    SELECT image_url FROM (
      SELECT image_url FROM oceans WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM rivers WHERE image_url IS NOT NULL
      UNION ALL
      SELECT image_url FROM drops WHERE image_url IS NOT NULL
    ) AS all_images
    ORDER BY RANDOM()
  ) AS random_images
),
numbered_rivers AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
  FROM rivers
  WHERE image_url IS NULL
)
UPDATE rivers r
SET image_url = niu.image_url
FROM numbered_rivers nr
JOIN numbered_image_urls niu
  ON ((nr.rn - 1) % (SELECT COUNT(*) FROM numbered_image_urls) + 1) = niu.rn
WHERE r.slug = nr.slug;

