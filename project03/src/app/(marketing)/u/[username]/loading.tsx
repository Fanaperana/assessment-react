import { LoadingState } from "@/components/route-states";
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <LoadingState label="Loading profile" />
    </main>
  );
}
