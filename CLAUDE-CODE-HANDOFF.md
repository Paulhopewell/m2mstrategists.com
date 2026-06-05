## Claude Code — Website CSS v3.1 Handoff

### Where things are

```
website-draft/
├── index.html              ← homepage
├── about.html              ← 2-col layout, now fully styled
├── services.html
├── clients.html            ← testimonial grid, now styled
├── articles.html
├── ai-growth-audit.html    ← value-list, pricing-highlight, form components
├── m2m-framework.html      ← level cards, foundation grid, methodology
├── creative-brief.md       ← project reference
├── OPTION-B-REVERSION-GUIDE.md
├── reference-chen-kitchen-audit.html  ← quality benchmark
└── css/
    ├── style.css            ← v3.1 (1,906 lines, 335 balanced braces)
    └── CHANGELOG-v3.md      ← what changed v2 → v3 → v3.1
```

### What v3.1 contains

The stylesheet now covers everything all 7 HTML pages reference. Before v3.1, 64 CSS class
references had no rules in the stylesheet — the pages rendered with browser defaults.
Those are all fixed.

Design system: Playfair Display + DM Sans + DM Mono, Coral/Brass/Near-Black/Cream palette.
Extended with refinements from the Chen Kitchen AI Audit template (gradient hero, audit
component library, DM Sans 400-700 weights).

There are 28 reusable audit-specific components in the CSS: callouts, drain cards, opp cards,
tier banners, phase blocks, path cards, key figures, matrix, critical path, tool cards,
checklists, glossary terms, CTA blocks, exit rows, team cards.

### Potential next work

1. Apply the audit template design from `reference-chen-kitchen-audit.html` to the
   `ai-growth-audit.html` page content — the CSS components exist, the HTML needs wiring up.

2. Any design QA Rosita flags — the stylesheet is clean and all class names follow the
   same naming conventions (BEM where appropriate, semantic where not).

3. Responsive testing — breakpoints at 768px, columns collapse to single-column.

### Guardrails

- `style.css` is a single source of truth for all pages.
- The Option B reverison guide (`OPTION-B-REVERSION-GUIDE.md`) is standalone and doesn't
  interfere with the current design.
- Do not create additional CSS files — everything lives in `css/style.css`.
- The palette and typography are locked. Coral = #C25D45, Brass = #806339,
  Near-Black = #1A1A1A, Cream = #F9F7F4.
