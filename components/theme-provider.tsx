"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, getDictionary, type Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialLocale
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // ── Hydrate theme from localStorage ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const saved = localStorage.getItem("axis-theme") as Theme | null;
    const preferred =
      saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(preferred);

    queueMicrotask(() => {
      if (!cancelled) {
        setThemeState(preferred);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem("axis-theme", t);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    if (!SUPPORTED_LOCALES.includes(l)) return;
    setLocaleState(l);
    // Persist to cookie so the server picks it up on next load.
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // Force a full reload so server-rendered content re-renders in the new locale.
    window.location.reload();
  }, []);

  const t = getDictionary(locale);

  return (
    <ThemeContext.Provider value={{ theme, locale, t, setTheme, setLocale }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/** Convenience hook for just the translation dictionary. */
export function useT() {
  return useTheme().t;
}
