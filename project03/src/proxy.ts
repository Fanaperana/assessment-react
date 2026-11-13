import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  const destination = new URL("/sign-in", request.url);
  destination.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/search/:path*",
    "/books/:path*",
    "/shelves/:path*",
    "/api/export",
  ],
};
