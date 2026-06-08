import { describe, expect, it } from "vitest";
import {
  localizeOfficialUrl,
  resolveOfficialProduct,
  resolveProductSource
} from "@/lib/specs/product-registry";

describe("product registry", () => {
  it("resolves broad laptop names to official pages", () => {
    expect(resolveOfficialProduct("맥북 에어")?.officialUrl).toBe("https://www.apple.com/macbook-air/specs/");
    expect(resolveOfficialProduct("갤럭시북")?.officialUrl).toBe(
      "https://www.samsung.com/sec/support/model/NT960QGK-KD70G/"
    );
  });

  it("localizes the current MacBook Air official page", () => {
    const entry = resolveOfficialProduct("맥북 에어");
    if (!entry) throw new Error("expected MacBook Air registry entry");
    expect(localizeOfficialUrl(entry.officialUrl, entry.parser, "ko")).toBe(
      "https://www.apple.com/kr/macbook-air/specs/"
    );
  });

  it("uses locale-specific Samsung official pages when available", () => {
    const entry = resolveOfficialProduct("갤럭시 S25");
    if (!entry) throw new Error("expected Galaxy S25 registry entry");
    expect(localizeOfficialUrl(entry.officialUrl, entry.parser, "en", entry.officialUrls)).toBe(
      "https://www.samsung.com/us/smartphones/galaxy-s25/"
    );
    expect(localizeOfficialUrl(entry.officialUrl, entry.parser, "ja", entry.officialUrls)).toBe(
      "https://www.samsung.com/jp/smartphones/galaxy-s25/specs/"
    );
  });

  it("uses country-specific manufacturer pages for extraction", () => {
    const entry = resolveOfficialProduct("갤럭시 S23");
    if (!entry) throw new Error("expected Galaxy S23 registry entry");

    expect(resolveProductSource(entry, "KR")).toEqual({
      url: "https://www.samsung.com/sec/support/model/SM-S911NZEFKOO/",
      tier: 1,
      kind: "manufacturer"
    });
    expect(resolveProductSource(entry, "US")).toBeNull();
    expect(resolveProductSource(entry, "JP")).toBeNull();
  });

  it("allows authorized importer fallback only for legacy models", () => {
    const entry = resolveOfficialProduct("WF-1000XM4");
    if (!entry) throw new Error("expected Sony WF-1000XM4 registry entry");

    expect(resolveProductSource(entry, "KR")).toEqual({
      url: "https://store.sony.co.kr/product-view/102182200",
      tier: 2,
      kind: "authorized_importer"
    });
    expect(resolveProductSource(entry, "US")).toEqual({
      url: "https://www.sony.com/electronics/support/wireless-headphones-bluetooth-headphones/wf-1000xm4/specifications",
      tier: 1,
      kind: "manufacturer"
    });
  });

  it("resolves compact iPhone 14 Pro spacing variants to Apple support specs", () => {
    const compact = resolveOfficialProduct("아이폰14pro");
    const spaced = resolveOfficialProduct("아이폰 14 프로");
    const english = resolveOfficialProduct("iPhone14 Pro");

    expect(compact?.officialUrl).toBe("https://support.apple.com/en-us/111849");
    expect(spaced?.officialUrl).toBe("https://support.apple.com/en-us/111849");
    expect(english?.officialUrl).toBe("https://support.apple.com/en-us/111849");
  });

  it("localizes legacy Apple support spec URLs by country", () => {
    const entry = resolveOfficialProduct("14pro");
    if (!entry) throw new Error("expected iPhone 14 Pro registry entry");

    expect(resolveProductSource(entry, "KR")).toEqual({
      url: "https://support.apple.com/ko-kr/111849",
      tier: 1,
      kind: "manufacturer"
    });
  });
});
