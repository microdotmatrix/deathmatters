import { AppContext } from "@/components/context";
import ScrollUp from "@/components/elements/scroll-up";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { meta } from "@/lib/config";
import { mona_sans, pathway_extreme, space_mono } from "@/lib/fonts";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          pathway_extreme.variable,
          mona_sans.variable,
          space_mono.variable,
          "antialiased"
        )}
      >
        <AppContext>
          <Header />
          {children}
          <ScrollUp />
          <Footer />
        </AppContext>
      </body>
    </html>
  );
}
