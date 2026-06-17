import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.some((p) => path === p || path.startsWith(p + "?"));

  const token = req.cookies.get("familyhub.session");

  if (isPublic) {
    if (token && path !== "/") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|images).*)",
  ],
};
