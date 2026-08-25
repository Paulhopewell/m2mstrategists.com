# CLAUDE.md — M2M Growth, AI & Exit Strategists

**IMPORTANT — This site was manually built and does not follow Option B brand guidelines.** Treat the existing CSS and HTML as the working design unless explicitly told to apply Option B.

## Option B Brand Guidelines (apply ONLY when instructed)

When told "follow Option B" or "apply the brand guidelines", switch to:
- **Font:** Verdana (headings and body), Courier New (monospace)
- **Palette:** Rich Black #040406, White #FFFFFF, Slate Blue #59738e, Espresso Brown #462617, Flint Gray #9e9d98, Charcoal Blue #354054, Bastille #2e2e30, Antique Brass #806339
- **Feel:** Minimalist, clean, high-contrast, corporate
- **Full spec:** `OPTION-B-REVERSION-GUIDE.md` — contains a complete CSS override file

## Design System (current — manual build)

- **Fonts:** Playfair Display / Georgia (headings), DM Sans + Inter (body), DM Mono (labels)
- **Palette:** Coral #C25D45, Coral-text #AA513C (accessible text variant), Brass #806339, Near-Black #1A1A1A, Cream #F9F7F4
- **Single CSS file:** `css/style.css` (~1,050 lines) — source of truth. Do not create additional stylesheets.
- **Cache busting:** every page links `css/style.css?v=N`. **Bump `N` on all pages together** after any CSS change.
- **CSS custom properties** are short semantic names (`--coral`, `--brass`, `--cream`, `--dark`, `--mid`, `--light-line`), not `--color-*`.

### Responsive rules (important — these were deliberate fixes)

- **Fluid gutters:** `.container` and `.hero` use `min(48px, Nvw)` padding. Do **not** replace with a fixed padding override inside a media query — that makes the text column jump *wider* as the window narrows.
- **Fluid type:** hero `h1`/subtitle scale via `clamp()`. Do **not** add fixed `font-size` overrides in media queries — it causes the heading to snap to a different size mid-resize.
- **Breakpoints:** 1500px (tighten nav) → 1340px (drop logo wordmark) → 1200px (hero badge slides off-screen, arrow hint remains) → 1060px (hamburger nav) → 820px (grids 3→2 col) → 600px (grids →1 col).

## Voice

- **"We" / "Our"** — company/website copy, client-facing
- **"Our founder, Paul"** or **"Paul"** — when referencing the founder
- **Never "I"** in company-facing copy
- **Tone:** Clear, direct, commercially grounded, no hype
- **Punctuation:** copy favours commas/semicolons over em-dashes in body text

## Naming (kept deliberately distinct)

- **Company:** M2M Growth, AI & Exit Strategists
- **Framework:** the Miner to Millionaire (M2M) Framework
- **Paid diagnostic:** the M2M Growth, AI & Exit Audit
- **Ongoing retainer programme:** M2M Business Concierge

## Project Structure

```
├── index.html              — homepage
├── ai-growth-audit.html    — Growth, AI & Exit Audit sales page (booking form)
├── m2m-framework.html      — the five-level M2M Framework
├── articles.html           — article index (articles not yet written)
├── clients.html            — testimonials (representative examples, not real clients)
├── contact.html            — contact form
├── articles/article-template.html — template for future articles (not linked)
├── css/style.css           — single source of truth
├── css/reset.css
├── assets/images/          — book-now.png, hero-montage.jpg, m2m-badge.png, pyramid.png
├── creative-brief.md       — full project context
├── OPTION-B-REVERSION-GUIDE.md — CSS override + instructions for Option B
└── CLAUDE-CODE-HANDOFF.md  — status and next steps from an earlier phase
```

## Known unfinished (intentional at this stage)

- `articles.html` links to 8 articles that do not exist yet
- `href="#"` placeholders: "Book a Call with Paul", "Access Free Resources", "Start the Conversation", article topic tags
- No `robots.txt` or `sitemap.xml` yet
- Footer has no postal address (placeholder was removed; phone + email only)

## Domain

- URLs in canonical / OG / Twitter / JSON-LD tags use `https://www.m2mstrategists.com` (57 occurrences)
- Contact email `team@m2mstrategists.com` (30 occurrences)
- **Note:** the framework brand name "Miner to Millionaire" is deliberately unrelated to the domain and must never be swapped in a domain find-and-replace (10 occurrences in visible copy)
- The repo directory is `m2mstrategists.com`, matching the public website and GitHub repository

## Workflow

- Current working branch: `rosita-m2m-site` — **do not commit directly to `main`**
- `main` hosts the live coming-soon page via Netlify — do not push unfinished work there
- Merge to `main` only when the site is approved for launch
