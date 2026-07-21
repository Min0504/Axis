# Axis Design System

## 1. Atmosphere & Identity

Axis feels like a quiet decision desk for high-stakes electronics. Surfaces stay calm and readable; accent color appears only on winners, actions, and focus. The signature is comparison clarity: short verdicts, clear winners, and numeric gaps shown as selectable line graphs rather than noise.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | --bg | #ffffff | #0d0f14 | Page background |
| Surface/secondary | --bg-subtle | #f8f9fc | #111318 | Soft panels |
| Text/primary | --text | #0f172a | #e2e8f4 | Headlines, body |
| Text/muted | --muted | #64748b | #8891a6 | Notes, secondary |
| Accent/primary | --accent | #3454e8 | #5b78f5 | CTAs, winners, focus |
| Accent/secondary | --accent-2 | #7c5cff | #9474ff | Winner gradients |

### Rules
- Accent is for interactive or winning states only.
- Coverage notes and helper text use muted, never decorative color.
- Spec line graphs reuse accent/accent-2 for the path and best points.

## 3. Typography

- Body and cards: system UI stack already set in globals.
- Section titles in detail cards stay compact and high-contrast.
- Coverage notes: ~0.82–0.88rem, weight 500–600, muted.

## 4. Spacing

- Detail cards: existing padding (~1.5rem).
- Spec graph cards: 0.7–1.05rem vertical rhythm.
- Line chart viewBox ~640×220 with soft gridlines.

## 5. Components

### CoverageNote
- Short muted sentence near hero input and results graph section.
- Copy pattern: `{year}년 이후 출시 제품부터 비교 가능합니다` (localized).

### SpecBarGraphs
- One compare bar chart at a time for numeric comparable fields.
- Products are shown side-by-side as vertical bars.
- Bar height follows raw numeric magnitude (larger number = taller bar). No better/worse inversion.
- Chip selector shows exactly one spec chart to keep the page short.
- Product labels + numeric values stay visible; no recommendation highlight in the graph.
- Keep existing cmp-table below as the exact-value source.

### Spec table
- Existing `.cmp-table` remains source of exact values.

## 6. Motion

- Verdict bar width transition remains ~0.7s; bar height transition matches verdict bars (~0.7s).

## 7. Accessibility

- Graphs must remain readable without color alone: product labels + numeric values stay visible.
- Spec chips use `role="radio"` with `aria-checked` for single-select.
- Focus rings use accent outline.
- Do not rely on percentage labels for the verdict bars; numeric values stay on graph rows.

## 8. Accepted Debt

- No DESIGN.md existed; this file extracts the current Axis look rather than redesigning.
- React-grab / react-scan / react-doctor deferred pending PM package approval.
