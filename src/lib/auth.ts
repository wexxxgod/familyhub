import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const log = (...args: any[]) => console.log("[AUTH]", ...args);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) { log("missing credentials"); return null; }

          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          log("user found:", !!user, !!user?.passwordHash);

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          log("password valid:", isValid);

          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
        } catch (e) {
          log("authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role;
          log("jwt: set id & role", user.email);
        } else {
          log("jwt: refresh", token.email);
        }
        return token;
      } catch (e) {
        log("jwt error:", e);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getAuthSession() {
  return import("next-auth").then(({ getServerSession }) => getServerSession(authOptions));
}

export async function getCurrentUser() {
  const session = await getAuthSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
