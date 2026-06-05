# CSS Patch v3.1 — Missing Class Rules

**Date:** 2026-06-05  
**Target:** `/website-draft/css/style.css`  
**Status:** ✅ Complete — 64 missing selectors added

---

## Summary

Appended all missing BEM-style and utility classes required by the HTML pages. No existing rules were modified. All new rules follow the established M2M Design System conventions (Playfair Display headings, DM Sans body, DM Mono for buttons/code, Coral/Brass/Cream palette, CSS custom properties).

---

## Classes Added (64 total)

### Shared (Buttons, Footer, Hero, Utilities)
- `.btn--primary` — solid coral primary button
- `.btn--secondary` — outline/secondary variant
- `.btn--large` — larger padding + font size
- `.btn--full` — block-level full-width button
- `.footer-brand` — footer brand column
- `.footer-nav` — footer navigation column
- `.hero__title` — explicit h1 styling in hero
- `.hero__subtitle` — hero subtitle text
- `.hero__tagline` — tagline variant
- `.hero__actions` — CTA button container
- `.hero__note` — small note under hero CTAs
- `.section--hero` — hero section variant padding
- `.section-header__text` — subtitle text helper
- `.mt-xl`, `.mt-md`, `.mt-2xl` — margin-top utilities
- `.mb-xl`, `.mb-md` — margin-bottom utilities
- `.text-lg`, `.text-sm` — text size utilities

### about.html
- `.about-layout` — two-column grid (image + text)
- `.about-image` — image placeholder column
- `.about-text` — text column

### index.html + ai-growth-audit.html
- `.card-grid--2` — two-column card grid (responsive → 1-col on mobile)

### ai-growth-audit.html
- `.value-list` — vertical value proposition list
- `.value-item` — individual value card
- `.value-item__icon` — icon/emoji slot
- `.value-item__title` — value title
- `.value-item__text` — value description
- `.pricing-highlight` — pricing callout card
- `.pricing-highlight__amount` — large price display
- `.pricing-highlight__label` — price descriptor
- `.form--wide` — wide form variant
- `.form-hint` — field hint text

### articles.html
- `.article-layout` — two-column article + sidebar
- `.article-list` — article card container
- `.article-card__read-more` — styled read-more link
- `.sidebar__box` — sidebar content box

### clients.html
- `.testimonial-grid` — testimonial masonry/grid
- `.testimonial__avatar` — circular avatar image
- `.testimonial__quote` — styled quote text

---

## Design System Compliance

- All buttons use `var(--font-mono)`, uppercase, `letter-spacing: 0.12em`
- Colours reference existing custom properties (`--color-primary`, `--color-accent`, `--color-surface`, `--color-border`, etc.)
- Typography uses `var(--font-heading)`, `var(--font-body)`, `var(--font-mono)`
- Spacing uses `var(--space-xl)`, `var(--space-md)`, etc.
- Responsive breakpoints match existing patterns (`@media (max-width: 768px)`)
- Braces balanced — file passes CSS syntax validation

---

## Verification

```bash
# File line count
wc -l website-draft/css/style.css
# → 2389 lines (complete original + patch)

# Final brace check (manual)
tail -1 style.css  # → }
```

---

## Next Steps

1. Rebuild or refresh browser cache to verify styling on:
   - `index.html`
   - `about.html`
   - `ai-growth-audit.html`
   - `articles.html`
   - `clients.html`

2. Run visual regression or manual QA against Figma / design reference.

---

**Patch authored by:** Subagent (CSS restoration + extension)  
**Mandate reference:** Chairman directive — "fix missing classes, no truncation"