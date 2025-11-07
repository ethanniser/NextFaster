import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDropDetails } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the drop";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    drop: string;
    river: string;
    ocean: string;
  }>;
}) {
  console.log(props);
  const { drop } = await props.params;
  const urlDecodedDrop = decodeURIComponent(drop);
  const dropData = await getDropDetails(urlDecodedDrop);

  if (!dropData) {
    notFound();
  }
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
              src={dropData.image_url ?? "/placeholder.svg"}
              alt={dropData.name}
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
          {dropData.name}
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
            {dropData.description}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            fontSize: "24px",
            marginTop: "10px",
          }}
        >
          ${dropData.price}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
