import { describe, expect, it } from "vitest";
import { buildFallbackDecision } from "@/lib/decision-engine-fallback";

describe("buildFallbackDecision", () => {
  it("does not fabricate comparison values when AI is unavailable", () => {
    const result = buildFallbackDecision(["아이폰", "갤럭시"], "smartphone", "ai-failed");

    expect(result.comparison).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("관점");
  });

  it("does not invent a winner from option name length", () => {
    const result = buildFallbackDecision(["짧은", "아주아주긴이름"], "laptop", "no-key");

    expect(result.selectedOption).toBe("일시적으로 결론을 낼 수 없습니다");
    expect(result.status).toBe("verification_pending");
    expect(result.verification).toBe("unverified");
    expect(result.selectedOption).not.toBe("아주아주긴이름");
  });
});
