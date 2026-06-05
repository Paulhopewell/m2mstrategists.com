# Creative Brief — Paul Hopewell LLC Website (v2)

**From:** Neo (Mr Anderson, CEO Agent)  
**To:** Rosita Hopewell (if you ever want to revert)  
**Date:** 5 June 2026  
**Status:** Design direction locked — M2M Design System applied

---

## Design Direction Decision (5 June 2026)

The Chairman has directed the website to follow the exact design system from the M2M Framework page:

### Typography
- **Headings:** Playfair Display (serif, 400/600/700 weights + italic)
- **Body:** DM Sans (sans-serif, 300/400/500 weights)
- **Mono/UI:** DM Mono

### Colour Palette
| Colour | Hex | Role |
|--------|-----|------|
| Coral | `#C25D45` | Primary — CTAs, links, accents, badges |
| Brass | `#806339` | Secondary — labels, milestones, metallic warmth |
| Near-Black | `#1A1A1A` | Body text, header bar, footer, dark sections |
| Cream | `#F9F7F4` | Page background |

### CSS Applied
`css/style.css` has been rewritten with this design system. All 7 HTML pages share the same CSS foundation.

---

## Previous Option B Branding

Option B branding (Verdana, 8-colour palette, monochrome feel) is documented in `OPTION-B-REVERSION-GUIDE.md`. To revert:
1. Add `css/option-b-override.css` (code provided in the guide)
2. Add `<link>` to it in every HTML page's `<head>` AFTER `style.css`
3. Remove or ignore the Google Fonts import

The guide is designed to be handed to Claude Code as instructions — it can apply the override automatically.

---

## File Inventory

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Home page | Uses shared `style.css` |
| `about.html` | Paul's story | Uses shared `style.css` |
| `ai-growth-audit.html` | Lead-gen / booking page | Uses shared `style.css` |
| `m2m-framework.html` | Full standalone M2M page (Chairman's HTML) | Self-contained with inline styles |
| `articles.html` | Blog listing | Uses shared `style.css` |
| `articles/article-template.html` | Template for individual articles | Uses shared `style.css` |
| `clients.html` | Client scenarios + disclaimer | Uses shared `style.css` |
| `css/reset.css` | CSS reset | No changes needed |
| `css/style.css` | M2M Design System (shared across all pages) | Updated 5 June 2026 |
| `OPTION-B-REVERSION-GUIDE.md` | Standalone file for Rosita/Claude Code to revert to Option B | Created 5 June 2026 |
| `creative-brief.md` | This file | Updated 5 June 2026 |

---

## Notes

- `m2m-framework.html` is standalone with its own inline CSS. It does not rely on `style.css`. This is intentional — it's the Chairman's canonical M2M page.
- The other 6 pages (index, about, audit, articles, template, clients) share `css/style.css`.
- The Option B reversion guide is a complete, executable instruction set. Claude Code can apply it without human interpretation.
