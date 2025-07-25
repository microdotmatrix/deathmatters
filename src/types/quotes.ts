export interface UnifiedQuote {
  quote: string;
  author: string;
  source: string;
  length: number;
}

export type LengthFilter = "short" | "medium" | "long";

export interface SearchParams {
  keywords?: string;
  author?: string;
  lengths?: LengthFilter[];
}
