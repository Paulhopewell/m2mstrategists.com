# M2M Growth, AI & Exit Strategists

Public website for M2M Business Growth, AI & Exit Strategists LLC, a Qatar Financial Centre firm (QFC#05585).

The live site is [https://m2mstrategists.com](https://m2mstrategists.com). The www address redirects there. Canonical and social links use the non-www host.

## The paid audit

From 1 October to 30 November 2026 the M2M Growth, AI & Exit Audit was free of charge. From 1 December 2026 the fee is £1,495 again, with the money-back guarantee. We'll email you an invoice for £1,495 payable by bank transfer. The audit booking button says "Request your Audit here" and goes to the contact page, which was already linked from the audit page. That destination is temporary, pending the portal paid path. The Client Portal button still goes to the portal login. Other portal links are unchanged.

The short links in the `SOCIAL-SHORT-LINKS` block of `netlify.toml` stay. `/li` and `/x` are permanent short links for every LinkedIn and X post, and they are never removed. They 302 to the homepage:

- `/li` and `/li/` to `/?utm_source=linkedin&utm_medium=social&utm_campaign=social-always-on&utm_content=li`
- `/x` and `/x/` to `/?utm_source=x&utm_medium=social&utm_campaign=social-always-on&utm_content=x`

Leave the status at 302. The click counter does not hold these addresses. Leave `netlify/edge-functions/social-short-links.js` as it is.

Nothing new was added for Netlify to copy. `scripts/publish-site.sh` already publishes these pages and `css/style.css`. The article template stays unpublished. No image was replaced. The round badge still has the words BOOK YOUR AUDIT NOW baked into the picture. The alt text describes that picture.

## Hosting

Netlify deploys the `main` branch. `netlify.toml` does not publish the repository root. The build runs `scripts/publish-site.sh`, which copies the public pages and assets into `site/`, and Netlify publishes that folder.

Redirect rules live in `netlify.toml`, which Netlify reads from the repository root. They are not copied into `site/`. The parked articles page is redirected that way. So are the permanent short links `/li` and `/x` (also with a trailing slash), used in every LinkedIn and X post. They stay. They 302 to the homepage with the always-on campaign tags. The four `to` lines in the `SOCIAL-SHORT-LINKS` block are the only copy of those destination URLs. An edge function counts the visit and then lets those rules send the 302. See "Counting visits to /li and /x".

Internal notes, CSS changelogs and `articles/article-template.html` stay in the repository and are not uploaded as website files. The form function stays in `netlify/functions`, outside `site/`, and Netlify still deploys it as a function. The short-link counter and the counts read-out are edge functions in `netlify/edge-functions`, also outside `site/`.

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

Google Analytics 4, measurement ID `G-8XTQVTNBNF`, loads on every page from `js/ga4.js`. `js/consent.js` loads first and sets Google Consent Mode to denied. Analytics cookies are written only after Accept. Decline, or leaving the banner up, stores no analytics cookies, and those visits are not counted in GA4. Cookies in the footer clears the stored choice and shows the banner again. Ad storage stays denied.

`js/utm.js` loads on every page, including the article template. When a visit arrives with `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, or `utm_term`, the script keeps that first set for the browser tab in `sessionStorage`. It adds those parameters to every Calendly link and to portal sign-up and checkout links. It does not set a cookie, so the consent banner does not gate it. It does not change a link's path. Parameters already on a link, including GA4's `_gl` linker parameter, stay as they are. A visit with no UTM parameters leaves those hrefs unchanged. The Client Portal login link is not one of the decorated links.

"Book a Call with Paul" links out to Calendly. The audit booking button goes to the contact page. The Client Portal button goes to the portal login. The portal's own pages are separate; this repository does not change them.

## Counting visits to /li and /x

GA4 does not see a visitor who leaves the cookie banner up, or who clicks Decline. The short links are counted on the server, before the page loads, so those visits are still in the weekly total. The count is a daily number. It does not use a cookie. It does not store an IP address, a browser name, or the page someone came from.

What a visitor gets is unchanged. `/li`, `/li/`, `/x` and `/x/` still answer with a 302 to the addresses in the `SOCIAL-SHORT-LINKS` block of `netlify.toml`. Those four lines are the only place to repoint the links.

Each visit is filed as `human` or `bot`. Link previews from LinkedIn, X, Facebook, Slack and other crawlers that fetch a URL when a post is published are filed as `bot`. The check uses the browser string and then throws that string away. A normal browser is `human`.

The totals live in Netlify Blobs, in a store named `social-short-links`. One entry is a deploy context, a UTC date, and `li` or `x`, holding the two numbers. A deploy preview writes under `deploy-preview`, so a test click on a preview does not change the live weekly totals. If the counter cannot save a visit, the 302 still happens.

### Reading the weekly totals

The read-out is `GET /social-click-counts`. It is not linked from the website. It asks for a secret that lives only in Netlify.

Set this environment variable on the Netlify project `m2mstrategists`. Do not commit the value, and do not put it in the URL.

1. In Netlify, open the project, then Project configuration, then Environment variables, then Add a variable.
2. Key: `SOCIAL_CLICKS_TOKEN`
3. Value: a long random string. On your own computer, `openssl rand -hex 32` prints one. Paste it into Netlify only.
4. Scopes: include Functions. Edge Functions read variables from that scope. Include Production, so the live site can be read. Include Deploy Previews as well if you want to read counts on a preview URL.
5. Save, then redeploy. Netlify picks up a new variable on the next deploy. An open preview does not see the variable until that preview is deployed again.

For a UTC date range, up to 93 days:

```bash
curl -sS \
  -H "Authorization: Bearer $SOCIAL_CLICKS_TOKEN" \
  "https://m2mstrategists.com/social-click-counts?from=2026-11-08&to=2026-11-14"
```

Set `SOCIAL_CLICKS_TOKEN` in the shell first. A missing or wrong token gets `unauthorized`, and the response does not say which of the two it was. Netlify's function log gets a line when the variable is unset.

The JSON has `links.li` and `links.x`. Each has `human` and `bot` totals, plus a `days` list. A day with no visits is zeroes. The default context is `production`.

To read a deploy preview, call the preview host and add `&context=deploy-preview`. The other allowed values are `branch-deploy`, `dev` and `other`. This path does not redirect to the audit page.

The static preview (`python3 -m http.server`) does not run the counter. `npm test` runs the checks for the count, the bot split, the 302 staying with the redirect rules, and the token. `netlify dev` does run it. For that, put `SOCIAL_CLICKS_TOKEN` in a `.env` file in the project root. That file is gitignored. Local clicks are stored under the `dev` context, so add `&context=dev` when reading them.

## Client portal

The portal at [https://portal.m2mstrategists.com](https://portal.m2mstrategists.com) belongs to another team. Do not change portal links, or portal code, from this repository.

## Local preview

Preview the files Netlify will publish:

```bash
bash scripts/publish-site.sh
python3 -m http.server 8888 -d site
```

Open http://localhost:8888
