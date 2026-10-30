# M2M Growth, AI & Exit Strategists

Public website for M2M Business Growth, AI & Exit Strategists LLC, a Qatar Financial Centre firm (QFC#05585).

The live site is [https://m2mstrategists.com](https://m2mstrategists.com). The www address redirects there. Canonical and social links use the non-www host.

## Switching off the free audit offer

From 1 October to 30 November 2026 the M2M Growth, AI & Exit Audit is free of charge. The usual fee is £1,495. Signing up takes no payment. The website does not turn this off by itself. On 1 December 2026, switch it off by hand.

The offer is grouped so it can be removed together. Two markers are used.

1. `FREE-OFFER-START` and `FREE-OFFER-END`. Everything between these comments is the offer: the coral banner, the struck-through £1,495, the word FREE, the seal that reads FREE UNTIL 30 NOV, and the free booking sentences. Delete those blocks, including the comment lines.
2. `RESTORE-ON-1-DEC`. These comments hold the previous wording, including the £1495 price and the money-back guarantee. Remove the comment marks so that wording shows again. Leave the wording itself as it was.

Do that in each of these files:

- `index.html`
- `ai-growth-audit.html`
- `m2m-framework.html`
- `clients.html`
- `contact.html`
- `legal.html`
- `articles/article-template.html` (this template is not published; it carries the same banner so a new article does not bring the offer back by accident)

Then:

3. On each of those pages, change `<body class="has-free-offer">` back to `<body>`.
4. In `css/style.css`, delete the block that starts with `FREE OFFER — remove this entire block on 1 December 2026` and ends at `end of FREE OFFER block`. That removes the banner layout, the struck-through price and the FREE styling. Leave the cookie-consent rules that follow it. No second stylesheet was added.
5. The pages load `css/style.css?v=69`. Change `69` to the next number on every page in the list above, including the article template. Use the same number on every page, or returning visitors may keep the old stylesheet. The cookie-banner rules sit below the free-offer block. Leave them in place. They are not part of this offer.
6. On `legal.html`, move the "Last updated" date on when the terms change back. The free-offer paragraph is draft wording. Rosita and QFC compliance still need to review it before it is treated as final.
7. In this README, the booking sentence can go back to: "Book a Call with Paul" links out to Calendly. The audit payment link and the Client Portal button go to the portal.

Nothing new was added for Netlify to copy. `scripts/publish-site.sh` already publishes these pages and `css/style.css`. The article template stays unpublished. No image was replaced. The round badge still has the words BOOK YOUR AUDIT NOW baked into the picture. The alt text describes that picture. A new picture is only needed if the badge itself should say free.

What comes back when the old wording is restored: the £1495 buttons, the money-back guarantee on the home page and the audit page, the seal that reads MONEY BACK GUARANTEE · 14 DAYS, the old booking sentences, and the legal paragraph about the fee and the guarantee.

The audit page title stays as it is. It does not say free or give an end date. The search description, og:description and twitter:description say the audit is free until 30 November 2026. On 1 December 2026, restore the original sentence from the HTML comment beside those three tags, so an old offer line cannot linger in Google or in a link preview.

The audit page structured data is an offer at price 0 GBP, with priceValidUntil 2026-11-30, while this offer runs. On 1 December 2026, set that price back to 1495 GBP and remove priceValidUntil. The HTML comment beside the script says the same.

The free-offer button on the audit page goes to https://portal.m2mstrategists.com/growth-ai-exit/signup. The 1 December restore comment on that page still points at the checkout link. Other portal links are unchanged. The portal team owns the sign-up page.

After the edits, search the repository for `FREE-OFFER` and for `has-free-offer`. Both searches should come back empty.

## Hosting

Netlify deploys the `main` branch. `netlify.toml` does not publish the repository root. The build runs `scripts/publish-site.sh`, which copies the public pages and assets into `site/`, and Netlify publishes that folder.

Internal notes, CSS changelogs and `articles/article-template.html` stay in the repository and are not uploaded as website files. The form function stays in `netlify/functions`, outside `site/`, and Netlify still deploys it as a function.

`main` is the live site. Do not put unfinished work there.

## Pages

- `index.html`, home
- `ai-growth-audit.html`, the M2M Growth, AI & Exit Audit
- `m2m-framework.html`, the Miner to Millionaire (M2M) Framework
- `clients.html`, client stories (representative examples)
- `contact.html`, contact details and the contact form
- `legal.html`, privacy notice and terms of use

`articles.html` is parked. Netlify redirects `/articles.html` to the home page until there are real articles. The article template is not published.

## Forms

Three Netlify Forms post from the pages:

- `contact`, on the contact page (name, company, email, optional phone, optional message)
- `keep-in-touch`, on the framework page (name and email)
- `book-enquiry`, on the framework page (email)

Netlify Forms stores each submission and triggers `netlify/functions/submission-created.js`. That function emails the team at team@m2mstrategists.com, sends a confirmation to the sender through Resend, and creates or updates the contact in HubSpot, including which form it came from. It expects `RESEND_API_KEY` and `HUBSPOT_TOKEN` in the Netlify environment.

## Analytics and booking

Google Analytics 4, measurement ID `G-8XTQVTNBNF`, loads on every page from `js/ga4.js`. `js/consent.js` loads first and sets Google Consent Mode to denied. Analytics cookies are written only after Accept. Decline, or leaving the banner up, stores no analytics cookies, and those visits are not counted in GA4. Cookie settings in the footer clears the stored choice and shows the banner again. Ad storage stays denied.

"Book a Call with Paul" links out to Calendly. The audit sign-up link and the Client Portal button go to the portal. During the free offer the website says signing up takes no payment. The portal's own pages are separate; this repository does not change them. See "Switching off the free audit offer" above.

## Client portal

The portal at [https://portal.m2mstrategists.com](https://portal.m2mstrategists.com) belongs to another team. Do not change portal links, or portal code, from this repository.

## Local preview

Preview the files Netlify will publish:

```bash
bash scripts/publish-site.sh
python3 -m http.server 8888 -d site
```

Open http://localhost:8888
