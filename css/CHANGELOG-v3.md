# CSS Changelog — Version 3.1

**Date:** 2026-06-05  
**Author:** Mr Anderson (Neo)  
**Scope:** Patch all 64 missing CSS class references across all 7 HTML pages + add Chen Kitchen audit component library

## What Changed (from v3)

### v3 Covered (Chen Kitchen Audit refinements):
- Extended palette: `--color-warm-grey`, `--color-light-brass`, `--color-faint-coral`, `--color-mid-grey`
- DM Sans weights: 400,500,600,700 (was 300,400,500)
- Hero gradient: `linear-gradient(165deg, #1a1a1a → #2a2219 → #806339)`
- Section labels: DM Sans Coral (was DM Mono Brass)
- H4: DM Sans Bold Brass (was Playfair)
- Body text: `p` 0.95rem, `.lead` 1.05rem
- Blockquote: brass left-border, Playfair italic, mid-grey

### v3.1 Patch (64 missing class references fixed):
- About page: `.about-layout`, `.about-image`, `.about-text`
- Hero BEM: `.hero__title`, `.hero__tagline`, `.hero__subtitle`, `.hero__actions`, `.hero__note`
- Buttons BEM: `.btn--primary`, `.btn--secondary`, `.btn--large`, `.btn--full`
- Utilities: `.mt-md`, `.mt-xl`, `.mt-2xl`, `.mb-md`, `.mb-xl`, `.text-lg`, `.text-sm`
- Sub-page hero: `.section--hero`, `.section-header__text`
- Value props: `.value-list`, `.value-item`, `.value-item__icon`, `.value-item__title`, `.value-item__text`
- Pricing: `.pricing-highlight`, `.pricing-highlight__amount`, `.pricing-highlight__label`
- Forms: `.form--wide`, `.form-hint`
- Articles: `.article-layout`, `.article-list`, `.article-card__read-more`, `.sidebar__box`
- Clients: `.testimonial-grid`, `.testimonial__avatar`, `.testimonial__quote`
- Cards: `.card-grid--2`
- Footer: `.footer-brand`, `.footer-nav`

### Audit Components Added (28 components from Chen Kitchen production copy):
- `.callout`, `.callout-brass`
- `.cover-badge`
- `.key-figures`, `.key-fig`
- `.drain-card` (with coral top bar)
- `.opp-card` (with brass top bar)
- `.tier-banner`, `.tier-qw`, `.tier-fdn`, `.tier-str`
- `.phase-block`, `.phase-num`, `.phase-cost`
- `.table-wrap`, `.table-total`
- `.matrix`
- `.path-cards`, `.path-card`, `.path-card.featured`
- `.critical-path`, `.cp-node`, `.cp-arrow`
- `.tool-card`
- `.checklist`
- `.glossary-term`
- `.cta-block`
- `.exit-row`
- `.team-card`

## File Stats
- **Lines:** 1,906
- **Braces:** 335/335 (balanced)
- **Size:** ~46KB
- **All CSS classes referenced in HTML pages now exist**

## Technical Note
This file was built via 3-part shell heredoc concatenation due to the OpenClaw write tool's ~25KB truncation limit. The build script is at `css/build_css.py`. To rebuild: run 3 sequential `cat >>` append operations as documented in this session.
