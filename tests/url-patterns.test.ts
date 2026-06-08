import { describe, it, expect } from "vitest";
import { buildBrandUrlCandidates } from "@/lib/specs/extract/url-patterns";

describe("buildBrandUrlCandidates", () => {
  describe("Apple products — KR", () => {
    it("iPhone model → /specs/ URL", () => {
      const candidates = buildBrandUrlCandidates("iphone 16 pro", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/iphone-16-pro/specs/");
    });

    it("iPhone base model", () => {
      const candidates = buildBrandUrlCandidates("iphone 14", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/iphone-14/specs/");
    });

    it("iPhone Pro Max", () => {
      const candidates = buildBrandUrlCandidates("iphone 16 pro max", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/iphone-16-pro-max/specs/");
    });

    it("MacBook Air → /specs/ first", () => {
      const candidates = buildBrandUrlCandidates("macbook air 13 m4", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/macbook-air-13-m4/specs/");
    });

    it("AirPods → root URL first (accessory pattern)", () => {
      const candidates = buildBrandUrlCandidates("airpods 4", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/airpods-4/");
    });

    it("AirPods Pro 2 — strips generation number (Apple URL stays at /airpods-pro/)", () => {
      const candidates = buildBrandUrlCandidates("airpods pro 2", "KR");
      // Apple does not include "2" in the AirPods Pro URL slug
      expect(candidates[0]).toBe("https://www.apple.com/kr/airpods-pro/");
    });

    it("AirPods Pro (no generation) → root URL", () => {
      const candidates = buildBrandUrlCandidates("airpods pro", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/airpods-pro/");
    });

    it("iPad Pro M4 — strips chip suffix from URL", () => {
      const candidates = buildBrandUrlCandidates("ipad pro m4", "KR");
      // Apple iPad Pro URL never includes the chip name
      expect(candidates[0]).toBe("https://www.apple.com/kr/ipad-pro/specs/");
    });

    it("iPad Air M2 — strips chip suffix", () => {
      const candidates = buildBrandUrlCandidates("ipad air m2", "KR");
      expect(candidates[0]).toBe("https://www.apple.com/kr/ipad-air/specs/");
    });
  });

  describe("Apple products — JP / US", () => {
    it("iPhone JP region", () => {
      const candidates = buildBrandUrlCandidates("iphone 16", "JP");
      expect(candidates[0]).toBe("https://www.apple.com/jp/iphone-16/specs/");
    });

    it("iPhone US region (no country prefix)", () => {
      const candidates = buildBrandUrlCandidates("iphone 16", "US");
      expect(candidates[0]).toBe("https://www.apple.com/iphone-16/specs/");
    });
  });

  describe("Samsung products", () => {
    it("Galaxy phone → /specs/ URL first", () => {
      const candidates = buildBrandUrlCandidates("galaxy s25", "KR");
      // /specs/ first — matches actual Samsung product page structure
      expect(candidates[0]).toBe("https://www.samsung.com/sec/smartphones/galaxy-s25/specs/");
      expect(candidates[1]).toBe("https://www.samsung.com/sec/smartphones/galaxy-s25/");
    });

    it("Galaxy S+ model slug (+ → plus)", () => {
      const candidates = buildBrandUrlCandidates("galaxy s24+", "KR");
      expect(candidates[0]).toBe("https://www.samsung.com/sec/smartphones/galaxy-s24plus/specs/");
    });

    it("Galaxy Buds → audio path", () => {
      const candidates = buildBrandUrlCandidates("galaxy buds3 pro", "KR");
      expect(candidates[0]).toBe("https://www.samsung.com/sec/audio-sound/galaxy-buds3-pro/specs/");
    });

    it("Galaxy Book → pc path", () => {
      const candidates = buildBrandUrlCandidates("galaxy book4 pro", "KR");
      expect(candidates[0]).toBe("https://www.samsung.com/sec/pc/galaxy-book/galaxy-book4-pro/specs/");
    });
  });

  describe("Sony products", () => {
    it("Sony WF model → candidates returned", () => {
      const candidates = buildBrandUrlCandidates("sony wf-1000xm4", "KR");
      expect(candidates.length).toBeGreaterThan(0);
      // Should target Sony Korea
      expect(candidates[0]).toContain("sony.co.kr");
    });

    it("Sony WH model — US region", () => {
      const candidates = buildBrandUrlCandidates("sony wh-1000xm5", "US");
      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0]).toContain("sony.com");
    });
  });

  describe("Unknown brands", () => {
    it("Completely unknown brand returns empty array", () => {
      const candidates = buildBrandUrlCandidates("bose quietcomfort ultra", "KR");
      expect(candidates).toHaveLength(0);
    });
  });
});
