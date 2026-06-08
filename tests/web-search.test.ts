import { afterEach, describe, expect, it, vi } from "vitest";
import { configuredSearchProvider, searchWeb } from "@/lib/specs/extract/web-search";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("searchWeb", () => {
  it("returns no results when no search provider is configured", async () => {
    delete process.env.BRAVE_SEARCH_API_KEY;
    delete process.env.GOOGLE_SEARCH_API_KEY;
    delete process.env.GOOGLE_SEARCH_CX;

    expect(configuredSearchProvider()).toBeNull();
    expect(await searchWeb("Dell XPS 13 official specs", "US")).toEqual([]);
  });

  it("uses Brave Search when BRAVE_SEARCH_API_KEY is configured", async () => {
    process.env.BRAVE_SEARCH_API_KEY = "brave-key";
    delete process.env.GOOGLE_SEARCH_API_KEY;
    delete process.env.GOOGLE_SEARCH_CX;

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          web: {
            results: [
              {
                title: "Dell XPS 13",
                url: "https://www.dell.com/xps-13/specs",
                description: "Official specifications"
              }
            ]
          }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchWeb("Dell XPS 13 official specs", "US");

    expect(configuredSearchProvider()).toBe("brave");
    expect(results).toEqual([
      {
        title: "Dell XPS 13",
        url: "https://www.dell.com/xps-13/specs",
        snippet: "Official specifications"
      }
    ]);
    expect(String(fetchMock.mock.calls[0][0])).toContain("api.search.brave.com");
  });

  it("uses Google Custom Search when Google keys are configured", async () => {
    delete process.env.BRAVE_SEARCH_API_KEY;
    process.env.GOOGLE_SEARCH_API_KEY = "google-key";
    process.env.GOOGLE_SEARCH_CX = "cx";

    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          items: [
            {
              title: "Apple MacBook Air",
              link: "https://www.apple.com/macbook-air/specs/",
              snippet: "Official specs"
            }
          ]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchWeb("MacBook Air official specs", "US");

    expect(configuredSearchProvider()).toBe("google");
    expect(results[0]?.url).toBe("https://www.apple.com/macbook-air/specs/");
    expect(String(fetchMock.mock.calls[0][0])).toContain("customsearch");
  });
});
