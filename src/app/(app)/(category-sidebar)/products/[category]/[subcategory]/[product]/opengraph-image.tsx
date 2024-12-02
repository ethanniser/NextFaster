import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProductDetails } from "@/lib/queries";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "About the product";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image(props: {
  params: Promise<{
    product: string;
    subcategory: string;
    category: string;
  }>;
}) {
  console.log(props);
  const { product } = await props.params;
  const urlDecodedProduct = decodeURIComponent(product);
  const productData = await getProductDetails(urlDecodedProduct);

  if (!productData) {
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
              src={productData.image_url ?? "/placeholder.svg"}
              alt={productData.name}
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
          {productData.name}
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
            {productData.description}
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
          ${productData.price}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
