import { describe, expect, it } from "vitest";
import { isOfficialUrl, discoverOfficialUrl } from "@/lib/specs/extract/discover";

describe("isOfficialUrl (manufacturer-domain allowlist)", () => {
  it("accepts manufacturer domains (incl. www and subdomains)", () => {
    expect(isOfficialUrl("https://www.apple.com/macbook-air/specs/")).toBe(true);
    expect(isOfficialUrl("https://www.samsung.com/sec/notebooks/")).toBe(true);
    expect(isOfficialUrl("https://www.lge.co.kr/gram")).toBe(true);
  });

  it("rejects retailers, blogs, and unsafe URLs", () => {
    expect(isOfficialUrl("https://www.coupang.com/x")).toBe(false);
    expect(isOfficialUrl("https://some-blog.tistory.com/123")).toBe(false);
    expect(isOfficialUrl("https://apple.com.evil.com/")).toBe(false); // suffix trick
    expect(isOfficialUrl("javascript:alert(1)")).toBe(false);
  });
});

describe("discoverOfficialUrl", () => {
  it("returns the catalog source for known products (no search needed)", async () => {
    expect(await discoverOfficialUrl("맥북 에어 M3", "laptop")).toContain("apple.com");
    expect(await discoverOfficialUrl("LG 그램 16", "laptop")).toContain("lge.co.kr");
  });

  it("uses injected search and keeps only an official-domain result", async () => {
    const search = async () => [
      "https://www.coupang.com/x",
      "https://blog.naver.com/y",
      "https://www.dell.com/xps-13/specs"
    ];
    const complete = async () => JSON.stringify({ url: "https://www.dell.com/xps-13/specs" });
    expect(await discoverOfficialUrl("Dell XPS 13", "laptop", { search, complete })).toBe(
      "https://www.dell.com/xps-13/specs"
    );
  });

  it("returns null when AI refuses the official-domain candidates", async () => {
    const search = async () => ["https://www.dell.com/xps-13/specs"];
    const complete = async () => JSON.stringify({ url: "" });

    expect(await discoverOfficialUrl("Not Dell XPS", "laptop", { search, complete })).toBeNull();
  });

  it("rejects an AI-picked URL outside the filtered candidate set", async () => {
    const search = async () => ["https://www.dell.com/xps-13/specs"];
    const complete = async () => JSON.stringify({ url: "https://www.apple.com/macbook-air/specs/" });

    expect(await discoverOfficialUrl("Dell XPS 13", "laptop", { search, complete })).toBeNull();
  });

  it("returns null when search yields no official domain", async () => {
    const search = async () => ["https://www.coupang.com/x", "https://danawa.com/y"];
    expect(await discoverOfficialUrl("듣보 노트북", "laptop", { search })).toBeNull();
  });

  it("returns null with no catalog hit and no search", async () => {
    expect(await discoverOfficialUrl("아무거나 신제품", "laptop")).toBeNull();
  });
});
