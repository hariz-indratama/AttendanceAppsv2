# Login Page Design Plan — Admin vs Employee

## Current State
Both pages are dark-themed cards with identical layouts, near-identical styles, and only accent color different (emerald vs amber). They feel like the same component copied.

---

## Design Direction: Two Distinct Universes

### Admin → "Command Center"
**Persona:** HR/management — authority, precision, efficiency, power
**Tone:** Neo-brutalist corporate. Sharp, grid-driven, monumental.
**Palette:** Dark slate + electric indigo + sharp cyan accent
**Typography:** `Bricolage Grotesque` (display) + `Instrument Sans` (body)
**Motion:** Staggered grid-reveal entrance, sharp snap hover states

### Employee → "Warm Clock-In"
**Persona:** Workers clocking in daily — approachable, fast, human
**Tone:** Warm editorial. Soft, friendly, organic.
**Palette:** Warm cream + terracotta + warm amber
**Typography:** `Fraunces` (display/serif) + `Figtree` (body)
**Motion:** Gentle fade-up entrance, soft bounce on interactions

---

## Admin Login — "Command Center"

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [LEFT 40%]          │  [RIGHT 60%]                   │
│                     │                                │
│  ▓ Brand mark       │  ┌──────────────────────────┐  │
│  ▓ APP NAME         │  │ Welcome back, Admin      │  │
│  ▓ Tagline         │  │                          │  │
│                     │  │  [Email field]          │  │
│  ▓ Grid lines bg    │  │  [Password field]        │  │
│  ▓ Accent line      │  │                          │  │
│                     │  │  [Sign In →]            │  │
│                     │  └──────────────────────────┘  │
│                     │                                │
│  © footer           │  Employee? Login instead       │
└─────────────────────────────────────────────────────┘
```
**Desktop:** Side-by-side split (40/60), full-height panels
**Mobile:** Stacked — brand strip on top, form below

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--admin-bg` | `#080c14` | Page background |
| `--admin-surface` | `#0d1422` | Card surface |
| `--admin-border` | `#1a2540` | Card border |
| `--admin-text` | `#e2e8f0` | Primary text |
| `--admin-muted` | `#475569` | Secondary text |
| `--admin-accent` | `#6366f1` | Indigo — primary CTA |
| `--admin-accent-glow` | `rgba(99,102,241,0.18)` | Glow |
| `--admin-highlight` | `#22d3ee` | Cyan — decorative |
| `--admin-danger` | `#f43f5e` | Error states |

### Typography
- **Display:** `Bricolage Grotesque` 700, 2rem, -0.03em tracking
- **Heading:** `Instrument Sans` 600, 1.125rem
- **Body:** `Instrument Sans` 400, 0.9375rem
- **Meta/Label:** `Instrument Sans` 500, 0.75rem, uppercase, 0.08em tracking

### Visual Details
- Background: Subtle dot-grid pattern (`radial-gradient`)
- Left panel: Vertical accent line, geometric corner marks
- Card: Sharp 2px border, no border-radius on left edge (brutalist)
- CTA button: Full-width indigo with `box-shadow` glow on hover
- Decorative: Animated scanning line on left panel (CSS keyframes)

### Form Inputs
- Background: `rgba(255,255,255,0.04)`
- Border: 1px solid `--admin-border`, on focus: indigo
- Label: Uppercase, letter-spaced, muted color
- Focus ring: 3px indigo glow

### Animation
- Page load: Left panel fades + slides from left (400ms), right panel content staggers in (opacity 0→1, translateY 16px→0, 100ms stagger)
- Hover: Button glow expands, links snap color

---

## Employee Login — "Warm Clock-In"

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [LEFT 45%]              │  [RIGHT 55%]            │
│                          │                          │
│  ░ Warm gradient bg      │  ┌────────────────────┐  │
│  ░ Organic blob shape     │  │  Clock icon        │  │
│  ░ with clock graphic    │  │  "Ready to clock   │  │
│                          │  │   in?"             │  │
│  ░ App name              │  │                    │  │
│  ░ "Track your time"     │  │  [Email]           │  │
│                          │  │  [Password]        │  │
│  ░ Soft wave bottom      │  │                    │  │
│                          │  │  [Sign In]        │  │
│                          │  └────────────────────┘  │
│                          │  Admin? Use admin portal  │
└─────────────────────────────────────────────────────┘
```
**Desktop:** Side-by-side split
**Mobile:** Full-screen gradient top, form card floating at bottom

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--empl-bg` | `#faf7f4` | Page background (warm cream) |
| `--empl-surface` | `#ffffff` | Card |
| `--empl-border` | `#e8ddd4` | Card border |
| `--empl-text` | `#1c1917` | Primary text |
| `--empl-muted` | `#78716c` | Secondary text |
| `--empl-accent` | `#c2410c` | Terracotta — CTA |
| `--empl-accent-light` | `#fed7aa` | Soft peach (decorative) |
| `--empl-amber` | `#f59e0b` | Warm amber — highlights |
| `--empl-danger` | `#dc2626` | Error states |

### Typography
- **Display:** `Fraunces` 700, 1.75rem, -0.02em tracking (variable optical sizing)
- **Body:** `Figtree` 400/500, 0.9375rem
- **Label:** `Figtree` 500, 0.8125rem

### Visual Details
- Background: Warm cream with subtle radial gradient
- Left panel: Animated organic blob (CSS `border-radius` keyframes) with embedded clock illustration (SVG)
- Wave divider at bottom of left panel
- Card: 16px border-radius, soft shadow
- CTA button: Terracotta with slight warmth, rounded corners (8px)
- No harsh borders — soft shadows only

### Form Inputs
- Background: `rgba(0,0,0,0.03)` (very subtle dark tint)
- Border: transparent, on focus: terracotta border + peach glow
- Labels: Sentence case, warm muted color
- Icon prefixes: Small inline SVG icons inside inputs

### Animation
- Page load: Left panel fades in with blob pulsing gently (3s loop, subtle scale)
- Form: Gentle slide-up + fade (500ms, ease-out)
- Hover: Buttons have soft lift (translateY -2px) with shadow grow
- Success: Checkmark with bounce animation

---

## Font Loading
Add to `index.html` via Google Fonts:
```
Admin: Bricolage Grotesque + Instrument Sans
Employee: Fraunces + Figtree
```

---

## Implementation Steps

### Step 1 — Global font import
- Update `frontend/index.html` to preload both font pairs

### Step 2 — base.css additions
- Add `--admin-*` token block (dark neo-brutalist)
- Add `--empl-*` token block (warm cream)
- No light/dark class toggling on login pages — fixed theme per page

### Step 3 — AdminLoginPage.vue
- Replace scoped CSS with `--admin-*` tokens
- Implement split layout (CSS Grid)
- Add dot-grid background, accent line, geometric marks
- Add staggered entrance animation
- Update typography to Bricolage Grotesque + Instrument Sans

### Step 4 — EmployeeLoginPage.vue
- Replace scoped CSS with `--empl-*` tokens
- Implement split layout (CSS Grid)
- Add warm gradient bg, organic blob animation, wave bottom
- Add gentle fade-up animation
- Update typography to Fraunces + Figtree

### Step 5 — Verify
- `npm run dev:all`
- Check admin: `http://localhost:5173/admin/login`
- Check employee: `http://localhost:5174/employee/login`
- Test responsiveness at mobile width