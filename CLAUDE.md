# CLAUDE.md — paulhopewell.com

**IMPORTANT — This site was manually built and does not currently follow Option B brand guidelines.** Treat the existing CSS and HTML as the working design unless explicitly told to apply Option B.

## Option B Brand Guidelines (apply ONLY when instructed)

When told "follow Option B" or "apply the brand guidelines", switch to:
- **Font:** Verdana (headings and body), Courier New (monospace)
- **Palette:** Rich Black #040406, White #FFFFFF, Slate Blue #59738e, Espresso Brown #462617, Flint Gray #9e9d98, Charcoal Blue #354054, Bastille #2e2e30, Antique Brass #806339
- **Feel:** Minimalist, clean, high-contrast, corporate
- **Full spec:** `OPTION-B-REVERSION-GUIDE.md` — contains a complete CSS override file

## Design System (current — manual build)

- **Fonts:** Playfair Display (headings), DM Sans 400-700 (body), DM Mono (labels)
- **Palette:** Coral #C25D45, Brass #806339, Near-Black #1A1A1A, Cream #F9F7F4
- **Hero gradient:** black-to-brass, 165deg
- **Single CSS file:** `css/style.css` — source of truth. Do not create additional stylesheets.
- **Naming:** BEM where appropriate, semantic elsewhere. All CSS custom properties use `--color-*`, `--font-*`, `--space-*` naming.

## Voice

- **"We"** — company/website copy, client-facing
- **"Our founder, Paul"** or **"Paul"** — when referencing the founder
- **Never "I"** in company-facing copy
- **Tone:** Clear, direct, commercially grounded, no hype

## Project Structure

```
├── index.html              — homepage
├── about.html              — about Paul
├── ai-growth-audit.html    — AI Growth Audit sales page
├── m2m-framework.html      — M2M Coaching Framework
├── services.html, clients.html, articles.html
├── css/style.css           — single source of truth (1,906 lines, v3.1)
├── reference-chen-kitchen-audit.html — design quality benchmark
├── creative-brief.md       — full project context
├── OPTION-B-REVERSION-GUIDE.md — CSS override + instructions for Option B
└── CLAUDE-CODE-HANDOFF.md  — status and next steps from previous phase
```

## Workflow

- Branch: `dev` (do not commit directly to `main`)
- `main` hosts the live coming-soon page via Netlify — do not push unfinished work there
- Commit and push to `dev`. Merge to `main` only when the site is approved for launch.
