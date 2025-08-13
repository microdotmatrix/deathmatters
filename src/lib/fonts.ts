import {
  Pathway_Extreme as FontDisplay,
  Space_Mono as FontMono,
  Montserrat as FontText,
} from "next/font/google";

export const font_display = FontDisplay({
  subsets: ["latin"],
  variable: "--display-family",
});

export const font_text = FontText({
  subsets: ["latin"],
  variable: "--text-family",
});

export const font_mono = FontMono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--code-family",
});
