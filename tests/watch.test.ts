import { describe, expect, it } from "vitest";
import { evaluateAlert, DROP_THRESHOLD } from "@/lib/watch/alerts";
import { addTo, removeFrom, hasIn } from "@/lib/watch/store";
import type { Watch } from "@/lib/watch/types";
import type { PriceHistory } from "@/lib/pricing/types";

const watch: Watch = {
  productId: "macbook-air-13-m3",
  name: "맥북 에어 13 M3",
  region: "KR",
  addedAt: "2026-06-01T00:00:00Z"
};

function history(partial: Partial<PriceHistory>): PriceHistory {
  return {
    productId: watch.productId,
    region: "KR",
    currency: "KRW",
    points: [],
    current: 2_000_000,
    lowest: 1_800_000,
    highest: 2_200_000,
    average: 2_000_000,
    dealScore: 0,
    source: "seed",
    ...partial
  };
}

describe("evaluateAlert", () => {
  it("fires on target hit", () => {
    const d = evaluateAlert({ ...watch, targetPrice: 1_900_000 }, history({ current: 1_850_000 }));
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("target");
  });

  it("fires at an all-time low", () => {
    const d = evaluateAlert(watch, history({ current: 1_800_000, lowest: 1_800_000 }));
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("all_time_low");
  });

  it("fires on a notable drop below average", () => {
    const avg = 2_000_000;
    const current = Math.round(avg * (1 - DROP_THRESHOLD - 0.01));
    const d = evaluateAlert(watch, history({ current, average: avg, lowest: current - 1 }));
    expect(d.fire).toBe(true);
    expect(d.reason).toBe("drop");
  });

  it("does not fire when price is near/above average with no target", () => {
    const d = evaluateAlert(watch, history({ current: 2_000_000, average: 2_000_000, lowest: 1_700_000 }));
    expect(d.fire).toBe(false);
  });

  it("suppresses repeat alerts at the same or higher price", () => {
    const h = history({ current: 1_800_000, lowest: 1_800_000 });
    expect(evaluateAlert(watch, h, 1_800_000).fire).toBe(false); // already told at 1.8M
    expect(evaluateAlert(watch, h, 1_900_000).fire).toBe(true); // dropped below last notice
  });
});

describe("watch store core (pure)", () => {
  it("adds without duplicates", () => {
    const a = addTo([], watch);
    expect(a).toHaveLength(1);
    expect(addTo(a, watch)).toHaveLength(1); // idempotent
  });

  it("removes by productId", () => {
    const a = addTo([], watch);
    expect(hasIn(a, watch.productId)).toBe(true);
    const b = removeFrom(a, watch.productId);
    expect(hasIn(b, watch.productId)).toBe(false);
  });
});
