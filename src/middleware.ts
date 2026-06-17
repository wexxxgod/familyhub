import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;

      // Public routes
      if (path === "/" || path.startsWith("/login") || path.startsWith("/register")) {
        return true;
      }

      // Protected routes
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|api/uploadthing|_next/static|_next/image|favicon.ico|manifest.json|images).*)",
  ],
};
