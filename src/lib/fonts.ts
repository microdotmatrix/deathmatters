import { Days_One, Questrial, Space_Mono } from "next/font/google";

export const days_one = Days_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--display-family",
});

export const questrial = Questrial({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--text-family",
});

export const space_mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--code-family",
});
