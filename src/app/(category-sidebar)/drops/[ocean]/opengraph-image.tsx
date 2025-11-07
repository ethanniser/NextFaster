import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getOcean } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the ocean";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    ocean: string;
  }>;
}) {
  const { ocean: oceanParam } = await props.params;
  const urlDecodedOcean = decodeURIComponent(oceanParam);

  const ocean = await getOcean(urlDecodedOcean);

  if (!ocean) {
    return notFound();
  }

  const examples = ocean.seas
    .slice(0, 2)
    .map((s) => s.name)
    .join(", ");

  const description = `Choose from our selection of ${ocean.name}, including ${examples + (ocean.seas.length > 1 ? "," : "")} and more. In stock and ready to ship.`;

  // TODO: Change design to add river images that blur out
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              style={{
                width: "300px",
                marginBottom: "30px",
              }}
              src={ocean.image_url ?? "/placeholder.svg"}
              alt={ocean.name}
            />
          </div>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          {ocean.name}
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <div
            style={{ textAlign: "center", display: "flex", fontSize: "24px" }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
