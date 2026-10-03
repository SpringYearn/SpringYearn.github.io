const endpoint = "https://busuanzi.9420.ltd/api";
const identityKey = "sy-busuanzi-identity";
let visitorRequest: Promise<number> | undefined;

// Successful requests are shared across routes and Strict Mode mounts. Failures
// are evicted so a transient outage can be retried. Counts come from the server.
export function getVisitors(): Promise<number> {
  if (visitorRequest) return visitorRequest;
  visitorRequest = (async () => {
    const headers = new Headers({ "x-bsz-referer": window.location.origin + "/" });
    try {
      const identity = localStorage.getItem(identityKey);
      if (identity && /^[A-Za-z0-9._-]{1,4096}$/.test(identity)) headers.set("Authorization", "Bearer " + identity);
    } catch { /* Storage may be disabled; the service still deduplicates IP / UA. */ }
    const response = await fetch(endpoint, {
      method: "POST", headers, credentials: "omit", referrerPolicy: "origin",
      cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Visitor count unavailable");
    const result = await response.json();
    const count = result?.data?.site_uv;
    if (result?.success !== true || typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
      throw new Error("Invalid visitor count");
    }
    const identity = response.headers.get("Set-Bsz-Identity");
    if (identity && /^[A-Za-z0-9._-]{1,4096}$/.test(identity)) {
      try { localStorage.setItem(identityKey, identity); } catch { /* Optional anonymous visitor identity only. */ }
    }
    return count;
  })().catch(error => { visitorRequest = undefined; throw error; });
  return visitorRequest;
}
