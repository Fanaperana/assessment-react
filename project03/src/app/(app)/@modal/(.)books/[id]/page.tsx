import { Suspense } from "react";
import { BookDetail } from "@/components/book-detail";
import { BookModal } from "@/components/book-modal";

async function ModalContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetail id={id} />;
}

export default function InterceptedBook({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <BookModal>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        }
      >
        <ModalContent params={params} />
      </Suspense>
    </BookModal>
  );
}
