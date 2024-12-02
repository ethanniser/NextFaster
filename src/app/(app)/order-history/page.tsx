import { Metadata } from "next";
import { Suspense } from "react";
import { OrderHistoryDynamic } from "./dynamic";

export const metadata: Metadata = {
  title: "Order History",
};

export default async function Page() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="w-full border-b-2 border-accent1 text-left text-2xl text-accent1">
        Order History
      </h1>
      <div className="mx-auto flex max-w-md flex-col gap-4 text-black">
        <Suspense>
          <OrderHistoryDynamic />
        </Suspense>
      </div>
    </main>
  );
}
