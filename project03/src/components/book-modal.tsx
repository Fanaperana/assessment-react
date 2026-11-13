"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function BookModal({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        router.back();
      }}
      className="m-auto max-h-[90vh] w-[min(94vw,860px)] overflow-y-auto rounded-2xl bg-[#f7f5ef] p-6 text-slate-900 shadow-2xl backdrop:bg-slate-900/70 sm:p-8"
    >
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Close book details"
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Close ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
