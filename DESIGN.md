# Axis Design System

## 1. Atmosphere & Identity

Axis should feel like a quiet decision desk for expensive electronics. The interface is not playful or marketplace-loud; it should read as evidence-first, compact, and composed. The signature is a clean analyst surface: soft blue emphasis, restrained cards, and recommendation moments that feel deliberate rather than promotional.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface / page | `--bg` | `#ffffff` | `#0d0f14` | Main page background |
| Surface / subtle | `--bg-subtle` | `#f8f9fc` | `#111318` | Tinted sections and promos |
| Surface / card | `--card` | `#ffffff` | `#161921` | Cards, panels, dialogs |
| Text / primary | `--text` | `#0f172a` | `#e2e8f4` | Headings and dense body text |
| Text / secondary | `--muted` | `#64748b` | `#8891a6` | Helper copy and metadata |
| Accent / primary | `--accent` | `#3454e8` | `#5b78f5` | Primary actions, focus, key badges |
| Accent / secondary | `--accent-2` | `#7c5cff` | `#9474ff` | Secondary emphasis only |
| Border / default | `--border` | `#e2e8f0` | `#252a3a` | Cards, dividers, controls |
| Border / subtle | `--border-light` | `#f1f5f9` | `#1e2230` | Soft inner separators |
| Focus ring | `--ring` | `rgba(52, 84, 232, 0.14)` | `rgba(91, 120, 245, 0.2)` | Focus and active halo |

### Rules

- Accent blue is functional, not decorative. It belongs on actions, key states, and result emphasis.
- Light mode stays mostly white; dark mode can carry the atmospheric radial tint already in `app/globals.css`.
- New colors must be added here first before they appear in code.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | `clamp(2rem, 5vw, 3.25rem)` | 800 | 1.05 | `-0.03em` | Hero result titles |
| H1 | `2.25rem` | 800 | 1.1 | `-0.025em` | Major page headers |
| H2 | `1.5rem` | 700 | 1.2 | `-0.02em` | Section headers |
| H3 | `1.125rem` | 700 | 1.3 | `-0.01em` | Card titles |
| Body / lg | `1rem` | 500 | 1.65 | `0` | Strong supporting text |
| Body | `0.9375rem` | 400 | 1.65 | `0` | Default body copy |
| Body / sm | `0.875rem` | 500 | 1.55 | `0` | Dense UI text |
| Caption | `0.75rem` | 600 | 1.4 | `0.04em` | Labels and metadata |
| Overline | `0.6875rem` | 700 | 1.35 | `0.08em` | Upper label accents |

### Font Stack

- Primary: `Pretendard, Inter, system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif`
- Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Rules

- Pretendard is the primary face. Use the existing stack rather than introducing a new font family.
- Recommendation titles can be large, but helper paragraphs should stay compact and readable.
- Use balanced wrapping on promotional and share-facing headings where possible.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight icon spacing |
| `--space-2` | `8px` | Inline gaps, pills |
| `--space-3` | `12px` | Small card padding |
| `--space-4` | `16px` | Standard control padding |
| `--space-5` | `20px` | Compact panel padding |
| `--space-6` | `24px` | Default card padding |
| `--space-8` | `32px` | Section rhythm |
| `--space-10` | `40px` | Large internal spacing |
| `--space-12` | `48px` | Major section breaks |

### Grid

- Main result content width: `680px`
- Narrow utility width: `640px`
- Mobile layout should stack without horizontal overflow.
- Promotional or share cards should stay inside the existing result column rather than breaking into a separate hero system.

### Rules

- Prefer contained single-column layouts for results and share pages.
- Promo bands and CTA blocks should use asymmetry through internal layout, not page-level width changes.
- Long product names must wrap cleanly instead of relying on truncation in narrow viewports.

## 5. Components

### Detail Card

- **Structure**: framed section with header, content, optional badge or helper copy
- **Variants**: default, spec, share/promo
- **Spacing**: `--space-5` to `--space-6`
- **States**: default only; nested controls provide hover/focus
- **Accessibility**: headings map to section purpose
- **Motion**: none required beyond button interactions

### Result CTA Block

- **Structure**: timing panel followed by share and buy controls inside one bordered container
- **Variants**: standard result flow, public share flow
- **Spacing**: tight vertical rhythm with one strong preview panel above controls
- **States**: hover, focus, copied, loading
- **Accessibility**: buttons remain semantic `button`/`a`; helper note stays readable on mobile
- **Motion**: subtle shadow and border-color shifts only

### Share Preview Card

- **Structure**: kicker, selected product title, one-line conclusion, compared options
- **Variants**: embedded in result CTA, public shared-result banner
- **Spacing**: `--space-4` internal padding, `--space-2` to `--space-3` between metadata chips
- **States**: static container with interactive child CTA only
- **Accessibility**: compared options remain plain text, not decorative-only
- **Motion**: none

### Watch Button

- **Structure**: compact inline button with status glyph and optional follow-up prompt
- **Variants**: idle, active, permission prompt, denied
- **Spacing**: compact; fits inside dense result surfaces
- **States**: default, hover, active/on, prompt open
- **Accessibility**: `aria-pressed` required; prompt copy must remain keyboard reachable
- **Motion**: glyph fill and background transitions only

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | `120ms` | `ease-out` | Hover and pressed feedback |
| Standard | `180ms` | `ease` | Border, color, and shadow transitions |
| Emphasis | `260ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Larger CTA surface polish if needed |

### Rules

- Animate `transform`, `opacity`, `border-color`, `box-shadow`, and `background-color` only.
- Keep focus-visible obvious with the existing accent ring language.
- Public share surfaces should feel stable; avoid decorative motion that competes with the recommendation.

## 7. Depth & Surface

### Strategy

`mixed`

Axis uses thin borders for structure plus restrained shadows for lift. Cards should look grounded, not floating.

| Level | Value | Usage |
|-------|-------|-------|
| Border | `1px solid var(--border)` | Default card framing |
| Subtle shadow | `var(--shadow-sm)` | Resting cards and CTA blocks |
| Medium shadow | `var(--shadow-md)` | Elevated promo or share preview panels |

### Rules

- Shadow never replaces hierarchy; border and tonal contrast still do the structural work.
- Promotional cards can use a tinted surface, but not a loud gradient that breaks the app’s evidence-first tone.
