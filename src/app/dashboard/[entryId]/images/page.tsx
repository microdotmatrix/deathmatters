import { UserEpitaphs } from "@/components/auth/user/epitaphs";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSession } from "@/lib/auth/server";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ entryId: string }>;
}

export default async function Memorials({ params }: PageProps) {
  const { session } = await getSession();
  const { entryId } = await params;

  return (
    <main className="flex flex-col justify-center px-2 lg:px-4 py-8">
      {session ? (
        <>
          <section className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 flex flex-col justify-center items-center space-y-6 py-24 lg:py-0">
              <p>Welcome back, {session.user.name}</p>
              <Link
                href={`/dashboard/${entryId}/images/new`}
                className={buttonVariants({
                  variant: "default",
                  size: "icon",
                })}
              >
                <Icon icon="mdi:plus" />
              </Link>
            </div>
            <div className="flex-2 w-full min-h-[calc(80vh-280px)] flex flex-col justify-center">
              <ScrollArea className="h-full max-h-[calc(100vh-280px)] overflow-y-auto rounded-md border">
                <UserEpitaphs deceasedId={entryId} />
              </ScrollArea>
            </div>
          </section>
        </>
      ) : (
        <div className="flex flex-col gap-2 max-w-xl mx-auto py-12">
          <figure className="relative overflow-clip w-full aspect-square border border-border rounded-lg mb-8">
            <Image
              src="/images/image-generate.png"
              alt="Image Generate"
              fill
              className="object-contain size-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </figure>
          <p>Please login or register to create an epitaph</p>
          <div className="flex gap-2 mx-auto">
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "default" })}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={buttonVariants({ variant: "secondary" })}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
