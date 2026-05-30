import * as cheerio from "cheerio";
import type { SpecEntry } from "@/lib/specs/types";

/** Fallback parser for official pages with tables or definition lists. */
export function parseGenericSpecsHtml(html: string, url: string): SpecEntry[] {
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

  $("dl").each((_, dl) => {
    $(dl)
      .find("dt")
      .each((i, dt) => {
        const name = $(dt).text().replace(/\s+/g, " ").trim();
        const dd = $(dt).next("dd");
        const value = dd.text().replace(/\s+/g, " ").trim();
        if (name && value) {
          specs.push({ spec_name: name, spec_value: value, source_url: url });
        }
      });
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
