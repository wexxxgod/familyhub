import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { jwtDecrypt } from "jose";
import { createHash } from "crypto";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          familyId: user.familyId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.familyId = (user as any).familyId;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).familyId = token.familyId;
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
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const COOKIE_NAME_SECURE = "__Secure-next-auth.session-token";
const COOKIE_NAME_INSECURE = "next-auth.session-token";

function getCookieName(): string {
  return process.env.NODE_ENV === "production" ? COOKIE_NAME_SECURE : COOKIE_NAME_INSECURE;
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

async function decodeSessionCookie(): Promise<any | null> {
  try {
    const token = cookies().get(getCookieName())?.value;
    if (!token) return null;
    const key = getSecretKey();
    if (!key) return null;
    const { payload } = await jwtDecrypt(token, key);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const payload = await decodeSessionCookie();
  if (!payload?.email) return null;

  return {
    id: payload.id as string,
    email: payload.email as string,
    name: payload.name as string | null,
    image: payload.picture as string | null,
    role: payload.role as string || "FAMILY_MEMBER",
    familyId: payload.familyId as string | null,
  };
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
