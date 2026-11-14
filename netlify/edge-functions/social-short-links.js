import { getStore } from "@netlify/blobs";
import { STORE_NAME, finishOrGiveUp, handleShortLink } from "../lib/social-clicks.mjs";

// Counts a visit, then gets out of the way.
//
// The 302 and the Location header come from the SOCIAL-SHORT-LINKS rules in
// netlify.toml. Those four `to` lines are the only copy of the destination
// URLs. This file must not return a Response, and it must not grow a cache
// setting: the function has to run on every request, before the cached 302.
//
// onError is bypass. If this function throws, Netlify continues to those
// same redirect rules. A blob error is caught inside handleShortLink and
// does not change the redirect. The wait is capped so a stuck store cannot
// hold the visitor.

const COUNT_BUDGET_MS = 1500;

export default async (request, context) => {
  const job = handleShortLink({
    request,
    deploy: context && context.deploy,
    openStore: () => getStore({ name: STORE_NAME, consistency: "strong" }),
  });
  await finishOrGiveUp(job, COUNT_BUDGET_MS);
};

export const config = {
  path: ["/li", "/li/", "/x", "/x/"],
  onError: "bypass",
};
