import { describe, expect, it } from "vitest";
import {
  htmlToText,
  buildFocusedPageText,
  buildExtractionPrompt,
  parseExtraction,
  extractSpecsFromPage,
  EXTRACTED_TIER
} from "@/lib/specs/extract";

describe("htmlToText", () => {
  it("strips tags, scripts, styles and collapses whitespace", () => {
    const html = `<html><head><style>.x{color:red}</style><script>var a=1</script></head>
      <body><h1>맥북 에어</h1><p>무게  1.24kg</p></body></html>`;
    const text = htmlToText(html);
    expect(text).toContain("맥북 에어");
    expect(text).toContain("무게");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("var a");
    expect(text).not.toContain("<");
  });

  it("decodes a few entities", () => {
    expect(htmlToText("A&amp;B &lt;C&gt;")).toBe("A&B <C>");
  });
});

describe("buildExtractionPrompt", () => {
  it("lists schema field keys and forbids guessing", () => {
    const { system, user } = buildExtractionPrompt("laptop", "맥북 에어 M3", "공식 페이지 텍스트");
    expect(system).toContain("추측");
    expect(system).toContain("가장 낮은");
    expect(user).toContain("battery_wh");
    expect(user).toContain("weight_g");
    expect(user).toContain("맥북 에어 M3");
  });

  it("focuses smartphone text around primary spec fields beyond model and chipset", () => {
    const pageText = [
      "마케팅 문구 ".repeat(500),
      "Capacity 128GB 256GB 512GB",
      "Display 6.1-inch OLED ProMotion up to 120Hz 2000 nits",
      "Weight 206 grams Camera 48MP Main",
      "Power and Battery Video playback: Up to 23 hours",
      "광고 문구 ".repeat(500)
    ].join(" ");

    const focused = buildFocusedPageText("smartphone", pageText);

    expect(focused).toContain("128GB");
    expect(focused).toContain("120Hz");
    expect(focused).toContain("48MP");
    expect(focused).toContain("23 hours");
    expect(focused.length).toBeLessThan(pageText.length);
  });

  it("focuses official page text around category spec slots", () => {
    const pageText = [
      "마케팅 문구 ".repeat(500),
      "운영체제 macOS",
      "디스플레이 Liquid Retina 13.6-inch 500 nits",
      "무게 1.24kg",
      "광고 문구 ".repeat(500)
    ].join(" ");
    const focused = buildFocusedPageText("laptop", pageText);
    const { user } = buildExtractionPrompt("laptop", "맥북 에어", pageText);

    expect(focused).toContain("운영체제");
    expect(focused).toContain("500 nits");
    expect(focused.length).toBeLessThan(pageText.length);
    expect(user).toContain("500 nits");
    expect(user).not.toContain("마케팅 문구 ".repeat(100).trim());
  });
});

describe("parseExtraction", () => {
  it("keeps only valid schema fields with meaningful values", () => {
    const raw = JSON.stringify({
      cpu: "Apple M3",
      weight_g: "1240",
      battery_wh: null,
      bogus_field: "ignored",
      ports: "정보 없음"
    });
    const out = parseExtraction(raw, "laptop");
    expect(out).toEqual({ cpu: "Apple M3", weight_g: "1240" });
  });

  it("tolerates code fences and surrounding prose", () => {
    const raw = "여기 결과:\n```json\n{ \"cpu\": \"M3\" }\n```";
    expect(parseExtraction(raw, "laptop")).toEqual({ cpu: "M3" });
  });

  it("returns empty object on invalid JSON or schemaless category", () => {
    expect(parseExtraction("not json", "laptop")).toEqual({});
    expect(parseExtraction('{"cpu":"M3"}', "general")).toEqual({});
  });
});

describe("extractSpecsFromPage", () => {
  const html = `<h1>MacBook Air</h1>
    <table>
      <tr><td>칩</td><td>Apple M3 칩, 8코어 CPU, 10코어 GPU</td></tr>
      <tr><td>무게</td><td>1.24kg</td></tr>
      <tr><td>배터리</td><td>52.6Wh 리튬 폴리머 배터리</td></tr>
      <tr><td>디스플레이</td><td>13.6형 Liquid Retina, 2560 x 1664</td></tr>
    </table>`;

  it("extracts schema specs from a page via an injected model (deterministic)", async () => {
    const complete = async () =>
      JSON.stringify({ cpu: "Apple M3", weight_g: "1240", battery_wh: "52.6", made_up: "x" });

    const result = await extractSpecsFromPage({
      productName: "맥북 에어 M3",
      category: "laptop",
      sourceUrl: "https://www.apple.com/macbook-air/specs/",
      html,
      complete
    });

    expect(result).not.toBeNull();
    expect(result!.tier).toBe(EXTRACTED_TIER); // 2 = AI-extracted from official
    expect(result!.source).toContain("apple.com");
    expect(result!.specs).toEqual({
      model_name: "맥북 에어 M3",
      cpu: "Apple M3",
      gpu: "10코어 GPU",
      weight_g: "1240",
      battery_wh: "52.6"
    });
    expect(result!.specs.made_up).toBeUndefined();
  });

  it("returns null when the model gives nothing usable", async () => {
    const empty = async () => JSON.stringify({ bogus: "x", cpu: null });
    expect(
      await extractSpecsFromPage({
        productName: "맥북 에어 M3",
        category: "laptop",
        sourceUrl: "https://apple.com",
        html,
        complete: empty
      })
    ).toBeNull();
  });

  it("returns null when there's no usable page text", async () => {
    const complete = async () => JSON.stringify({ cpu: "M3" });
    expect(
      await extractSpecsFromPage({
        productName: "x",
        category: "laptop",
        sourceUrl: "https://apple.com",
        html: "<html></html>",
        complete
      })
    ).toBeNull();
  });
});
