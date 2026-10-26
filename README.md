# M2M Growth, AI & Exit Strategists

Public website for M2M Business Growth, AI & Exit Strategists LLC, a Qatar Financial Centre firm (QFC#05585).

The live site is [https://m2mstrategists.com](https://m2mstrategists.com). The www address redirects there. Canonical and social links use the non-www host.

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

Google Analytics 4, measurement ID `G-8XTQVTNBNF`, loads on every page from `js/ga4.js`.

"Book a Call with Paul" links out to Calendly. The audit payment link and the Client Portal button go to the portal.

## Client portal

The portal at [https://portal.m2mstrategists.com](https://portal.m2mstrategists.com) belongs to another team. Do not change portal links, or portal code, from this repository.

## Local preview

Preview the files Netlify will publish:

```bash
bash scripts/publish-site.sh
python3 -m http.server 8888 -d site
```

Open http://localhost:8888
