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

function relativeDate(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "오늘";
  if (diff < 2 * day) return "어제";
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (!loaded) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <section className="history-card history-empty" id="history">
        <p>로그인하면 최근 기록이 저장돼요.</p>
        <Link className="history-empty-cta" href="/login">
          로그인하기 →
        </Link>
      </section>
    );
  }

  if (!history.length) {
    return (
      <section className="history-card history-empty" id="history">
        <p>아직 기록이 없어요. 첫 선택을 시작해보세요.</p>
      </section>
    );
  }

  return (
    <section className="history-card" id="history">
      <div className="history-head">
        <h3>최근 기록</h3>
        <span className="history-count">{history.length}</span>
      </div>
      <ul className="history-items">
        {history.map((item) => (
          <li className="history-item" key={item.id}>
            <Link className="history-item-main" href={`/results?historyId=${item.id}`}>
              <span className="history-item-q">{item.query}</span>
              <span className="history-item-pick">
                <span className="pick-dot" aria-hidden />
                {item.selected_option}
              </span>
            </Link>
            <div className="history-item-side">
              <time dateTime={item.created_at}>{relativeDate(item.created_at)}</time>
              <button
                type="button"
                className="history-delete"
                onClick={() => void handleDelete(item.id)}
                disabled={deletingId === item.id}
                aria-label="기록 삭제"
              >
                {deletingId === item.id ? "삭제 중" : "삭제"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
