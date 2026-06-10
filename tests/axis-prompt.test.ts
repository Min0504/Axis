import { describe, expect, it } from "vitest";
import { buildAxisUserPrompt } from "@/lib/ai/axis-prompt";

describe("buildAxisUserPrompt", () => {
  it("binds the decision prompt to official specs and the active locale", () => {
    const prompt = buildAxisUserPrompt({
      options: ["iPhone 16", "Galaxy S25"],
      category: "smartphone",
      locale: "en",
      templateKeys: ["칩셋", "배터리"],
      officialSpecs: [
        { source: "https://apple.example/specs", specs: { chipset: "A18" } },
        { source: "https://samsung.example/specs", specs: { chipset: "Snapdragon 8 Elite" } }
      ]
    });

    expect(prompt).toContain("Response language: English");
    expect(prompt).toContain("https://apple.example/specs");
    expect(prompt).toContain("never fabricate");
    expect(prompt).not.toContain("retailPrices");
  });
});
