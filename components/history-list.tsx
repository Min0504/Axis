"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getDictionary, type Locale } from "@/lib/i18n";

type HistoryItem = {
  id: string;
  query: string;
  selected_option: string;
  created_at: string;
};

function relativeDate(iso: string, t: ReturnType<typeof getDictionary>["history"]) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return t.today;
  if (diff < 2 * day) return t.yesterday;
  if (diff < 7 * day) return t.daysAgo(Math.floor(diff / day));
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

export default function HistoryList({ locale = "ko" }: { locale?: Locale }) {
  const t = getDictionary(locale).history;
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
    if (!window.confirm(t.deleteConfirm)) {
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
        <p>{t.loginPrompt}</p>
        <Link className="history-empty-cta" href="/login">
          {t.loginLink}
        </Link>
      </section>
    );
  }

  if (!history.length) {
    return (
      <section className="history-card history-empty" id="history">
        <p>{t.empty}</p>
      </section>
    );
  }

  return (
    <section className="history-card" id="history">
      <div className="history-head">
        <h3>{t.title}</h3>
        <span className="history-count">{history.length}</span>
      </div>
      <ul className="history-items">
        {history.map((item) => {
          const opts = item.query
            .split(/\s+vs\s+/i)
            .map((s) => s.trim())
            .filter(Boolean);
          const matchup = opts.length >= 2 ? opts : [item.query];
          return (
            <li className="history-item" key={item.id}>
              <Link className="history-item-main" href={`/results?historyId=${item.id}`}>
                <span className="history-matchup">
                  {matchup.map((opt, i) => (
                    <span key={i} className="hm-part">
                      {i > 0 && <span className="hm-vs" aria-hidden>vs</span>}
                      <span className={opt === item.selected_option ? "hm-win" : "hm-opt"}>
                        {opt}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="history-verdict">
                  <span className="verdict-mark" aria-hidden>✓</span>
                  {item.selected_option}
                </span>
              </Link>
              <div className="history-item-meta">
                <time dateTime={item.created_at} className="history-item-date">
                  {relativeDate(item.created_at, t)}
                </time>
                <button
                  type="button"
                  className="history-delete"
                  onClick={() => void handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label={t.delete}
                >
                  {deletingId === item.id ? "···" : "×"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
