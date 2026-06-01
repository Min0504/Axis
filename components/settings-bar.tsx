"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

export default function SettingsBar() {
  const { theme, locale, setTheme, setLocale } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="settings-bar">
      {/* Language dropdown */}
      <div className="lang-dropdown" ref={ref}>
        <button
          type="button"
          className="lang-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="lang-globe" aria-hidden>⊕</span>
          <span>{LOCALE_LABELS[locale]}</span>
          <span className="lang-caret" aria-hidden>{open ? "▴" : "▾"}</span>
        </button>

        {open && (
          <div className="lang-menu" role="listbox">
            {SUPPORTED_LOCALES.map((l: Locale) => (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={locale === l}
                className={`lang-option${locale === l ? " active" : ""}`}
                onClick={() => { setLocale(l); setOpen(false); }}
              >
                {LOCALE_LABELS[l]}
                {locale === l && <span className="lang-check" aria-hidden>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      >
        {theme === "dark" ? "☀︎" : "◑"}
      </button>
    </div>
  );
}
