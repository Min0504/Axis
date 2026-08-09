import { describe, expect, it } from "vitest";
import { localizeSpecValue } from "@/lib/specs/localize-value";

describe("localizeSpecValue", () => {
  it("keeps Korean values for ko locale", () => {
    expect(localizeSpecValue("battery", "동영상 재생 최대 19시간", "ko")).toBe(
      "동영상 재생 최대 19시간"
    );
    expect(localizeSpecValue("charging", "20W 유선", "ko")).toBe("20W 유선");
    expect(localizeSpecValue("release_date", "2021년 9월", "ko")).toBe("2021년 9월");
  });

  it("localizes battery, charging, and release date for English", () => {
    expect(localizeSpecValue("battery", "동영상 재생 최대 19시간", "en")).toBe(
      "Up to 19 hours video playback"
    );
    expect(localizeSpecValue("charging", "20W 유선, 15W MagSafe 무선", "en")).toBe(
      "20W wired, 15W MagSafe wireless"
    );
    expect(localizeSpecValue("charging", "20W유선", "en")).toBe("20W wired");
    expect(localizeSpecValue("release_date", "2021년 9월", "en")).toBe("September 2021");
    expect(localizeSpecValue("release_date", "2024년", "en")).toBe("2024");
  });

  it("localizes battery, charging, and release date for Japanese", () => {
    expect(localizeSpecValue("battery", "동영상 재생 최대 19시간", "ja")).toBe(
      "動画再生最大19時間"
    );
    expect(localizeSpecValue("charging", "20W 유선, 15W MagSafe 무선", "ja")).toBe(
      "20W 有線, 15W MagSafe 無線"
    );
    expect(localizeSpecValue("release_date", "2021년 9월", "ja")).toBe("2021年9月");
  });

  it("localizes price, ports, stylus, and none-phrases", () => {
    expect(localizeSpecValue("launch_price_krw", "149만 9천원부터", "en")).toBe(
      "from ₩1,499,000"
    );
    expect(localizeSpecValue("launch_price_krw", "125만원부터", "en")).toBe(
      "from ₩1,250,000"
    );
    expect(localizeSpecValue("ports", "Thunderbolt 4 ×2, 3.5mm 헤드폰", "en")).toBe(
      "Thunderbolt 4 ×2, 3.5mm headphone"
    );
    expect(localizeSpecValue("stylus", "Apple Pencil Pro 지원", "en")).toBe(
      "Apple Pencil Pro supported"
    );
    expect(localizeSpecValue("stylus", "Apple Pencil 2세대 지원", "en")).toBe(
      "Apple Pencil 2nd gen supported"
    );
    expect(localizeSpecValue("water_resist", "없음", "en")).toBe("None");
    expect(localizeSpecValue("water_resist", "없음", "ja")).toBe("なし");
    expect(localizeSpecValue("cellular", "Wi-Fi (셀룰러 옵션)", "en")).toBe(
      "Wi-Fi (cellular option)"
    );
  });
});
