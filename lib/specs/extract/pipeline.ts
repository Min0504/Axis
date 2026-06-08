import type { Category } from "@/lib/types";
import type { CompleteFn } from "@/lib/ai/complete";
import { extractSpecsFromPage, type ExtractedSpecs } from "./index";
import { fetchPageHtml } from "./fetch";

/**
 * Full extract loop for one product: fetch its official page → AI-extract specs
 * into the schema. `fetchPage` and `complete` are injectable for tests; the
 * defaults are the real HTTP fetcher and the multi-provider LLM caller.
 *
 * Returns null (no fabrication) when the page can't be fetched or no AI key is
 * configured — so this stays dormant until a key is present, then turns on.
 */
export async function extractProductSpecs(params: {
  productName: string;
  category: Category;
  sourceUrl: string;
  fetchPage?: (url: string) => Promise<string | null>;
  complete?: CompleteFn;
}): Promise<ExtractedSpecs | null> {
  const fetchPage = params.fetchPage ?? fetchPageHtml;
  const html = await fetchPage(params.sourceUrl);
  if (!html) return null;

  return extractSpecsFromPage({
    productName: params.productName,
    category: params.category,
    sourceUrl: params.sourceUrl,
    html,
    complete: params.complete
  });
}
