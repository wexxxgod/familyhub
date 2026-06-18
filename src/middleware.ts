import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("familyhub.session");
  const isLoggedIn = !!token;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + "?"));

  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  if (!isPublic && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|images).*)",
  ],
};
