import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";

export async function currentSession() {
  await connection();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser(callbackUrl = "/dashboard") {
  const session = await currentSession();
  if (!session)
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}
