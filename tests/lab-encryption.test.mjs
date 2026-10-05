import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ZipWriter, Uint8ArrayReader, Uint8ArrayWriter, ZipReader, BlobReader } from "@zip.js/zip.js/lib/zip-core-native.js";
import { verifyEncryptedBuild } from "../app/lab/verify-encrypted-build.ts";

const password = "fixture-only-access-key";
const toolContent = new TextEncoder().encode("Original tool content.");
const originalWriter = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false, level: 0 });
await originalWriter.add("tool.txt", new Uint8ArrayReader(toolContent));
const content = await originalWriter.close();
const name = "fixture-build.zip";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const manifest = bytes => ({ sha256: digest(bytes), bytes: bytes.length, originalFilename: name, originalBytes: content.length });
async function archive(options = { password, encryptionStrength: 3 }, extra = false) {
  const writer = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false, level: 0 });
  await writer.add(name, new Uint8ArrayReader(content), options);
  if (extra) await writer.add("unprotected.txt", new Uint8ArrayReader(content));
  return writer.close();
}

test("correct password returns the exact original ZIP and its contents extract without a password", async () => {
  const bytes = await archive();
  const original = await verifyEncryptedBuild(new Blob([bytes]), password, manifest(bytes));
  assert.equal(original.type, "application/zip");
  assert.deepEqual(new Uint8Array(await original.arrayBuffer()), content);
  const reader = new ZipReader(new BlobReader(original), { useWebWorkers: false, checkSignature: true });
  try {
    const entries = await reader.getEntries();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].encrypted, false);
    assert.deepEqual(await entries[0].getData(new Uint8ArrayWriter()), toolContent);
  } finally { await reader.close(); }
  await assert.rejects(verifyEncryptedBuild(new Blob([bytes]), "wrong-access", manifest(bytes)), /ACCESS_DENIED/);
});

test("plaintext, weak encryption and mixed-entry archives cannot trigger download", async () => {
  for (const options of [{}, { password, zipCrypto: true }, { password, encryptionStrength: 1 }]) {
    const bytes = await archive(options);
    await assert.rejects(verifyEncryptedBuild(new Blob([bytes]), password, manifest(bytes)), /Invalid encrypted build/);
  }
  const mixed = await archive({ password, encryptionStrength: 3 }, true);
  await assert.rejects(verifyEncryptedBuild(new Blob([mixed]), password, manifest(mixed)), /Invalid encrypted build/);
});

test("ciphertext tampering fails both manifest integrity and full AES authentication", async () => {
  const bytes = await archive();
  const expected = manifest(bytes);
  const changed = new Uint8Array(bytes);
  const view = new DataView(changed.buffer);
  const dataStart = 30 + view.getUint16(26, true) + view.getUint16(28, true);
  changed[dataStart + 20] ^= 1;
  await assert.rejects(verifyEncryptedBuild(new Blob([changed]), password, expected), /Invalid build checksum/);
  await assert.rejects(verifyEncryptedBuild(new Blob([changed]), password, manifest(changed)));
});

test("closing/cancelling verification cannot approve a download", async () => {
  const bytes = await archive();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(verifyEncryptedBuild(new Blob([bytes]), password, manifest(bytes), controller.signal), { name: "AbortError" });
});

test("six current supplied builds each contain one AES-256 payload", async () => {
  const builds = JSON.parse(readFileSync(new URL("../app/lab/builds.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(builds).sort(), ["LAB-01", "LAB-02", "LAB-03", "LAB-04", "LAB-06", "LAB-09"]);
  assert.equal(builds['LAB-01'].originalFilename, 'FusionDynamics2D_v0.4.1-usability_zh-TW.zip');
  assert.equal(builds['LAB-09'].originalFilename, 'SY_Handwriter_0.3.0_Test4.zip');
  for (const build of Object.values(builds)) {
    const bytes = readFileSync(new URL("../public/lab-builds/" + build.filename, import.meta.url));
    assert.equal(bytes.length, build.bytes);
    assert.equal(digest(bytes), build.sha256);
    const reader = new ZipReader(new Uint8ArrayReader(bytes), { useWebWorkers: false });
    try {
      const entries = await reader.getEntries();
      assert.equal(entries.length, 1);
      assert.equal(entries[0].filename, build.originalFilename);
      assert.equal(entries[0].encrypted, true);
      assert.equal(entries[0].zipCrypto, false);
      assert.equal(entries[0].extraFieldAES.strength, 3);
    } finally { await reader.close(); }
  }
});
