# BobTheBriefr Design & Layout Guide

Portable reference for replicating this look in **Tamsi** (or any React/Vite app).  
Aesthetic: **Apple-inspired** — soft gray canvas, white elevated cards, blue accent, pill buttons, frosted sticky header, tight negative letter-spacing on headlines.

---

## 1. Foundations

### Typography

Load in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
```

| Role | Size | Weight | Letter-spacing | Notes |
|------|------|--------|----------------|-------|
| Body | 15px | 400 | normal | `line-height: 1.6` |
| Hero headline | `clamp(40px, 7vw, 72px)` | 800 | `-2px` | Gradient on emphasized phrase |
| Page title | `clamp(24px, 3.5vw, 34px)` | 800 | `-0.7px` | Form / brief headers |
| Section title | 15px | 800 | `-0.25px` | Inside cards |
| Eyebrow / label | 11–12px | 700 | `0.07–0.08em` | **UPPERCASE**, accent or muted |
| Muted support | 13–14px | 400–500 | normal | Secondary copy |
| Brand (header) | 15px | 800 | `-0.4px` | Site name in topbar |

**Headline gradient** (hero emphasis):

```css
background: linear-gradient(135deg, #0071e3 0%, #5e5ce6 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Color tokens (`:root`)

```css
:root {
  /* Surfaces */
  --bg: #f5f5f7;
  --bg-elevated: #ffffff;
  --surface: rgba(255, 255, 255, 0.72);

  /* Borders */
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.14);

  /* Text */
  --text: #1d1d1f;
  --text-secondary: #424245;
  --muted: #6e6e73;
  --muted-light: #a1a1a6;

  /* Brand accent */
  --accent: #0071e3;
  --accent-dark: #0058b0;
  --accent-light: rgba(0, 113, 227, 0.08);

  /* Semantic */
  --danger: #ff3b30;
  --success: #34c759;
  --warning: #ff9f0a;

  /* Shape */
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;

  /* Elevation */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);

  /* Layout */
  --layout-max: 1120px;
  --layout-gutter: 32px;   /* 20px on mobile ≤640px */

  font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
}
```

### Global reset & body

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.6;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

### Pill radius convention

Interactive controls use **`border-radius: 980px`** (full pill) for buttons, chips, and badges. Cards use `--radius` / `--radius-xl`.

---

## 2. Layout system

### Page width tiers

| Container class | Max-width | Use case |
|-----------------|-----------|----------|
| (hero content) | 800px | Centered marketing hero |
| `.app-container` | 760px | Narrow flows |
| `.app-container--workspace` | 1120px | Form + sidebar |
| `.app-container--wide` | 1120px | Direction picker |
| `.app-container--brief` | 920px | Results / output page |
| `.how-section` | 1120px | Feature grid on landing |

All containers: `margin: 0 auto; padding: 32px var(--layout-gutter) 96px`.

### App shell background (non-hero pages)

Subtle radial gradients on gray base:

```css
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 113, 227, 0.09), transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(99, 102, 241, 0.06), transparent),
    var(--bg);
}
```

Landing hero (`.hero-page`) uses flat `var(--bg)` only.

### Workspace grid (main + sidebar)

```css
.app-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.85fr);
  gap: 20px;
  align-items: start;
}
```

Mobile (`≤640px`): single column.

---

## 3. Site header (shared topbar)

Used on **every view** — landing and app — for consistent brand placement.

```
┌──────────────────────────────────────────────────────────────┐
│  [sticky frosted bar — full viewport width]                  │
│  ┌──────────────────── max 1120px ────────────────────────┐ │
│  │ BobTheBriefr                              [Get Started]  │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Structure (React)

```tsx
<header className="site-topbar">
  <div className="site-topbar-inner">
    <button className="site-brand">BobTheBriefr</button>  {/* or span when on home */}
    <div className="site-topbar-end">{/* optional CTA */}</div>
  </div>
</header>
```

### Key CSS

| Property | Value |
|----------|-------|
| Position | `sticky; top: 0; z-index: 100` |
| Height | 56px inner row |
| Background | `rgba(245, 245, 247, 0.82)` + `backdrop-filter: saturate(180%) blur(20px)` |
| Border | `1px solid var(--border)` bottom |
| Inner max-width | `var(--layout-max)` centered |
| Horizontal padding | `var(--layout-gutter)` — **must match page content gutter** |

Brand is flush-left (no extra button padding) so it aligns with cards below.

---

## 4. View map (information architecture)

```
Hero (landing)
  └─ SiteTopbar + Get Started
  └─ Hero section (badge, headline, CTA, animated preview)
  └─ How it works (4-column grid)
  └─ Footer CTA
  └─ AppFooter

Form (workspace)
  └─ SiteTopbar (brand → home)
  └─ 2-column grid
       ├─ Main: EventForm card
       └─ Aside: Tone panel, History, API settings

Loading / Merging
  └─ Same shell, skeleton + spinner

Directions
  └─ Wide container, 3 direction cards + merge bar

Brief (results)
  └─ Narrow container (920px)
  └─ Toolbar (eyebrow + title + export actions)
  └─ Stacked section cards
  └─ Footer
```

---

## 5. Component patterns

### 5.1 Elevated card (`.app-card`)

White surface on gray canvas — used for forms, side panels, settings.

```css
.app-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);   /* 24px */
  box-shadow: var(--shadow);
}
```

Form inner padding: `28px`. Side panels: `22px`.

### 5.2 Section card (`.brief-section`)

Stacked output blocks with header bar + body.

```
┌─────────────────────────────────────────────┐
│ [icon] Section Title          [↻ Regenerate]│  ← gradient header strip
├─────────────────────────────────────────────┤
│                                             │
│  Content area (24px padding)                │
│                                             │
└─────────────────────────────────────────────┘
```

- Border radius: `--radius-xl`
- Hover: accent border tint + `--shadow`
- Header: `linear-gradient(180deg, #fafafa, #fff)` + bottom border

### 5.3 Section icon box

36×36px, 10px radius, per-section color:

| Section | Background | Icon color |
|---------|------------|------------|
| Theme | `#eef4ff` | `#0071e3` |
| Palette | `#fdf2f8` | `#db2777` |
| Copy | `#f0fdf4` | `#16a34a` |
| Sponsor | `#fffbeb` | `#d97706` |
| Logistics | `#f5f3ff` | `#7c3aed` |

SVG icons: 18×18, `stroke-width: 2`.

### 5.4 Buttons

| Class | Look | Usage |
|-------|------|-------|
| `.btn-primary` | Blue gradient pill, white text, full-width default | Main CTAs |
| `.btn-secondary` | White + strong border pill | Secondary actions |
| `.btn-ghost` | Light gray fill pill | Tertiary |
| `.regen-btn` | Small outlined pill in section headers | Inline actions |

Primary gradient:

```css
background: linear-gradient(180deg, #0a84ff 0%, #0071e3 100%);
border-radius: 980px;
font-weight: 700;
```

Hover: darker blue + soft blue glow shadow. Active: `scale(0.98)`.

Focus rings on inputs (not buttons): `box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.14)`.

### 5.5 Form fields

- Grid: `1fr 1fr`, gap `18px 20px`; full-width fields span both columns
- Labels: 13px, weight 700
- Inputs: 1.5px `--border-strong`, `--radius`, bg `--bg`, padding `12px 14px`
- Focus: accent border + ring
- Error: red border + light red ring; `.field-error` 12px below

**Section divider:** dashed border under uppercase section titles.

### 5.6 Chips & badges

| Type | Style |
|------|-------|
| Demo / example chip | Gray bg, pill, hover → accent tint |
| Active chip | Accent border + `--accent-light` bg + outer glow |
| Moodboard chip | Light blue tint |
| Hero badge | Accent text on `--accent-light`, pill |
| Tone value pill | 11px accent label in rounded badge |
| Merge badge | Small accent pill on brief title |

### 5.7 Logistics sub-cards

Nested cards inside a section:

- Default: `--bg` fill, `--radius`, 16px padding
- Warning (Watch out): `#fffbeb` bg, `#fde68a` border, amber text `#92400e`
- Labels: 11px uppercase muted

### 5.8 Color palette display

- Swatches: 72×72px (52px in compact cards), 14px radius, subtle shadow
- Labels: 11px uppercase; hex in monospace `ui-monospace`

### 5.9 Hero preview window

Mock “app in a window” on landing page:

- Outer: `--radius-xl`, `--shadow-lg`, white
- Title bar: `#f0f0f2`, traffic-light dots (12px circles: red/amber/green)
- Rows animate in with shimmer placeholders → content fade-up
- Active row: accent border + `0 0 0 3px var(--accent-light)`

### 5.10 Direction picker

- 3-column card grid (stacks on mobile)
- Each card: direction label, tagline, palette preview, body angle
- Fixed bottom action bar when 2 selected (merge CTA)

### 5.11 Side panels (tone, history)

Same `.app-card` shell. Header row: 36px icon box + title + hint. List items: hover bg, split restore/delete actions.

### 5.12 Toast (fixed bottom-center)

```css
position: fixed;
bottom: 24px;
left: 50%;
transform: translateX(-50%);
border-radius: 10px;
box-shadow: 0 8px 24px rgba(0,0,0,0.12);
```

Variants: success (green), error (red), info (blue) — light tinted backgrounds.

### 5.13 Error banner

Full-width alert above content: light red bg, red border, 14px semibold.

### 5.14 Footer

Centered, 12px, `--muted-light`. Two lines: product credit + developer links. Link hover → `--text` + underline.

---

## 6. Landing page layout

```
[ SiteTopbar ]

        [ IBM badge pill ]

   Your event brief,
   written in seconds.        ← gradient on second line

   Subcopy (19px muted, max 540px)

        [ Generate CTA ]

   ┌─────────────────────────┐
   │ ● ● ●  Preview window   │
   │  animated brief rows    │
   └─────────────────────────┘

──────── How it works ────────
   [01] [02] [03] [04]   ← 4-col grid

──────── Footer CTA ──────────
   headline + sub + button

──────── AppFooter ───────────
```

Hero section padding: `96px 40px 88px` desktop; `56px 24px 64px` mobile.

---

## 7. Form page layout

```
[ SiteTopbar — brand aligned to gutter ]

┌─────────────────────────────┬──────────────────┐
│  Describe your event        │  Tone & style    │
│  ─────────────────────      │  [sliders]       │
│  EXAMPLES [chips]           ├──────────────────┤
│  EVENT DETAILS              │  Recent briefs   │
│  [field grid 2-col]         ├──────────────────┤
│  [Generate] [Directions]    │  API settings    │
└─────────────────────────────┴──────────────────┘
```

Main column ~1.45fr, sidebar ~0.85fr (min 280px).

---

## 8. Brief results layout

```
[ SiteTopbar ]

CREATIVE BRIEF                    [Export PDF] [← New Brief]
Event Name Title

┌─ Theme & Moodboard ─────────────────────────┐
├─ Color Palette ───────────────────────────┤
├─ Copy & Messaging ────────────────────────┤
├─ Sponsor Deck ────────────────────────────┤
└─ Logistics Notes ─────────────────────────┘

Footer
```

Max width **920px** — narrower than workspace for readable long-form output.

---

## 9. Motion & micro-interactions

| Element | Animation |
|---------|-----------|
| Primary button | `scale(0.98)` on active |
| Preview shimmer | 1.4s gradient sweep |
| Preview status | opacity pulse |
| Content reveal | `translateY(6px)` + fade, 0.55s ease |
| Spinners | `spin 0.7s linear infinite` (accent top border) |
| Toast | slide up + fade 0.25s |
| Card hover | border + shadow transition 0.2s |

Keep transitions short: **0.15s** for color/border, **0.2–0.35s** for layout states.

---

## 10. Responsive breakpoints

| Breakpoint | Changes |
|------------|---------|
| `≤640px` | `--layout-gutter: 20px`; workspace → 1 col; form grid → 1 col; toolbars stack; full-width secondary buttons |
| `≤480px` | How-it-works grid → 1 col |

---

## 11. Porting checklist for Tamsi

1. Copy `:root` tokens + global reset into your global CSS.
2. Add Plus Jakarta Sans to HTML.
3. Implement `SiteTopbar` + shared `--layout-max` / `--layout-gutter`.
4. Use `.app-shell` gradient for app views; flat `--bg` for marketing landing if split.
5. Build `.app-card` first — most UI is cards on gray.
6. Use pill buttons (`border-radius: 980px`) consistently.
7. Use uppercase 11px eyebrows for hierarchy (accent color for context labels).
8. Keep headline letter-spacing tight (`-0.7px` to `-2px`).
9. Align header brand flush with content — no extra horizontal padding on brand element.
10. Match mobile gutter reduction at 640px.

---

## 12. Source reference

| What | Where in BobTheBriefr |
|------|------------------------|
| All styles | `src/index.css` |
| Layout orchestration | `src/App.tsx` |
| Shared header | `src/components/SiteTopbar.tsx` |
| Landing structure | `src/components/HeroPage.tsx` |
| Form layout | `src/components/EventForm.tsx` |
| Section cards | `src/components/BriefSection.tsx`, `BriefDisplay.tsx` |
| Icon colors | `src/lib/briefSections.tsx` |
| Footer | `src/components/AppFooter.tsx` |

---

*Derived from BobTheBriefr — July 2026. Reuse freely in Tamsi; swap brand name, accent, and section content as needed.*
