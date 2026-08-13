## NextFaster

A highly performant e-commerce template using Next.js and AI generated content by [@ethanniser](https://x.com/ethanniser), [@RhysSullivan](https://x.com/RhysSullivan) and [@armans-code](https://x.com/ksw_arman)

### Design notes

**Check out the detailed [twitter thread](https://x.com/ethanniser/status/1848442738204643330)**

- Uses [Next.js 15](https://nextjs.org/)
  - All mutations are done via [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Partial Prerendering](https://vercel.com/blog/partial-prerendering-with-next-js-creating-a-new-default-rendering-model) is used to precompute the shells of pages
  - When deployed, these are served statically from the edge
  - Dynamic data (such as cart information) is then streamed in
- Uses [Drizzle ORM](https://orm.drizzle.team/docs/overview) on top of [Neon Postgres](https://neon.tech)
- Images stored on [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- Used [v0](https://v0.dev) to generate all initial UIs, check out some of the threads we were particularly impressed by:
  - [v0 makes pretty impressive search dropdown without a library](https://v0.dev/chat/lFfc68X3fir?b=b_1o4tkiC9EEm&p=0)
  - [recreating 'order' page](https://v0.dev/chat/RTBa8dXhx03?b=b_4RguNNUEhLh)
  - [recreating 'login' page](https://v0.dev/chat/tijwMFByNX9?b=b_XnRtduKn2oe)

#### AI

- Used [OpenAI](https://openai.com)'s `gpt-4o-mini` with their batch API and the Vercel AI SDK to generate product categories, names and descriptions
- [GetImg.ai](https://getimg.ai) was used to generate product images via the `stable-diffusion-v1-5` model

### Deployment

- Make sure the Vercel project is connected to a Vercel Postgres (Neon) database and Vercel Blob Storage
- Run `pnpm db:push` to apply schema to your db

### Local dev

- Run `vc link` to link your project to Vercel.
- Run `vc env pull` to get a `.env.local` file with your db credentials.
- Run `pnpm install` && `pnpm dev` to start developing.
- The data/data.zip includes a ~300 MB data.sql file with the full schema and 1,000,000+ products (_Note, the data exceeds the size limit allowed by the free tier for Neon on Vercel_ [see more](https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing#pricing)). To seed Vercel Postgres with this data:
  - Unzip data.zip to data.sql.
  - Run `psql "YOUR_CONNECTION_STRING" -f data/data.sql`.
- Create the default roles in your database.
  -Run `psql "YOUR_CONNECTION_STRING"`
  -Now run CREATE ROLE default; and CREATE ROLE cloud_admin;
- For DB migrations with `drizzle-kit`:
  - Make sure `?sslmode=required` is added to the `POSTGRES_URL` env for dev
  - Run `pnpm db:push` to apply schema to your db

### Performance

[PageSpeed Report](https://pagespeed.web.dev/analysis/https-next-faster-vercel-app/7iywdkce2k?form_factor=desktop)

<img width="822" alt="SCR-20241027-dmsb" src="https://github.com/user-attachments/assets/810bc4c7-2e01-422d-9c3d-45daf5fb13ce">

### Costs

This project is hosted on Vercel, and uses many of the features of the Vercel platform.

Here is the full breakdown of the cost of running this project from Oct 20th 2024 through Nov 11th 2024.

During that time, the project received **over 1 million page views** across 45k unique users. The site has **over 1 million unique pages and images\***.

\*_images are unique by url (and caching) although not unique in their content_

#### Summary:

- ~1 million page views
- ~1 million unique product pages
- 45k unique users
- $513.12

Is $500 a lot for hosting this site? It depends, in this instance if it was a real ecommerce site that hosting cost would've been made back in the first 10k visitors.

It is likely possible to optimize these costs further if that is your goal, however that wasn't a priority for this project. We wanted to try and build the fastest possible site, quickly. We definitely achieved that goal without ever having to think about infra once.

These numbers are also on top of the Vercel pro plan, which is $20/contributor/month.

We would like to thank Vercel for covering the costs of hosting this project.

#### Compute and Caching

These costs represent the core functionality of serving the site.

| Resource             | Included                    | On-demand     | Charge  | Notes                                                                                 |
| -------------------- | --------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------- |
| Function Invocations | 1M / 1M                     | +31M          | $18.00  |
| Function Duration    | 1,000 GB-Hrs / 1,000 GB-Hrs | +333.7 GB-Hrs | $33.48  | Using In-function Concurrency reduces our compute usage by over 50% (see image below) |
| Edge Requests        | 10M / 10M                   | +93M          | $220.92 |                                                                                       |
| Fast Origin Transfer | 100 GB / 100 GB             | +461.33 GB    | $26.33  |                                                                                       |
| ISR Writes           | 2M / 2M                     | +12M          | $46.48  |                                                                                       |
| ISR Reads            | 10M / 10M                   | +20M          | $7.91   |                                                                                       |

Total: $353.12

#### Images

These costs represent the image optimization done by Vercel.

| Resource           | Included    | On-demand | Charge  | Notes                                                                                                                                                                                                                                                                              |
| ------------------ | ----------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image Optimization | 5000 / 5000 | +101,784  | $160.00 | This represents the number of distinct source images used on the site and optimized by Vercel. Each of the 1 million products has a unique image. The reason this number is less than 1 million is because the optimization is done on demand and not all pages have been visited. |

Total: $160.00

#### Even More Info

![image](https://github.com/user-attachments/assets/fc0ba91c-6e58-4ea0-8c1c-3acfaf56e98a)

![image](https://github.com/user-attachments/assets/fa208c6f-a943-42f2-ae90-3c50889cc98e)

![image](https://github.com/user-attachments/assets/e04b0948-e18c-4bd5-b0d4-7ef65f2af84a)
