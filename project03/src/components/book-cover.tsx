import Image from "next/image";

export function BookCover({
  coverId,
  title,
  size = "M",
}: {
  coverId: number | null;
  title: string;
  size?: "M" | "L";
}) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-amber-800 shadow-md">
      {coverId ? (
        <Image
          src={`https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`}
          alt={`Cover of ${title}`}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className="object-cover"
        />
      ) : (
        <div
          aria-label={`No cover available for ${title}`}
          className="flex h-full items-center justify-center p-5 text-center font-serif text-xl italic text-white"
        >
          {title}
        </div>
      )}
    </div>
  );
}
