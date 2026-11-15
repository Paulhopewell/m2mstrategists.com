import { getStore } from "@netlify/blobs";
import { STORE_NAME, handleCountsRequest, readCountsToken } from "../lib/social-clicks.mjs";

// Private weekly read-out. Not linked from the site.
// Requires Authorization: Bearer $SOCIAL_CLICKS_TOKEN.
// The token is a Netlify environment variable. It is not in the repository.

export default async (request) => {
  let store = null;
  try {
    store = getStore({ name: STORE_NAME, consistency: "strong" });
  } catch (err) {
    console.error("social click counts store failed", err && err.name);
  }
  return handleCountsRequest(request, {
    store,
    expectedToken: readCountsToken(),
    log: (message) => console.error(message),
  });
};

export const config = {
  path: ["/social-click-counts", "/social-click-counts/"],
};
