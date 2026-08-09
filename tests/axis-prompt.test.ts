import { describe, expect, it } from "vitest";
import { buildAxisSystemPrompt, buildAxisUserPrompt } from "@/lib/ai/axis-prompt";

const baseInput = {
  options: ["iPhone 16", "Galaxy S25"],
  category: "smartphone" as const,
  templateKeys: ["Chipset", "Battery"],
  officialSpecs: [
    { source: "https://apple.example/specs", specs: { chipset: "A18" } },
    { source: "https://samsung.example/specs", specs: { chipset: "Snapdragon 8 Elite" } }
  ]
};

describe("buildAxisUserPrompt", () => {
  it("binds the decision prompt to official specs and the active locale", () => {
    const prompt = buildAxisUserPrompt({ ...baseInput, locale: "en" });

    expect(prompt).toContain("Response language: English");
    expect(prompt).toContain("https://apple.example/specs");
    expect(prompt).toContain("never fabricate");
    expect(prompt).not.toContain("retailPrices");
  });

  it("locks English response language even when product names originated in Korean", () => {
    const prompt = buildAxisUserPrompt({
      ...baseInput,
      options: ["iPhone 16", "Galaxy S25"], // already localized from 아이폰/갤럭시
      locale: "en",
      templateKeys: ["Chipset", "Battery"]
    });

    expect(prompt).toContain("Response language: English");
    expect(prompt).toContain("Do NOT answer in the language of the typed query");
    expect(prompt).toContain("ONLY in English");
    expect(buildAxisSystemPrompt("en")).toContain("UI locale / response language = English");
    expect(buildAxisSystemPrompt("en")).toContain("regardless of the query language");
  });

  it("locks Japanese and Korean response languages the same way", () => {
    const ja = buildAxisUserPrompt({ ...baseInput, locale: "ja", templateKeys: ["チップセット", "バッテリー"] });
    const ko = buildAxisUserPrompt({ ...baseInput, locale: "ko", templateKeys: ["칩셋", "배터리"] });

    expect(ja).toContain("Response language: 日本語");
    expect(ja).toContain("ONLY in 日本語");
    expect(ko).toContain("Response language: 한국어");
    expect(ko).toContain("ONLY in 한국어");
    expect(buildAxisSystemPrompt("ja")).toContain("日本語");
    expect(buildAxisSystemPrompt("ko")).toContain("한국어");
  });
});
