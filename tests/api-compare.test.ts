import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseRouteClient: vi.fn(),
  buildDecision: vi.fn(),
  buildQuery: vi.fn((options: string[]) => options.join(" vs ")),
  parseOptions: vi.fn(() => []),
  ensureUserProfile: vi.fn(),
  insertComparison: vi.fn()
}));

vi.mock("@/lib/supabase-route", () => ({
  createSupabaseRouteClient: mocks.createSupabaseRouteClient
}));
vi.mock("@/lib/decision-engine", () => ({
  buildDecision: mocks.buildDecision,
  buildQuery: mocks.buildQuery,
  parseOptions: mocks.parseOptions
}));
vi.mock("@/lib/users/ensure-profile", () => ({
  ensureUserProfile: mocks.ensureUserProfile
}));
vi.mock("@/lib/comparisons/repository", () => ({
  insertComparison: mocks.insertComparison
}));

import { POST } from "@/app/api/compare/route";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

const FAKE_RESULT = {
  status: "ok",
  category: "smartphones",
  selectedOption: "아이폰 16",
  oneLineConclusion: "아이폰 16."
};

let ipCounter = 0;
function request(body: unknown) {
  return new Request("http://test.local/api/compare", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.3.0.${++ipCounter}`
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

const routeCtx = { params: Promise.resolve({}) };

beforeEach(() => {
  mocks.createSupabaseRouteClient.mockReset();
  mocks.buildDecision.mockReset();
  mocks.ensureUserProfile.mockReset();
  mocks.insertComparison.mockReset();

  mocks.createSupabaseRouteClient.mockResolvedValue(null);
  mocks.buildDecision.mockResolvedValue(FAKE_RESULT);
  mocks.insertComparison.mockResolvedValue({ id: "cmp-1", error: null });
});

describe("POST /api/compare", () => {
  it("rejects malformed JSON with the legacy message", async () => {
    const res = await POST(request("{broken"), routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("잘못된 요청 형식입니다.");
  });

  it("requires at least two options", async () => {
    const res = await POST(request({ options: ["아이폰 16"] }), routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("두 개 이상의 선택지를 입력해주세요.");
    expect(mocks.buildDecision).not.toHaveBeenCalled();
  });

  it("rejects options above the length cap", async () => {
    const res = await POST(request({ options: ["a".repeat(101), "b"] }), routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("100자");
  });

  it("returns the result without persisting for anonymous users", async () => {
    const res = await POST(request({ optionA: "아이폰 16", optionB: "갤럭시 S25" }), routeCtx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result).toEqual(FAKE_RESULT);
    expect(body.comparisonId).toBeUndefined();
    expect(mocks.insertComparison).not.toHaveBeenCalled();
  });

  it("persists history and returns comparisonId for logged-in users", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } } }) }
    });

    const res = await POST(request({ options: ["아이폰 16", "갤럭시 S25"] }), routeCtx);
    const body = await res.json();

    expect(body.comparisonId).toBe("cmp-1");
    expect(mocks.ensureUserProfile).toHaveBeenCalledTimes(1);
    expect(mocks.insertComparison).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: "u1", selectedOption: FAKE_RESULT.selectedOption })
    );
  });

  it("still returns the result when history persistence fails (best-effort)", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: "a@b.co" } } }) }
    });
    mocks.insertComparison.mockResolvedValue({ id: null, error: "insert failed" });

    const res = await POST(request({ options: ["아이폰 16", "갤럭시 S25"] }), routeCtx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result).toEqual(FAKE_RESULT);
    expect(body.comparisonId).toBeUndefined();
  });

  it("answers 500 with the legacy message when the decision engine fails", async () => {
    mocks.buildDecision.mockRejectedValue(new Error("provider down"));

    const res = await POST(request({ options: ["아이폰 16", "갤럭시 S25"] }), routeCtx);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    expect(body.requestId).toBeTruthy();
  });
});
