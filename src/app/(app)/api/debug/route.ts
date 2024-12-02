import { cookies } from "next/headers";

export async function GET(request: Request) {
  // dump all the request headers, cookies, and body, infinite deep json stringify
  const stringifyHeaders = JSON.stringify(
    Object.fromEntries(request.headers),
    null,
    2,
  );
  const cookieStore = (await cookies()).getAll();
  const stringifyCookies = JSON.stringify(cookieStore, null, 2);

  console.log("headers", stringifyHeaders);
  console.log("cookies", stringifyCookies);
  const responseObj = {
    headers: stringifyHeaders,
    cookies: stringifyCookies,
  };

  return Response.json(responseObj);
}
