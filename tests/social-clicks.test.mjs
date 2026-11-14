import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  bucketForUserAgent,
  eachUtcDate,
  finishOrGiveUp,
  handleCountsRequest,
  handleShortLink,
  incrementCount,
  isUtcDate,
  linkFromPath,
  parseReportQuery,
  readCountsToken,
  recordVisit,
  utcDate,
} from "../netlify/lib/social-clicks.mjs";

const NOW = new Date("2026-11-14T15:04:00Z");
const LI_TARGET = "/ai-growth-audit.html?utm_source=linkedin&utm_medium=social&utm_campaign=free-audit-nov&utm_content=li";
const X_TARGET = "/ai-growth-audit.html?utm_source=x&utm_medium=social&utm_campaign=free-audit-nov&utm_content=x";

function memoryStore() {
  const map = new Map();
  let seq = 1;
  return {
    map,
    async getWithMetadata(key) {
      const row = map.get(key);
      if (!row) return null;
      return { data: structuredClone(row.data), etag: row.etag, metadata: {} };
    },
    async setJSON(key, value, options = {}) {
      const row = map.get(key);
      if (options.onlyIfNew && row) return { modified: false };
      if (options.onlyIfMatch && (!row || row.etag !== options.onlyIfMatch)) {
        return { modified: false };
      }
      const etag = `"${seq++}"`;
      map.set(key, { data: structuredClone(value), etag });
      return { modified: true, etag };
    },
  };
}

function visit(store, pathname, userAgent, deploy = { context: "production" }) {
  return recordVisit(store, { pathname, userAgent, now: NOW, deploy });
}

test("paths map to li and x, including the trailing slash", () => {
  assert.equal(linkFromPath("/li"), "li");
  assert.equal(linkFromPath("/li/"), "li");
  assert.equal(linkFromPath("/x"), "x");
  assert.equal(linkFromPath("/x/"), "x");
  assert.equal(linkFromPath("/LI"), null);
  assert.equal(linkFromPath("/x/extra"), null);
  assert.equal(linkFromPath("/linkedin"), null);
});

test("link previews count as bots and ordinary browsers count as human", () => {
  const bots = [
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)",
    "Twitterbot/1.0",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Facebot",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Slack-ImgProxy (+https://api.slack.com/robots)",
    "WhatsApp/2.21.16.20 A",
    "TelegramBot (like TwitterBot)",
    "Discordbot/2.0",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 HeadlessChrome/120.0.0.0",
    "ia_archiver",
  ];
  for (const ua of bots) assert.equal(bucketForUserAgent(ua), "bot", ua);

  const humans = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "curl/8.7.1",
    "",
    null,
    undefined,
  ];
  for (const ua of humans) assert.equal(bucketForUserAgent(ua), "human", String(ua));
});

test("the date key is the UTC day, including just after midnight", () => {
  assert.equal(utcDate(NOW), "2026-11-14");
  assert.equal(utcDate(new Date("2026-11-14T23:30:00-05:00")), "2026-11-15");
  assert.equal(isUtcDate("2024-02-29"), true);
  assert.equal(isUtcDate("2026-02-29"), false);
  assert.equal(isUtcDate("2026-11-14T00:00:00Z"), false);
});

test("a visit stores two numbers and nothing about the visitor", async () => {
  const store = memoryStore();
  const ua = "LinkedInBot/1.0 (+http://www.linkedin.com)";
  const result = await visit(store, "/li", ua);
  assert.equal(result.bucket, "bot");
  assert.deepEqual(store.map.get("production/2026-11-14/li").data, { human: 0, bot: 1 });

  await visit(store, "/li", "Mozilla/5.0 (Macintosh) Safari/605.1.15");
  await visit(store, "/x/", "Mozilla/5.0");
  await visit(store, "/li/", "Slackbot 1.0", { context: "deploy-preview" });

  assert.deepEqual(store.map.get("production/2026-11-14/li").data, { human: 1, bot: 1 });
  assert.deepEqual(store.map.get("production/2026-11-14/x").data, { human: 1, bot: 0 });
  assert.deepEqual(store.map.get("deploy-preview/2026-11-14/li").data, { human: 0, bot: 1 });

  const dumped = JSON.stringify([...store.map.entries()]);
  assert.equal(dumped.includes("LinkedIn"), false);
  assert.equal(dumped.includes("Mozilla"), false);
  assert.equal(dumped.includes("Slack"), false);
  assert.equal(dumped.includes("linkedin.com"), false);
});

test("query strings are not part of the path that is counted", async () => {
  const store = memoryStore();
  const request = new Request("https://m2mstrategists.com/x?utm_source=nope", {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  await handleShortLink({
    request,
    deploy: { context: "production" },
    openStore: () => store,
    now: () => NOW,
    log() {},
  });
  assert.deepEqual(store.map.get("production/2026-11-14/x").data, { human: 1, bot: 0 });
});

test("a published deploy with no context label still counts as production", async () => {
  const store = memoryStore();
  await visit(store, "/li", "Mozilla/5.0", { published: true });
  assert.ok(store.map.has("production/2026-11-14/li"));
  await visit(store, "/x", "Mozilla/5.0", { context: "staging" });
  assert.ok(store.map.has("other/2026-11-14/x"));
});

test("two clicks at once both survive", async () => {
  const store = memoryStore();
  await Promise.all([
    visit(store, "/li", "Mozilla/5.0"),
    visit(store, "/li", "Mozilla/5.0"),
  ]);
  assert.deepEqual(store.map.get("production/2026-11-14/li").data, { human: 2, bot: 0 });
});

test("a lost write is retried against the new value", async () => {
  let reads = 0;
  const store = {
    async getWithMetadata() {
      reads += 1;
      if (reads === 1) return null;
      return { data: { human: 1, bot: 0 }, etag: "etag-1", metadata: {} };
    },
    async setJSON(_key, value, options = {}) {
      if (reads === 1) return { modified: false };
      assert.equal(options.onlyIfMatch, "etag-1");
      assert.deepEqual(value, { human: 2, bot: 0 });
      return { modified: true, etag: "etag-2" };
    },
  };
  const next = await incrementCount(store, {
    context: "production",
    date: "2026-11-14",
    link: "li",
    bucket: "human",
  });
  assert.deepEqual(next, { human: 2, bot: 0 });
});

test("a stored count with no etag is still incremented", async () => {
  const map = new Map([
    ["production/2026-11-14/li", { data: { human: 1, bot: 0 } }],
  ]);
  const store = {
    async getWithMetadata(key) {
      const row = map.get(key);
      if (!row) return null;
      return { data: structuredClone(row.data), metadata: {} };
    },
    async setJSON(key, value, options = {}) {
      if (options.onlyIfNew || options.onlyIfMatch) return { modified: false };
      map.set(key, { data: structuredClone(value) });
      return { modified: true };
    },
  };
  const next = await incrementCount(store, {
    context: "production",
    date: "2026-11-14",
    link: "li",
    bucket: "bot",
  });
  assert.deepEqual(next, { human: 1, bot: 1 });
});

test("a broken stored count is not overwritten", async () => {
  let writes = 0;
  const store = {
    async getWithMetadata() {
      return { data: { human: "lots", bot: 1, ua: "secret" }, etag: "e", metadata: {} };
    },
    async setJSON() {
      writes += 1;
      return { modified: true };
    },
  };
  await assert.rejects(() => incrementCount(store, {
    context: "production",
    date: "2026-11-14",
    link: "li",
    bucket: "human",
  }));
  assert.equal(writes, 0);
});

test("the short-link handler returns no response, even when blobs fail", async () => {
  const store = memoryStore();
  const request = new Request("https://m2mstrategists.com/li/", {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  const job = handleShortLink({
    request,
    deploy: { context: "production" },
    openStore: () => store,
    now: () => NOW,
    log() {},
  });
  const result = await job;
  assert.equal(result, undefined);
  assert.equal(result instanceof Response, false);

  const logs = [];
  const failed = handleShortLink({
    request,
    deploy: { context: "production" },
    openStore() {
      throw new Error("blobs down");
    },
    now: () => NOW,
    log(message) {
      logs.push(message);
    },
  });
  await failed;
  assert.deepEqual(logs, ["social short link count failed"]);
});

test("a stuck count is given up so the redirect can proceed", async () => {
  let release;
  const job = new Promise((resolve) => {
    release = resolve;
  });
  const start = Date.now();
  await finishOrGiveUp(job, 40);
  const elapsed = Date.now() - start;
  assert.ok(elapsed >= 30 && elapsed < 500);
  release();
  await job;

  const done = Promise.resolve("saved");
  assert.equal(await finishOrGiveUp(done, 1000), "saved");
});

test("the read-out requires the bearer token and sets no cookie", async () => {
  let reads = 0;
  const store = {
    async getWithMetadata() {
      reads += 1;
      return null;
    },
  };
  const url = "https://m2mstrategists.com/social-click-counts?from=2026-11-08&to=2026-11-14&token=secret-token-value";
  const denied = await handleCountsRequest(new Request(url), {
    store,
    expectedToken: "secret-token-value",
    log() {},
  });
  assert.equal(denied.status, 401);
  assert.equal(reads, 0);
  assert.deepEqual(denied.headers.getSetCookie(), []);
  assert.equal(denied.headers.get("set-cookie"), null);
  assert.equal(denied.headers.get("location"), null);
  const deniedBody = await denied.json();
  assert.deepEqual(deniedBody, { error: "unauthorized" });
  assert.equal(JSON.stringify(deniedBody).includes("secret-token-value"), false);

  const wrong = await handleCountsRequest(new Request(url, {
    headers: { authorization: "Bearer wrong-token-value" },
  }), {
    store,
    expectedToken: "secret-token-value",
    log() {},
  });
  assert.equal(wrong.status, 401);
  assert.equal(reads, 0);

  const unset = [];
  const missing = await handleCountsRequest(new Request(url), {
    store,
    expectedToken: "",
    log(message) {
      unset.push(message);
    },
  });
  assert.equal(missing.status, 401);
  assert.deepEqual(unset, ["SOCIAL_CLICKS_TOKEN is not set"]);
});

test("a valid token returns daily human and bot totals", async () => {
  const store = memoryStore();
  await visit(store, "/li", "Mozilla/5.0");
  await visit(store, "/li", "LinkedInBot/1.0");
  await visit(store, "/x", "Twitterbot/1.0");
  await visit(store, "/li", "Mozilla/5.0", { context: "deploy-preview" });

  const response = await handleCountsRequest(new Request(
    "https://preview.example/social-click-counts?from=2026-11-13&to=2026-11-14",
    { headers: { authorization: "bearer secret-token-value" } },
  ), {
    store,
    expectedToken: "secret-token-value",
    log() {},
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex");
  assert.deepEqual(response.headers.getSetCookie(), []);
  assert.equal(response.headers.get("location"), null);

  const body = await response.json();
  assert.equal(body.timezone, "UTC");
  assert.equal(body.context, "production");
  assert.deepEqual(body.links.li, {
    human: 1,
    bot: 1,
    days: [
      { date: "2026-11-13", human: 0, bot: 0 },
      { date: "2026-11-14", human: 1, bot: 1 },
    ],
  });
  assert.deepEqual(body.links.x.days[1], { date: "2026-11-14", human: 0, bot: 1 });
  assert.equal(JSON.stringify(body).includes("LinkedIn"), false);
  assert.equal(JSON.stringify(body).includes("Twitter"), false);

  const preview = await handleCountsRequest(new Request(
    "https://preview.example/social-click-counts?from=2026-11-14&to=2026-11-14&context=deploy-preview",
    { headers: { authorization: "Bearer secret-token-value" } },
  ), {
    store,
    expectedToken: "secret-token-value",
    log() {},
  });
  const previewBody = await preview.json();
  assert.equal(previewBody.links.li.human, 1);
  assert.equal(previewBody.links.li.bot, 0);
  assert.equal(previewBody.links.x.human, 0);
});

test("the read-out rejects bad ranges, bad methods, and a down store", async () => {
  const store = memoryStore();
  const headers = { authorization: "Bearer secret-token-value" };
  const opts = { store, expectedToken: "secret-token-value", log() {} };

  const badDate = await handleCountsRequest(new Request(
    "https://m2mstrategists.com/social-click-counts?from=2026-02-29&to=2026-02-29",
    { headers },
  ), opts);
  assert.equal(badDate.status, 400);

  const backwards = await handleCountsRequest(new Request(
    "https://m2mstrategists.com/social-click-counts?from=2026-11-14&to=2026-11-01",
    { headers },
  ), opts);
  assert.equal(backwards.status, 400);

  const tooLong = await handleCountsRequest(new Request(
    "https://m2mstrategists.com/social-click-counts?from=2026-01-01&to=2026-04-04",
    { headers },
  ), opts);
  assert.equal(tooLong.status, 400);
  assert.equal(eachUtcDate("2026-01-01", "2026-04-03").length, 93);
  assert.deepEqual(parseReportQuery(new URLSearchParams("from=2026-01-01&to=2026-04-03")).error, undefined);

  const posted = await handleCountsRequest(new Request(
    "https://m2mstrategists.com/social-click-counts?from=2026-11-14&to=2026-11-14",
    { method: "POST", headers },
  ), opts);
  assert.equal(posted.status, 405);
  assert.equal(posted.headers.get("allow"), "GET");

  const down = await handleCountsRequest(new Request(
    "https://m2mstrategists.com/social-click-counts?from=2026-11-14&to=2026-11-14",
    { headers },
  ), {
    store: {
      async getWithMetadata() {
        throw new Error("blobs down");
      },
    },
    expectedToken: "secret-token-value",
    log() {},
  });
  assert.equal(down.status, 500);
  assert.deepEqual(await down.json(), { error: "counts unavailable" });
});

test("the token helper reads the env var and does not invent one", () => {
  const previous = process.env.SOCIAL_CLICKS_TOKEN;
  delete process.env.SOCIAL_CLICKS_TOKEN;
  assert.equal(readCountsToken(), "");
  process.env.SOCIAL_CLICKS_TOKEN = "from-the-shell";
  assert.equal(readCountsToken(), "from-the-shell");
  if (previous === undefined) delete process.env.SOCIAL_CLICKS_TOKEN;
  else process.env.SOCIAL_CLICKS_TOKEN = previous;
});

test("destinations stay only in the redirect rules", () => {
  const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
  const edge = readFileSync(new URL("../netlify/edge-functions/social-short-links.js", import.meta.url), "utf8");
  const counts = readFileSync(new URL("../netlify/edge-functions/social-click-counts.js", import.meta.url), "utf8");
  const lib = readFileSync(new URL("../netlify/lib/social-clicks.mjs", import.meta.url), "utf8");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const form = readFileSync(new URL("../netlify/functions/submission-created.js", import.meta.url), "utf8");

  for (const from of ["/li", "/li/", "/x", "/x/"]) {
    const needle = `from = "${from}"`;
    assert.equal(toml.includes(needle), true, needle);
  }
  assert.equal(toml.includes(`to = "${LI_TARGET}"`), true);
  assert.equal(toml.includes(`to = "${X_TARGET}"`), true);
  assert.equal(toml.split("status = 302").length - 1 >= 5, true);

  for (const source of [edge, counts, lib]) {
    assert.equal(source.includes("utm_source"), false);
    assert.equal(source.includes("ai-growth-audit"), false);
    assert.equal(source.includes("context.ip"), false);
    assert.equal(source.includes("context.geo"), false);
    assert.equal(source.includes("cookies"), false);
    assert.equal(source.includes("set-cookie"), false);
    assert.equal(source.includes("Set-Cookie"), false);
  }
  assert.match(edge, /onError:\s*"bypass"/);
  assert.match(edge, /"\/li"/);
  assert.match(edge, /"\/li\/"/);
  assert.match(edge, /"\/x"/);
  assert.match(edge, /"\/x\/"/);
  assert.equal(edge.includes('cache:'), false);
  assert.equal(pkg.type, undefined);
  assert.match(form, /exports\.handler/);
});
