import { Mona_Sans, Pathway_Extreme, Space_Mono } from "next/font/google";

export const pathway_extreme = Pathway_Extreme({
  subsets: ["latin"],
  variable: "--display-family",
});

export const mona_sans = Mona_Sans({
  subsets: ["latin"],
  variable: "--text-family",
});

export const space_mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--code-family",
});
