import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register"];
  if (publicPaths.some((p) => path === p || path.startsWith(p + "?"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("next-auth.session-token")
    || req.cookies.get("__Secure-next-auth.session-token");

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
