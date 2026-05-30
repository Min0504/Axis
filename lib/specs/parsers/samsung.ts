import * as cheerio from "cheerio";
import type { SpecEntry } from "@/lib/specs/types";

/**
 * Samsung global spec pages vary by region/build. This parser targets
 * common spec table/list patterns and returns whatever is present in HTML.
 */
export function parseSamsungSpecsHtml(html: string, url: string): SpecEntry[] {
  const $ = cheerio.load(html);
  const specs: SpecEntry[] = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("th, td");
    if (cells.length < 2) {
      return;
    }

    const name = $(cells[0]).text().replace(/\s+/g, " ").trim();
    const value = $(cells[1]).text().replace(/\s+/g, " ").trim();

    if (name && value) {
      specs.push({ spec_name: name, spec_value: value, source_url: url });
    }
  });

  $("[class*='spec'] li, .spec-list li, .product-spec__list li").each((_, item) => {
    const text = $(item).text().replace(/\s+/g, " ").trim();
    const split = text.split(":");
    if (split.length >= 2) {
      specs.push({
        spec_name: split[0].trim(),
        spec_value: split.slice(1).join(":").trim(),
        source_url: url
      });
    }
  });

  const seen = new Set<string>();
  return specs.filter((spec) => {
    const key = `${spec.spec_name}::${spec.spec_value}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
