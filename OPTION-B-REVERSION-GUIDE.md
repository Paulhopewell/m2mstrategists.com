# Option B Branding Reversion Guide

**Purpose:** Revert the Paul Hopewell LLC website from the M2M design system back to Branding Option B (Verdana + 8-colour palette).
**Audience:** Rosita Hopewell or Claude Code.
**Last updated:** 5 June 2026

---

## Quick Summary: What Changes

| Element | M2M Design (Current) | Option B (Revert To) |
|---------|---------------------|----------------------|
| Heading font | Playfair Display (serif) | Verdana (sans-serif) |
| Body font | DM Sans | Verdana |
| Mono font | DM Mono | Courier New / monospace |
| Primary colour | Coral #C25D45 | Rich Black #040406 |
| Accent | Brass #806339 | Antique Brass #806339 |
| Background | Cream #F9F7F4 | White #FFFFFF |
| Text | Near-Black #1A1A1A | Rich Black #040406 |
| Secondary text | #4A4440 | Flint Gray #9E9D98 |
| Borders | #E5E0D8 | #E0E0E0 |
| Dark sections | Near-Black #1A1A1A | Charcoal Blue #354054 |
| Header bar | Near-Black with Coral accents | White with Rich Black text |
| Button shape | Square-ish (4px radius) | Rounded (8px radius) |
| Logo font | DM Mono | Verdana |
| Overall feel | Editorial, warm, literary | Corporate, clean, minimalist |

---

## CSS Override File

Save this as `css/option-b-override.css` and link it AFTER `style.css` in every HTML page's `<head>`:

```html
<link rel="stylesheet" href="css/option-b-override.css">
```

### Full Override CSS

```css
/* === Option B Branding Override === */
/* Link AFTER style.css to override M2M design system */
/* Paul Hopewell LLC — approved branding 15 April 2026 */

:root {
  /* --- Typography --- */
  --font-body: Verdana, Geneva, sans-serif;
  --font-heading: Verdana, Geneva, sans-serif;
  --font-mono: 'Courier New', Courier, monospace;

  /* --- Brand Colours (Option B 8-colour palette) --- */
  --color-primary: #040406;        /* Rich Black */
  --color-primary-hover: #354054;  /* Charcoal Blue for hover */
  --color-accent: #806339;         /* Antique Brass — keep, shared between both systems */
  --color-accent-light: #A68A5C;   /* Lighter Brass */
  --color-bg: #FFFFFF;             /* White */
  --color-bg-alt: #F5F5F5;        /* Light gray for alternating sections */
  --color-surface: #FFFFFF;        /* White */
  --color-text: #040406;           /* Rich Black */
  --color-text-light: #9E9D98;     /* Flint Gray — secondary text */
  --color-text-muted: #9E9D98;     /* Flint Gray — captions */
  --color-border: #E0E0E0;         /* Subtle gray border */
  --color-border-light: #F0F0F0;   /* Lighter border */
  --color-cta-bg: #040406;         /* Rich Black */
  --color-cta-text: #FFFFFF;       /* White */
  --color-cta-hover: #354054;      /* Charcoal Blue */
  --color-dark-bg: #354054;        /* Charcoal Blue — for dark sections */
  --color-dark-text: #FFFFFF;      /* White on dark */
  --color-dark-text-muted: rgba(255,255,255,0.75);

  /* --- Borders & Radius — slightly rounder for Option B --- */
  --radius-sm: 6px;
  --radius-md: 8px;

  /* --- Spacing — slightly tighter for Verdana --- */
  --space-4xl: 4rem;
  --space-5xl: 5rem;
}

/* --- Typography adjustments for Verdana --- */
body {
  font-weight: 400;
  font-size: 1rem;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  letter-spacing: -0.02em;
}

p { line-height: 1.6; }

/* --- Header: light background instead of dark --- */
.site-header {
  background: var(--color-bg);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.site-header .site-logo {
  color: var(--color-text);
  opacity: 1;
  font-weight: 700;
}

.site-header .site-logo span {
  color: var(--color-primary);
}

.nav-desktop a {
  color: var(--color-text-light);
  font-weight: 400;
}

.nav-desktop a:hover,
.nav-desktop a.active {
  color: var(--color-primary);
}

.nav-cta {
  background: var(--color-primary);
  color: var(--color-cta-text) !important;
}

.nav-cta:hover { background: var(--color-primary-hover); }

.nav-toggle span { background: var(--color-text); }
.nav-mobile { background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
.nav-mobile a { color: var(--color-text); }

/* --- Hero: softer gradient --- */
.hero {
  background: var(--color-dark-bg);
}

.hero::before {
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.05) 100%);
}

.hero h1, .hero h1 em { color: var(--color-dark-text); }
.hero h1 em { color: var(--color-accent); }

/* --- Section dark: use Charcoal Blue --- */
.section--dark { background: var(--color-dark-bg); }

/* --- Cards: clean, less editorial --- */
.card {
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* --- Buttons --- */
.btn {
  border-radius: var(--radius-md);
  font-weight: 600;
}

/* --- Pullquote: more corporate --- */
.pullquote, blockquote {
  border-left-color: var(--color-accent);
  background: rgba(128,99,57,0.05);
  border-radius: var(--radius-md);
}

/* --- Section labels --- */
.section-label {
  color: var(--color-text-muted);
}

.section-label::before {
  background: var(--color-accent);
}

/* --- E-Myth bars: use primary (black) instead of Coral --- */
.emyth-bar-fill { background: var(--color-primary); }

/* --- AI list arrows --- */
.ai-list li::before { color: var(--color-accent); }

/* --- Level badge numbers --- */
.level-number { color: var(--color-accent); }

/* --- Milestone text --- */
.milestone { color: var(--color-text-muted); }

/* --- Foundation grids --- */
.foundations-grid {
  background: var(--color-border);
  border-color: var(--color-border);
}

.foundation-card { background: var(--color-bg); }
.foundation-number { color: var(--color-accent); }

/* --- CTA Grid --- */
.cta-grid {
  background: var(--color-border);
  border-color: var(--color-border);
}

.cta-card { background: var(--color-bg); }
.cta-card.highlight { background: var(--color-dark-bg); }

/* --- Footer: Charcoal Blue background --- */
.site-footer { background: var(--color-dark-bg); }

/* --- Animations: disable or simplify --- */
.hero h1, .hero-subtitle, .hero-eyebrow {
  animation: none;
}

/* --- Logo font: switch to Verdana --- */
.site-logo {
  font-family: Verdana, Geneva, sans-serif;
  font-weight: 700;
}
.site-logo span { font-family: Verdana, Geneva, sans-serif; }
```

---

## Google Fonts Removal

In every HTML file's `<head>`, remove this line:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display..." rel="stylesheet">
```

(It's imported via `@import` in `style.css` — you can either remove the `@import` line from the CSS or let the override take priority. The fonts will simply not be used when the override is active.)

---

## HTML Changes Needed

### 1. Favicon
Replace the SVG placeholder favicon in every HTML file's `<head>`:

```html
<!-- Remove this: -->
<link rel="icon" href="data:image/svg+xml,...">

<!-- Replace with: -->
<link rel="icon" href="assets/branding/favicon.png">
```

### 2. Add Override Stylesheet
In every HTML file (`index.html`, `about.html`, `ai-growth-audit.html`, `m2m-framework.html`, `articles.html`, `clients.html`, `articles/article-template.html`), add this line AFTER the main stylesheet:

```html
<link rel="stylesheet" href="css/option-b-override.css">
```

### 3. Brand Assets
Add the Option B brand assets:

| Asset | Placement |
|-------|-----------|
| Logo (monogram + wordmark) | Header — replace text logo |
| Paul's photo | About page — hero section |
| PH brand mark | Footer |

---

## Testing Checklist

After applying the override:

- [ ] Home page loads with Verdana, no Playfair Display
- [ ] Colours match: Rich Black (#040406) text, White (#FFFFFF) background
- [ ] Header is white background, not dark
- [ ] No Google Fonts loading (check Network tab)
- [ ] Coral (#C25D45) is gone — accents are Antique Brass (#806339) or Charcoal Blue (#354054)
- [ ] Mobile navigation works
- [ ] Footer uses Charcoal Blue (#354054) background
- [ ] All 7 pages tested
- [ ] Brand assets visible (logo, photos)

---

## Option B Colour Palette Reference

| Colour Name | Hex | Usage |
|-------------|-----|-------|
| Rich Black | `#040406` | Primary text, logo, CTAs |
| White | `#FFFFFF` | Backgrounds, text on dark |
| Slate Blue | `#59738E` | Accent (optional) |
| Espresso Brown | `#462617` | Accent (optional) |
| Flint Gray | `#9E9D98` | Secondary text, muted |
| Charcoal Blue | `#354054` | Dark section backgrounds |
| Bastille | `#2E2E30` | Near-black variant |
| Antique Brass | `#806339` | Warm accent / highlights |

---

## Notes

- **Brass (#806339) is shared between both systems.** It's the bridge colour. No change needed.
- The override approach means you don't need to touch the original `style.css` at all. Just add one file and one `<link>` per page.
- If you want to switch back to the M2M design, remove the `option-b-override.css` link from each page.
- The M2M design system is more editorial/warm (serif headings, cream background, coral accents). Option B is cleaner/more corporate (sans-serif throughout, black/white/brass, Charcoal Blue dark sections).

---

*Guide prepared by Mr Anderson (Neo) — 5 June 2026*
