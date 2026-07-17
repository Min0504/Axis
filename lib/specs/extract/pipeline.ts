import type { Category } from "@/lib/types";
import { extractSpecsFromPage, type ExtractedSpecs } from "./index";
import { fetchPageHtml } from "./fetch";

/**
 * Fetch official page HTML → rule-based spec extract.
 * Returns null when fetch fails or rules find nothing (no AI fabrication).
 */
export async function extractProductSpecs(params: {
  productName: string;
  category: Category;
  sourceUrl: string;
  fetchPage?: (url: string) => Promise<string | null>;
}): Promise<ExtractedSpecs | null> {
  const fetchPage = params.fetchPage ?? fetchPageHtml;
  const html = await fetchPage(params.sourceUrl);
  if (!html) return null;

  return extractSpecsFromPage({
    productName: params.productName,
    category: params.category,
    sourceUrl: params.sourceUrl,
    html
  });
}
