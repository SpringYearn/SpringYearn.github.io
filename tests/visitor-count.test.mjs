import assert from "node:assert/strict";
import { test } from "node:test";

let moduleId = 0;
async function withClient(run) {
  const original = { window: globalThis.window, localStorage: globalThis.localStorage, fetch: globalThis.fetch };
  globalThis.window = { location: { origin: "https://springyearn.github.io" } };
  const storage = new Map();
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const { getVisitors } = await import("../app/visitor-count.ts?test=" + ++moduleId);
  try { await run(getVisitors, storage); }
  finally { Object.assign(globalThis, original); }
}
const reply = count => Response.json({ success: true, data: { site_uv: count } }, { headers: { "Set-Bsz-Identity": "signed-anonymous-id" } });

test("one server-backed UV request is shared across concurrent callers and route reuse", () => withClient(async (getVisitors, storage) => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://busuanzi.9420.ltd/api");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.get("x-bsz-referer"), "https://springyearn.github.io/");
    assert.equal(options.credentials, "omit");
    return reply(27);
  };
  assert.deepEqual(await Promise.all([getVisitors(), getVisitors()]), [27, 27]);
  assert.equal(await getVisitors(), 27);
  assert.equal(calls, 1);
  assert.equal(storage.get("sy-busuanzi-identity"), "signed-anonymous-id");
}));

test("a failed first request does not permanently poison visitor statistics", () => withClient(async getVisitors => {
  let calls = 0;
  globalThis.fetch = async () => ++calls === 1 ? new Response("upstream outage", { status: 502 }) : reply(28);
  await assert.rejects(getVisitors(), /unavailable/);
  assert.equal(await getVisitors(), 28);
  assert.equal(calls, 2);
}));

test("invalid counts cannot turn into fabricated totals and remain retryable", () => withClient(async getVisitors => {
  for (const count of [-1, 1.25, "5", null, Number.MAX_SAFE_INTEGER + 1]) {
    globalThis.fetch = async () => reply(count);
    await assert.rejects(getVisitors(), /Invalid visitor count/);
  }
  globalThis.fetch = async () => reply(0);
  assert.equal(await getVisitors(), 0);
}));

test("anonymous identity is reused; unavailable storage does not break the count", () => withClient(async (getVisitors, storage) => {
  storage.set("sy-busuanzi-identity", "existing-signed-id");
  globalThis.fetch = async (_, options) => {
    assert.equal(options.headers.get("Authorization"), "Bearer existing-signed-id");
    throw new TypeError("offline");
  };
  await assert.rejects(getVisitors(), /offline/);
  globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  globalThis.fetch = async (_, options) => { assert.equal(options.headers.has("Authorization"), false); return reply(29); };
  assert.equal(await getVisitors(), 29);
}));
