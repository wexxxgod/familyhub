import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(...args: any[]) {
  try {
    return await handler(...args);
  } catch (e: any) {
    console.error("[NEXTAUTH GET ERROR]", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(...args: any[]) {
  try {
    return await handler(...args);
  } catch (e: any) {
    console.error("[NEXTAUTH POST ERROR]", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
