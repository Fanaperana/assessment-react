import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an account" };

async function SignUpForm({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <AuthForm mode="up" callbackUrl={callbackUrl ?? "/dashboard"} />;
}

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-lg px-6 py-16">
      <Link href="/" className="text-xl font-black">
        Bookshelf<span className="text-amber-600">.</span>
      </Link>
      <h1 className="mt-14 mb-3 text-4xl font-semibold">Start your story</h1>
      <p className="mb-8 text-slate-600">A home for all the books you love.</p>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        }
      >
        <SignUpForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
