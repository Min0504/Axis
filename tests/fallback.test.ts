import { describe, expect, it } from "vitest";
import { buildFallbackDecision } from "@/lib/decision-engine-fallback";

describe("buildFallbackDecision", () => {
  it("does not fabricate comparison values when AI is unavailable", () => {
    const result = buildFallbackDecision(["아이폰", "갤럭시"], "smartphone", "ai-failed");

    expect(result.comparison).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("관점");
  });
});
