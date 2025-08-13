import { AppContext } from "@/components/context";
import ScrollUp from "@/components/elements/scroll-up";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getSession } from "@/lib/auth/server";
import { meta } from "@/lib/config";
import { font_display, font_mono, font_text } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${meta.title}`,
    default: meta.title,
  },
  description: meta.description,
  keywords: meta.keywords,
  authors: [{ name: meta.author }],
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: `${meta.colors?.dark}` || "#09090b",
    },
    {
      media: "(prefers-color-scheme: light)",
      color: `${meta.colors?.light}` || "#ffffff",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          font_display.variable,
          font_text.variable,
          font_mono.variable,
          "antialiased"
        )}
      >
        <AppContext>
          <Header user={session?.user} />
          {children}
          <ScrollUp />
          <Footer />
        </AppContext>
      </body>
    </html>
  );
}
