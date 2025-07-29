import { Icon } from "@/components/ui/icon";
import { fetchImage } from "@/lib/api/placid";
import { getGeneratedImagesByDeceasedId } from "@/lib/db/queries";
import Image from "next/image";
import { Suspense } from "react";
import { EpitaphThumbnail } from "./epitaph-thumbnail";

export async function UserEpitaphs({ deceasedId }: { deceasedId: string }) {
  const images = await getGeneratedImagesByDeceasedId(deceasedId);
  return (
    <div className="flex flex-col gap-2 min-h-fit">
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 flex-1 py-16 lg:py-24 px-8">
          <figure className="relative overflow-clip max-w-xl w-full aspect-square border border-border rounded-lg bg-gradient-to-b from-muted/25 to-white/50 dark:to-black/50">
            <Image
              src="/images/image-generate.png"
              alt="Image Generate"
              fill
              className="object-contain size-full opacity-50 not-dark:invert not-dark:hue-rotate-180"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </figure>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            Click the <Icon icon="mdi:plus" className="inline" /> button to
            create an epitaph
          </p>
        </div>
      )}
      {images.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 sm:[&>li]:nth-[3n+1]:col-span-2 lg:grid-cols-2 2xl:grid-cols-3 gap-2 lg:[&>li]:nth-[3n+1]:col-span-2 2xl:[&>li]:nth-[3n+1]:col-span-1">
          {images.map((image) => (
            <li key={image.id}>
              <Suspense
                fallback={
                  <div className="size-full aspect-square bg-muted animate-pulse" />
                }
              >
                <Epitaph epitaphId={image.epitaphId} />
              </Suspense>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function Epitaph({ epitaphId }: { epitaphId: number }) {
  const image = await fetchImage(epitaphId);
  return <EpitaphThumbnail image={image} />;
}
