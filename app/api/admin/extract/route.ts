import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/decide";
import { getProductById, allVerifiedProducts } from "@/lib/specs/dataset";
import { discoverOfficialUrl } from "@/lib/specs/extract/discover";
import { extractProductSpecs } from "@/lib/specs/extract/pipeline";
import { configuredSearchProvider } from "@/lib/specs/extract/web-search";
import { detectCategory } from "@/lib/category";
import { isCountry, type Country } from "@/lib/i18n";
import { resolveOfficialProduct, resolveProductSource } from "@/lib/specs/product-registry";
import type { ProductSourceCandidate } from "@/lib/specs/types";

/**
 * Dev-only extraction trigger. Runs the AI extractor against a catalog
 * product's OFFICIAL page and returns the extracted specs for review before
 * they're committed to the verified store.
 *
 * Safety:
 *  - Gated behind AXIS_ADMIN=1 (off in production by default).
 *  - SSRF-safe: only fetches the `source` URL already stored in our catalog;
 *    the caller supplies an `id`, never a URL.
 *  - Returns { result: null } when no AI key is configured (honest no-op).
 *
 * Usage: GET /api/admin/extract?id=macbook-air-13-m3
 *        GET /api/admin/extract            → lists available ids
 */
export async function GET(req: Request) {
  if (process.env.AXIS_ADMIN !== "1") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id")?.trim();
  const productName = searchParams.get("product")?.trim();
  const rawCountry = searchParams.get("country")?.trim().toUpperCase();

  if (!id && !productName) {
    return NextResponse.json({
      status: adminExtractionStatus(),
      ids: allVerifiedProducts().map((p) => ({ id: p.id, name: p.canonicalName, source: p.source }))
    });
  }

  if (productName) {
    const country: Country = isCountry(rawCountry) ? rawCountry : "KR";
    const category = detectCategory(productName);
    const entry = resolveOfficialProduct(productName);
    const source: ProductSourceCandidate | null = entry
      ? resolveProductSource(entry, country)
      : await discoverOfficialUrl(productName, category, { country }).then((url) =>
          url ? { url, tier: 2, kind: "manufacturer" } : null
        );
    if (!source) {
      const status = adminExtractionStatus();
      const hint = status.searchProvider
        ? "공식 도메인 후보를 찾지 못했거나 AI가 제품 일치 공식 페이지로 승인하지 않았습니다."
        : "registry 밖 제품을 찾으려면 BRAVE_SEARCH_API_KEY 또는 GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX가 필요합니다.";
      return NextResponse.json(
        { error: `no source for ${productName} in ${country}`, hint, status },
        { status: 404 }
      );
    }

    const result = await extractProductSpecs({
      productName,
      category,
      sourceUrl: source.url
    });

    return NextResponse.json({
      status: adminExtractionStatus(),
      result,
      source
    });
  }

  if (!id) {
    return NextResponse.json({ error: "missing product id" }, { status: 400 });
  }

  const product = getProductById(id);
  if (!product) {
    return NextResponse.json({ error: `unknown product id: ${id}` }, { status: 404 });
  }

  const result = await extractProductSpecs({
    productName: product.canonicalName,
    category: product.category,
    sourceUrl: product.source // from our catalog, not user input
  });

  if (!result) {
    return NextResponse.json({
      result: null,
      status: adminExtractionStatus(),
      hint: "extraction returned nothing — set an LLM API key (OPENAI/GEMINI/ANTHROPIC) and ensure the official page is fetchable."
    });
  }

  // Compare against the hand-seeded specs so you can spot-check the AI extraction.
  return NextResponse.json({
    status: adminExtractionStatus(),
    result,
    seeded: product.specs,
    note: "review `result.specs` against `seeded` before committing to the dataset."
  });
}

function adminExtractionStatus() {
  return {
    aiConfigured: isAiConfigured(),
    searchProvider: configuredSearchProvider()
  };
}
