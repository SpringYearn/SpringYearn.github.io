# LAB encrypted downloads

The dedicated `/lab/` page retains all eight bilingual records from commit
`a52e1092993e70daf58749132c5734a54895f3fe`, including the FusionDynamics2D
0.3.5-perbody checkpoint, now accessible under the previous-checkpoint disclosure.
V.020 adds the page; V.021 enables five supplied builds. V.024 updates FusionDynamics2D
to 0.4.1-usability and adds SY_Handwriter 0.3.0 Test 4 as the ninth record and sixth build.

## Published builds

| Project | Supplied version |
| --- | --- |
| LAB-01 / FusionDynamics2D | 0.4.1-usability / zh-TW |
| LAB-02 / Paint Bucket | 0.1.4 / zh-TW |
| LAB-03 / SY Lens Dirt | 0.93 / FullBlend |
| LAB-04 / TraceGraph OFX | 0.2.7 / Win11 x64 GPU EXPERIMENTAL |
| LAB-06 / Resolve Neural Compat | 1.0.0 / x64 |
| LAB-09 / SY_Handwriter | 0.3.0 / Test 4 |

LAB-05, LAB-07 and LAB-08 retain their development records but have no download
button. No placeholder build is published for research or obsolete projects.
The original encrypted FusionDynamics2D 0.3.5 archive is retained; the current-build
button points to 0.4.1. Other published archives are unchanged.

The 0.4.1 description follows its supplied usability guide and recorded test report:
245 passing tests, 61 Lua / Fuse syntax checks and two JavaScript syntax checks.
The reported 0.4.0 host tests 1–4 do not constitute acceptance of the 0.4.1 changes.
SY_Handwriter follows its Test 4 README and changelog; font fitting uses rendered
Text+ Alpha and still requires Resolve host tests across fonts and text layouts.

## Protection and verification

GitHub Pages hosts static files. Every published ZIP in `public/lab-builds/`
contains a single AES-256 encrypted entry holding the exact original supplied ZIP.
The original program, directory layout and ZIP bytes are preserved. Users extract
the encrypted outer ZIP with their authorized password, then open the original ZIP
inside. Use an archiver that supports WinZip AES, such as 7-Zip.

After the visitor enters a password, the page retrieves only encrypted bytes,
checks the ciphertext SHA-256 against `app/lab/builds.json`, confirms the expected
single AES-256 entry, and validates its complete AES authentication code with
zip.js. Only then does the page start downloading the **encrypted outer ZIP**.
The temporary plaintext stream is discarded, never downloaded or stored.
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
AES authentication, cancellation and the six current archive headers/hashes.
Browser QA additionally uses the real encrypted builds on desktop and mobile.
Private-password extraction checks run locally; no real password is committed
to tests or CI configuration.

References: [zip.js AES support](https://gildas-lormeau.github.io/zip.js/),
[AES authentication checks](https://gildas-lormeau.github.io/zip.js/api/interfaces/ZipReaderOptions.html),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
