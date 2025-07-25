import { getSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  return (
    <main className="min-h-screen grid place-items-center">
      {session?.user ? (
        <div>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      ) : (
        <div>
          <Link href="/auth/login">Login</Link>
        </div>
      )}
    </main>
  );
}
