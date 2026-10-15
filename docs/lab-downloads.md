# LAB encrypted downloads

The dedicated `/lab/` page retains all eight bilingual records from commit
`a52e1092993e70daf58749132c5734a54895f3fe`, including the FusionDynamics2D
0.3.5-perbody checkpoint, now accessible under the previous-checkpoint disclosure.
V.020 adds the page; V.021 enables five supplied builds. V.024 updates FusionDynamics2D
to 0.4.1-usability and adds SY_Handwriter 0.3.0 Test 4 as the ninth record and sixth build.
V.055 updates FusionDynamics2D to the delivered 0.5.0-authoring package and records
its new local-validation checkpoint without claiming Resolve host acceptance.
V.062 updates SY_Handwriter to 0.5.0 and adds Nebulosity Resolve 0.5.0 as the
tenth record and seventh build. Existing checkpoints and archives are retained.

## Published builds

| Project | Supplied version |
| --- | --- |
| LAB-01 / FusionDynamics2D | 0.5.0-authoring / zh-TW |
| LAB-02 / Paint Bucket | 0.1.4 / zh-TW |
| LAB-03 / SY Lens Dirt | 0.93 / FullBlend |
| LAB-04 / TraceGraph OFX | 0.2.7 / Win11 x64 GPU EXPERIMENTAL |
| LAB-06 / Resolve Neural Compat | 1.0.0 / x64 |
| LAB-09 / SY_Handwriter | 0.5.0 |
| LAB-10 / Nebulosity Resolve | 0.5.0 / zh-TW / Win64 |

LAB-05, LAB-07 and LAB-08 retain their development records but have no download
button. No placeholder build is published for research or obsolete projects.
The previous encrypted FusionDynamics2D 0.3.5 and 0.4.1 archives are retained;
the current-build button points to 0.5.0. The previous Handwriter Test 4 archive
is also retained; its current-build button now points to 0.5.0.

The 0.5.0 description follows its authoring guide and recorded validation:
338 passing local tests, 80 Lua / Fuse syntax checks and two JavaScript syntax checks.
The original ZIP has 151 files and SHA-256
`d2943fea7a97703b173ec67b842fc6e64a62e16b07ef5391ad2541ad3d36e210`.
Native Mask auto-adaptation and Viewer Overlay / Dock remain incomplete.
Windows installation and Resolve acceptance remain pending; the reported 0.4.0
host tests 1–4 are not acceptance of the 0.4.1 or 0.5.0 changes.
SY_Handwriter follows its 0.5.0 changelog and handoff, dated 2026-10-11.
The package records 62 local checks, per-stroke regions, glyph skeleton fitting
and frame-by-frame Follower baking. Windows / Resolve 21 host acceptance,
including 細明體_HKSCS, remains pending. Overlapping strokes can need manual
correction; source animation changes require regeneration.

Nebulosity follows its 0.5.0 checkpoint and validation report, dated 2026-10-13.
It is an independent implementation. Five test groups, 52 native 1080p frames,
save / reload and actual Viewer-axis dragging were recorded as passing on
synthetic scenes. This does not establish tracking accuracy on real footage or
installation into the user's system plugin directory.

## Protection and verification

GitHub Pages hosts static files. Every published ZIP in `public/lab-builds/`
contains a single AES-256 encrypted entry holding the exact original supplied ZIP.
The original program, directory layout and ZIP bytes are preserved. Since V.033,
users enter their authorized password once on the website and receive the original
ZIP directly. The downloaded ZIP needs no password to extract.

After the visitor enters a password, the page retrieves only encrypted bytes,
checks the ciphertext SHA-256 against `app/lab/builds.json`, confirms the expected
single AES-256 entry, and validates its complete AES authentication code with
zip.js. Only after complete authentication does the page download the **original
unencrypted ZIP**, using its original filename. Its temporary in-memory Blob URL
is revoked after download; decrypted bytes are not published to the repository or
stored in browser storage.
Password inputs clear on submission and closing; cancellation aborts verification.

The password is not embedded in source, configuration, tests, a frontend hash or
hint. The visitor's input is used only in browser memory and is never sent in a
request, URL, storage entry or analytics event. ZIP salts/authentication metadata
are part of the archive format, not a separately published frontend verifier.

Ciphertext file URLs are public: this is **archive encryption**, not server-side
access control. Directly fetching a URL or disabling JavaScript can obtain only
the encrypted archive; it cannot decrypt the protected original ZIP. There is no
private server, account-based authorization, revocation or server rate limiting.
The UI does not claim otherwise. A private authenticated backend would be a
separate feature if access to even ciphertext must be restricted later.

## Updating a build

Prepare the encrypted envelope privately, entering the authorized password only
through private runtime input. Never save it in scripts, shell history, CI output,
Git commits, documentation or public environment variables.
Publish only the encrypted outer ZIP and update its size, original ZIP filename,
original byte length and ciphertext SHA-256 in `app/lab/builds.json`.

Independently verify no-password and wrong-password extraction fails, and that
correct-password extraction reproduces the original ZIP byte for byte. Validate
the original ZIP's CRCs without running installers or binaries. Add the release
to `site-history.json` without replacing earlier entries.

## Checks

`node --test tests/lab-*.test.mjs` covers record/history preservation, correct and
incorrect passwords, plaintext/weak/mixed archives, ciphertext tampering, full
AES authentication, cancellation, byte-exact original ZIP output, and the seven
current archive headers/hashes. Prior six-build browser checks remain historical;
the V.062 checks cover the two newly published packages on desktop and mobile.
Private-password extraction checks run locally; no real password is committed
to tests or CI configuration.

References: [zip.js AES support](https://gildas-lormeau.github.io/zip.js/),
[AES authentication checks](https://gildas-lormeau.github.io/zip.js/api/interfaces/ZipReaderOptions.html),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
