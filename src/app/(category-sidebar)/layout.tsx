import { Link } from "@/components/ui/link";
import { getPlanets } from "@/lib/queries";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allPlanets = await getPlanets();
  return (
    <div className="flex flex-grow font-mono">
      <aside className="fixed left-0 hidden w-64 min-w-64 max-w-64 overflow-y-auto border-r p-4 md:block md:h-full">
        <h2 className="border-b border-accent1 text-sm font-semibold text-accent1">
          Choose a Planet
        </h2>
        <ul className="flex flex-col items-start justify-center">
          {allPlanets.map((planet) => (
            <li key={planet.slug} className="w-full">
              <Link
                prefetch={true}
                href={`/${planet.slug}`}
                className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
              >
                {planet.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4 pt-0 md:pl-64"
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
