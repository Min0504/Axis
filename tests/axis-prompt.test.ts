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

    expect(prompt).toContain("응답 언어: English");
    expect(prompt).toContain("https://apple.example/specs");
    expect(prompt).toContain("공식 스펙 컨텍스트에 없는 수치·정가·URL은 절대 만들지 않는다");
    expect(prompt).not.toContain("retailPrices");
  });
});
