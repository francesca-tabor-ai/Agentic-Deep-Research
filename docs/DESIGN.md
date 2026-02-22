# Design system

**Vibe:** “We’re serious, but not intimidating.” Developer-first, calm, confident, quietly powerful. Invisible infrastructure over flashy.

---

## Typography

- **Font:** DM Sans (humanist sans-serif) — high legibility, soft curves and clear geometry.
- **Headlines:** Large, bold, confident; often sentence-case. `font-sans`, `font-bold`, `tracking-tight`.
- **Body:** Regular/light weights, generous line height. `leading-relaxed` (1.625).
- **UI & data:** Clear, neutral; tuned for readability.

---

## Colour

- **Background:** White (light) / near-black (dark). Dominant background stays neutral.
- **Text:** Near-black primary (`--foreground`), cool greys for secondary (`--muted-foreground`).
- **UI structure:** Cool greys for borders, dividers, muted surfaces (`--border`, `--muted`).
- **Accent:** Signature multi-colour gradient (purples → blues → pinks → oranges). Used sparingly: hero badge, primary CTA, highlights. Never overwhelms content.
- **Primary (solid):** Violet from the gradient for buttons, links, key UI when gradient isn’t used.

CSS: `--background`, `--foreground`, `--muted`, `--border`, `--primary`, `.bg-gradient-signature`, `.text-gradient-signature`.

---

## Layout & UI

- **White space:** Generous padding and section spacing.
- **Hierarchy:** Strong typographic scale; headings use `tracking-tight` and clear size steps.
- **Rounded UI:** `rounded-2xl` for cards and main CTAs, `rounded-xl` for controls and smaller blocks.
- **Depth:** Soft shadows: `shadow-soft`, `shadow-soft-lg` (subtle, not heavy).
- **Motion:** Short, subtle transitions (`duration-200`) on hover/focus.

---

## Usage

- **Landing:** Gradient on hero badge and main “Go to Research” CTA only; rest is clean and minimal.
- **App pages:** Headers use `font-sans`, `tracking-tight`; back buttons and cards use `rounded-2xl`; primary actions use `bg-primary` or gradient + `shadow-soft`.
- **Data (Metrics):** Clear labels, neutral background, primary for key numbers; rating bars use primary fill.
