"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type HistoryItem = {
  id: string;
  query: string;
  selected_option: string;
  created_at: string;
};

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("이 기록을 삭제할까요? 되돌릴 수 없습니다.")) {
      return;
    }

    setDeletingId(id);
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    void (async () => {
      if (supabase) {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        setIsLoggedIn(Boolean(user));
      }

      const res = await fetch("/api/history");
      if (res.ok) {
        const body = (await res.json()) as { history: HistoryItem[] };
        setHistory(body.history ?? []);
      }
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <section className="history-card history-empty">
        <p>로그인하면 비교 기록이 저장됩니다.</p>
        <Link href="/login">로그인하기</Link>
      </section>
    );
  }

  if (!history.length) {
    return (
      <section className="history-card history-empty">
        <p>아직 저장된 결정 기록이 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="history-card">
      <h3>최근 결정 기록</h3>
      <ul>
        {history.map((item) => (
          <li key={item.id}>
            <div className="history-meta">
              <span>{item.query}</span>
              <time>{new Date(item.created_at).toLocaleDateString("ko-KR")}</time>
            </div>
            <div className="history-actions">
              <strong>{item.selected_option}</strong>
              <div className="history-buttons">
                <Link href={`/results?historyId=${item.id}`}>다시 보기</Link>
                <button
                  type="button"
                  className="history-delete"
                  onClick={() => void handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
