import { describe, expect, it } from "vitest";
import { extractProductSpecs } from "@/lib/specs/extract/pipeline";
import { fetchPageHtml } from "@/lib/specs/extract/fetch";

const OFFICIAL_HTML = `<html><body>
  <h1>MacBook Air</h1>
  <dl>
    <dt>칩</dt><dd>Apple M3, 8코어 CPU</dd>
    <dt>무게</dt><dd>1.24kg</dd>
    <dt>배터리</dt><dd>52.6Wh</dd>
  </dl>
</body></html>`;

describe("extractProductSpecs (fetch → extract loop)", () => {
  it("fetches the page then AI-extracts schema specs (both injected)", async () => {
    const fetchPage = async () => OFFICIAL_HTML;
    const complete = async () =>
      JSON.stringify({ cpu: "Apple M3", weight_g: "1240", battery_wh: "52.6" });

    const result = await extractProductSpecs({
      productName: "맥북 에어 M3",
      category: "laptop",
      sourceUrl: "https://www.apple.com/macbook-air/specs/",
      fetchPage,
      complete
    });

    expect(result).not.toBeNull();
    expect(result!.source).toContain("apple.com");
    expect(result!.tier).toBe(2);
    expect(result!.specs).toEqual({
      model_name: "맥북 에어 M3",
      cpu: "Apple M3",
      weight_g: "1240",
      battery_wh: "52.6"
    });
  });

  it("returns null when the page can't be fetched (e.g. no network / blocked)", async () => {
    const fetchPage = async () => null;
    const complete = async () => JSON.stringify({ cpu: "M3" });
    expect(
      await extractProductSpecs({
        productName: "x",
        category: "laptop",
        sourceUrl: "https://apple.com",
        fetchPage,
        complete
      })
    ).toBeNull();
  });

  it("returns null when no AI key is configured (complete yields null)", async () => {
    const fetchPage = async () => OFFICIAL_HTML;
    const complete = async () => null; // mimics "no provider configured"
    expect(
      await extractProductSpecs({
        productName: "맥북 에어 M3",
        category: "laptop",
        sourceUrl: "https://apple.com",
        fetchPage,
        complete
      })
    ).toBeNull();
  });
});

describe("fetchPageHtml URL guard", () => {
  it("rejects non-http(s) and malformed URLs without fetching", async () => {
    expect(await fetchPageHtml("javascript:alert(1)")).toBeNull();
    expect(await fetchPageHtml("not a url")).toBeNull();
    expect(await fetchPageHtml("")).toBeNull();
  });
});
