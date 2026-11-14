// Daily totals for the permanent /li and /x short links.
//
// The destination URLs are not here. They live only in the SOCIAL-SHORT-LINKS
// block in netlify.toml. This module counts, then the redirect rules respond.
//
// A visit is stored as two numbers, human and bot, under a key of deploy
// context, UTC date, and link. The user agent is read only to choose the
// bucket. It is not written, and neither is the IP address, the referrer,
// or any other request field.

export const STORE_NAME = "social-short-links";

export const LINKS = ["li", "x"];

// production is the weekly report. The others keep preview and local
// clicks out of that report. "other" is the fallback for an unexpected label.
export const READ_CONTEXTS = ["production", "deploy-preview", "branch-deploy", "dev", "other"];

const WRITE_CONTEXTS = ["production", "deploy-preview", "branch-deploy", "dev"];

const MAX_DAYS = 93;
const WRITE_ATTEMPTS = 5;

// Link-preview crawlers and other obvious bots. Matched against the
// User-Agent header, which is then discarded. "bot" as a suffix covers
// LinkedInBot, Twitterbot, Googlebot and the rest of that family.
const BOT_UA = /facebookexternalhit|facebot|slack-imgproxy|slackbot|whatsapp\/|embedly|iframely|quora link preview|skypeuripreview|microsoftpreview|meta-externalagent|ia_archiver|headless|crawler|spider|slurp|bot\b/i;

export function linkFromPath(pathname) {
  if (pathname === "/li" || pathname === "/li/") return "li";
  if (pathname === "/x" || pathname === "/x/") return "x";
  return null;
}

export function bucketForUserAgent(userAgent) {
  if (typeof userAgent !== "string" || userAgent.trim() === "") return "human";
  return BOT_UA.test(userAgent) ? "bot" : "human";
}

export function utcDate(now) {
  return now.toISOString().slice(0, 10);
}

export function normaliseWriteContext(deploy) {
  const value = deploy && deploy.context;
  if (typeof value === "string" && WRITE_CONTEXTS.includes(value)) return value;
  if (deploy && deploy.published === true) return "production";
  return "other";
}

export function countKey(context, date, link) {
  return `${context}/${date}/${link}`;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
}

export function countsFromStored(data) {
  if (typeof data !== "object" || data == null || Array.isArray(data)) {
    throw new Error("stored count is not an object");
  }
  if (!isCount(data.human) || !isCount(data.bot)) {
    throw new Error("stored count is not two whole numbers");
  }
  return { human: data.human, bot: data.bot };
}

export async function incrementCount(store, { context, date, link, bucket }) {
  if (!WRITE_CONTEXTS.includes(context) && context !== "other") {
    throw new Error("unexpected count context");
  }
  if (!LINKS.includes(link)) throw new Error("unexpected link");
  if (bucket !== "human" && bucket !== "bot") throw new Error("unexpected bucket");

  const key = countKey(context, date, link);
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt++) {
    try {
      const entry = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
      const current = entry == null ? { human: 0, bot: 0 } : countsFromStored(entry.data);
      const next = {
        human: current.human + (bucket === "human" ? 1 : 0),
        bot: current.bot + (bucket === "bot" ? 1 : 0),
      };
      // onlyIfNew when the key is absent, onlyIfMatch when we have an etag.
      // A store that returns the value without an etag (the local blobs
      // sandbox does this) cannot do a conditional update, so the write is
      // unconditional. Two clicks at the same moment can then under-count.
      const options = entry == null
        ? { onlyIfNew: true }
        : entry.etag
          ? { onlyIfMatch: entry.etag }
          : {};
      const result = await store.setJSON(key, next, options);
      if (result && result.modified) return next;
    } catch (err) {
      if (err && typeof err.message === "string" && err.message.startsWith("stored count")) throw err;
      if (attempt === WRITE_ATTEMPTS - 1) throw err;
    }
  }
  throw new Error("count not saved");
}

export async function recordVisit(store, { pathname, userAgent, now, deploy }) {
  const link = linkFromPath(pathname);
  if (!link) return { counted: false };
  const context = normaliseWriteContext(deploy);
  const date = utcDate(now);
  const bucket = bucketForUserAgent(userAgent);
  const counts = await incrementCount(store, { context, date, link, bucket });
  return { counted: true, context, date, link, bucket, counts };
}

export function isUtcDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function eachUtcDate(from, to) {
  const dates = [];
  let cursor = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 86400000;
  }
  return dates;
}

export function parseReportQuery(searchParams) {
  const context = searchParams.get("context") || "production";
  if (!READ_CONTEXTS.includes(context)) {
    return {
      error: "context must be production, deploy-preview, branch-deploy, dev, or other",
    };
  }
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!isUtcDate(from) || !isUtcDate(to)) {
    return { error: "from and to must be UTC dates in the form YYYY-MM-DD" };
  }
  if (from > to) return { error: "from must be on or before to" };
  const days = eachUtcDate(from, to).length;
  if (days > MAX_DAYS) return { error: "date range must be 93 days or fewer" };
  return { from, to, context };
}

export async function readRange(store, { context, from, to }) {
  const dates = eachUtcDate(from, to);
  const links = {};
  for (const link of LINKS) {
    const days = [];
    for (const date of dates) {
      const entry = await store.getWithMetadata(countKey(context, date, link), {
        type: "json",
        consistency: "strong",
      });
      const counts = entry == null ? { human: 0, bot: 0 } : countsFromStored(entry.data);
      days.push({ date, human: counts.human, bot: counts.bot });
    }
    links[link] = {
      human: days.reduce((sum, day) => sum + day.human, 0),
      bot: days.reduce((sum, day) => sum + day.bot, 0),
      days,
    };
  }
  return { from, to, timezone: "UTC", context, links };
}

export function bearerToken(headerValue) {
  if (typeof headerValue !== "string") return null;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(headerValue);
  return match ? match[1] : null;
}

export function tokensMatch(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  if (provided.length === 0 || expected.length === 0) return false;
  const actual = new TextEncoder().encode(provided);
  const wanted = new TextEncoder().encode(expected);
  if (actual.length !== wanted.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) mismatch |= actual[i] ^ wanted[i];
  return mismatch === 0;
}

function jsonResponse(body, status, extraHeaders) {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "netlify-cdn-cache-control": "no-store",
    "x-robots-tag": "noindex",
  });
  if (extraHeaders) {
    for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  }
  return new Response(JSON.stringify(body, null, 2), { status, headers });
}

export async function handleCountsRequest(request, { store, expectedToken, log }) {
  if (request.method !== "GET") {
    return jsonResponse({ error: "method not allowed" }, 405, { allow: "GET" });
  }
  const provided = bearerToken(request.headers.get("authorization"));
  if (!expectedToken || !tokensMatch(provided, expectedToken)) {
    if (!expectedToken && typeof log === "function") {
      log("SOCIAL_CLICKS_TOKEN is not set");
    }
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const url = new URL(request.url);
  // A token in the query string is ignored. It would end up in access logs.
  const parsed = parseReportQuery(url.searchParams);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);
  try {
    const report = await readRange(store, parsed);
    return jsonResponse(report, 200);
  } catch (err) {
    if (typeof log === "function") log("social click counts read failed");
    return jsonResponse({ error: "counts unavailable" }, 500);
  }
}

// Starts the count and swallows storage errors. The caller must not turn
// the result into the HTTP response. The redirect rules do that.
export function handleShortLink({ request, deploy, openStore, now, log }) {
  const writeLog = typeof log === "function" ? log : (message, name, detail) => {
    console.error(message, name || "", detail || "");
  };
  return (async () => {
    try {
      const store = await openStore();
      const url = new URL(request.url);
      await recordVisit(store, {
        pathname: url.pathname,
        userAgent: request.headers.get("user-agent"),
        now: typeof now === "function" ? now() : new Date(),
        deploy,
      });
    } catch (err) {
      const detail = err && typeof err.message === "string" ? err.message.slice(0, 200) : "";
      writeLog("social short link count failed", err && err.name, detail);
    }
  })();
}

// Wait for the count, but not forever. Returning before the blob write
// finishes cancels it: the dev server aborts the request once the 302 is
// sent. The cap keeps a stuck store from holding the visitor.
export function finishOrGiveUp(job, ms) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  return Promise.race([job, timeout]).finally(() => clearTimeout(timer));
}

export function readCountsToken() {
  if (typeof Netlify !== "undefined" && Netlify.env && typeof Netlify.env.get === "function") {
    const value = Netlify.env.get("SOCIAL_CLICKS_TOKEN");
    if (typeof value === "string" && value !== "") return value;
  }
  if (typeof process !== "undefined" && process.env && typeof process.env.SOCIAL_CLICKS_TOKEN === "string") {
    return process.env.SOCIAL_CLICKS_TOKEN;
  }
  return "";
}
