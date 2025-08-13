import { Metadata } from "next";

interface Meta extends Metadata {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  url?: string;
  colors?: {
    light?: string;
    dark?: string;
  };
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const meta: Meta = {
  colors: {
    light: "#ffffff",
    dark: "#09090b",
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  title: "Death Matters",
  description: "Death Matters",
  keywords: ["DeathMatters", "Death", "Matters"],
  author: "MicrodotMatrix",
  url: "https://deathmatterstools.com",
};
