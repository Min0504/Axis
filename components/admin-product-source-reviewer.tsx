"use client";

import { useMemo, useState } from "react";
import type { Country } from "@/lib/i18n";
import { isCountry, SUPPORTED_COUNTRIES } from "@/lib/i18n";
import type { ProductSourceCandidate } from "@/lib/specs/types";

type ExtractedPayload = {
  specs: Record<string, string>;
};

type ExtractResponse = {
  result: ExtractedPayload | null;
  source?: ProductSourceCandidate;
  status?: {
    aiConfigured?: boolean;
    searchProvider?: string | null;
  };
  error?: string;
  hint?: string;
};

function prettyJson(value: Record<string, string>): string {
  return JSON.stringify(value, null, 2);
}

function parseSpecsJson(value: string): Record<string, string> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const entries: [string, string][] = [];
  for (const [key, specValue] of Object.entries(parsed)) {
    if (typeof specValue !== "string") continue;
    const specKey = key.trim();
    const parsedValue = specValue.trim();
    if (specKey && parsedValue) entries.push([specKey, parsedValue]);
  }
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSource(value: unknown): ProductSourceCandidate | undefined {
  if (!isRecord(value)) return undefined;
  const tier = value.tier;
  const kind = value.kind;
  const url = value.url;
  if (typeof url !== "string") return undefined;
  if (kind !== "manufacturer" && kind !== "authorized_importer") return undefined;
  if (tier !== 1 && tier !== 2 && tier !== 3) return undefined;
  return { url, kind, tier };
}

function parseExtractResponse(value: unknown): ExtractResponse {
  if (!isRecord(value)) return { result: null };
  return {
    result: isRecord(value.result) ? { specs: parseSpecsObject(value.result.specs) ?? {} } : null,
    source: parseSource(value.source),
    status: parseStatus(value.status),
    error: typeof value.error === "string" ? value.error : undefined,
    hint: typeof value.hint === "string" ? value.hint : undefined
  };
}

function parseStatus(value: unknown): ExtractResponse["status"] {
  if (!isRecord(value)) return undefined;
  return {
    aiConfigured: typeof value.aiConfigured === "boolean" ? value.aiConfigured : undefined,
    searchProvider:
      typeof value.searchProvider === "string" || value.searchProvider === null
        ? value.searchProvider
        : undefined
  };
}

function parseSpecsObject(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  const entries: [string, string][] = [];
  for (const [key, specValue] of Object.entries(value)) {
    if (typeof specValue !== "string") continue;
    const specKey = key.trim();
    const parsedValue = specValue.trim();
    if (specKey && parsedValue) entries.push([specKey, parsedValue]);
  }
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

async function readJson(response: Response): Promise<unknown> {
  return await response.json();
}

export default function AdminProductSourceReviewer() {
  const [productName, setProductName] = useState("아이폰 16");
  const [country, setCountry] = useState<Country>("KR");
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ExtractResponse | null>(null);
  const [specText, setSpecText] = useState("{}");

  const specsValid = useMemo(() => Boolean(parseSpecsJson(specText)), [specText]);

  async function handleExtract() {
    const name = productName.trim();
    if (!name) {
      setMessage("제품명을 입력하세요.");
      return;
    }

    setExtracting(true);
    setMessage("");
    setResponse(null);
    try {
      const params = new URLSearchParams({ product: name, country });
      const res = await fetch(`/api/admin/extract?${params.toString()}`);
      const payload = parseExtractResponse(await readJson(res));
      setResponse(payload);
      if (!res.ok) {
        setMessage(payload.error ?? "추출에 실패했습니다.");
        return;
      }
      if (!payload.result) {
        setSpecText("{}");
        setMessage(payload.hint ?? "추출 결과가 없습니다.");
        return;
      }
      setSpecText(prettyJson(payload.result.specs));
      setMessage("AI 추출 완료. 값과 출처가 정확한지 확인하세요.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <section className="detail-card admin-source-card">
      <div className="admin-grid">
        <label className="admin-field">
          <span>제품명</span>
          <input
            value={productName}
            onChange={(event) => setProductName(event.target.value)}
            placeholder="예: 아이폰 16"
          />
        </label>
        <label className="admin-field">
          <span>국가</span>
          <select
            value={country}
            onChange={(event) => {
              const next = event.target.value;
              if (isCountry(next)) setCountry(next);
            }}
          >
            {SUPPORTED_COUNTRIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-actions">
        <button className="btn-primary" type="button" onClick={() => void handleExtract()} disabled={extracting}>
          {extracting ? "공식 페이지 추출 중..." : "공식 스펙 추출"}
        </button>
        <span className={`admin-validity ${specsValid ? "valid" : "invalid"}`}>
          {specsValid ? "JSON 형식 정상" : "JSON 형식 확인 필요"}
        </span>
      </div>

      {response?.source && (
        <div className="admin-source-summary">
          <span>{response.source.kind === "authorized_importer" ? "공식 수입처" : "제조사 공식"}</span>
          <span>tier {response.source.tier}</span>
          <a href={response.source.url} target="_blank" rel="noreferrer">소스 열기 ↗</a>
        </div>
      )}

      {response?.status && (
        <div className="admin-source-summary">
          <span>AI {response.status.aiConfigured ? "configured" : "missing"}</span>
          <span>Search {response.status.searchProvider ?? "missing"}</span>
        </div>
      )}

      <label className="admin-field admin-spec-editor">
        <span>AI 추출 스펙 JSON</span>
        <textarea
          value={specText}
          onChange={(event) => setSpecText(event.target.value)}
          spellCheck={false}
        />
      </label>

      {message && <p className="admin-message">{message}</p>}
    </section>
  );
}
