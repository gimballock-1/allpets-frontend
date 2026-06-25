"use client";

import { useEffect, useState } from "react";
import { THEMES, ACTIVE_THEME, type ThemeKey } from "@/lib/theme";

/**
 * Dev/review control: flips `data-theme` on <html> so every semantic token
 * (and therefore every component on the page) re-skins live — proving the
 * "change in one place, reflects everywhere" architecture. Preview-only:
 * it does NOT change the shipped ACTIVE_THEME (that's src/lib/theme.ts).
 *
 * State is initialised from ACTIVE_THEME (a constant, not a DOM read) so the
 * first client render matches the server-rendered <html data-theme> — no
 * hydration mismatch. The DOM is synced in an effect (not in render/handlers).
 */
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeKey>(ACTIVE_THEME);

  // Apply the previewed theme to <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Restore the shipped theme when leaving the styleguide.
  useEffect(() => {
    return () => {
      document.documentElement.dataset.theme = ACTIVE_THEME;
    };
  }, []);

  return (
    <div
      className="rounded-pill border-border shadow-sm inline-flex flex-wrap gap-1 border bg-paper p-1.5"
      role="group"
      aria-label="Preview theme"
    >
      {THEMES.map((t) => {
        const active = theme === t.key;
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(t.key)}
            className={
              "rounded-pill px-3.5 py-1.5 text-small font-semibold transition-colors " +
              (active ? "bg-brand text-on-brand" : "text-ink-muted hover:bg-panel")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
