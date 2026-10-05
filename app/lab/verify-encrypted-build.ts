/** Authenticate the encrypted envelope and return its original build ZIP. */
export async function verifyEncryptedBuild(
  file: Blob,
  password: string,
  build: { sha256: string; originalFilename: string; originalBytes: number; bytes: number },
  signal?: AbortSignal,
) {
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  if (file.size !== build.bytes) throw new Error("Invalid build size");
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== build.sha256) throw new Error("Invalid build checksum");

  const { ZipReader, BlobReader, BlobWriter, ERR_INVALID_PASSWORD } = await import("@zip.js/zip.js/lib/zip-core-native.js");
  const reader = new ZipReader(new BlobReader(file), {
    useWebWorkers: false, checkSignature: true, checkAuthenticationCode: true,
  });
  try {
    const entries = await reader.getEntries();
    const entry = entries[0];
    if (entries.length !== 1 || entry.directory || !entry.encrypted || entry.zipCrypto
      || entry.extraFieldAES?.strength !== 3 || entry.filename !== build.originalFilename
      || entry.uncompressedSize !== build.originalBytes) {
      throw new Error("Invalid encrypted build");
    }
    // Return plaintext only after the entire entry passes AES authentication.
    const original = await entry.getData(new BlobWriter("application/zip"), {
      password, signal, useWebWorkers: false,
      checkSignature: true, checkAuthenticationCode: true,
    });
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    if (original.size !== build.originalBytes) throw new Error("Invalid original build size");
    return original;
  } catch (error) {
    if (error instanceof Error && error.message === ERR_INVALID_PASSWORD) throw new Error("ACCESS_DENIED");
    throw error;
  } finally {
    await reader.close();
  }
}
