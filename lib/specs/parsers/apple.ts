import * as cheerio from "cheerio";
import type { SpecEntry } from "@/lib/specs/types";

type AppleParseOptions = {
  url: string;
  columnClass?: string;
};

export function parseAppleSpecsHtml(html: string, options: AppleParseOptions): SpecEntry[] {
  const $ = cheerio.load(html);
  const specs: SpecEntry[] = [];

  $("div.techspecs-row").each((_, row) => {
    const $row = $(row);
    const header = $row.find(".techspecs-rowheader").first().text().replace(/\s+/g, " ").trim();
    if (!header || header === "\u00a0") {
      return;
    }

    const columns = $row.find(".techspecs-column").toArray();
    const targetColumns = options.columnClass
      ? columns.filter((col) => $(col).attr("class")?.includes(options.columnClass!))
      : columns.slice(0, 1);

    for (const col of targetColumns.length ? targetColumns : columns.slice(0, 1)) {
      const value = $(col)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (!value) {
        continue;
      }

      specs.push({
        spec_name: header,
        spec_value: value,
        source_url: options.url
      });
      break;
    }
  });

  return dedupeSpecs(specs);
}

function dedupeSpecs(specs: SpecEntry[]) {
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
