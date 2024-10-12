export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/verify/:path*"],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  if (
    token &&
    (path.startsWith("/sign-in") ||
      path.startsWith("/sign-up") ||
      path.startsWith("/verify"))
  ) {
    return NextResponse.redirect(new URL("/dashbord", request.url));
  }
  if (!token && path.startsWith("/dashbord")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}
