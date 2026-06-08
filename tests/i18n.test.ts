import { describe, expect, it } from "vitest";
import { countryForLocale, detectCountry, detectLocale } from "@/lib/i18n";

describe("locale and country routing", () => {
  it("keeps source country independent from display language", () => {
    expect(countryForLocale("ko")).toBe("KR");
    expect(countryForLocale("en")).toBe("US");
    expect(detectCountry("JP", "KR", "ko")).toBe("JP");
    expect(detectLocale("en", "KR", "ko-KR,ko;q=0.9")).toBe("en");
  });

  it("detects first-visit locale and country from geo headers", () => {
    const locale = detectLocale(undefined, "JP", "en-US,en;q=0.9");
    expect(locale).toBe("ja");
    expect(detectCountry(undefined, "JP", locale)).toBe("JP");
  });
});
