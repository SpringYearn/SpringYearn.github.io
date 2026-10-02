# LAB downloads

The dedicated `/lab/` page retains all eight records from commit
`a52e1092993e70daf58749132c5734a54895f3fe`, including the FusionDynamics2D
0.3.5-perbody checkpoint. Home and Work link to LAB; LAB links back to both.

## Current availability

GitHub Pages publishes the static Next export and cannot run password verification.
This repository contains no downloadable project builds or private download service.
Each current-build button therefore opens an authorization request with a contact
link. It does not collect a password or expose a download link in this state.
V.020 records this limitation; it does not claim live protected downloads.

## Enable protected downloads

Only set `NEXT_PUBLIC_LAB_DOWNLOAD_ENDPOINT` at build time after a private HTTPS
service and the actual current builds are ready. This value is a public endpoint
address, with no credentials, query string or fragment. Do not put a password,
password hash, storage key or signed file URL in any `NEXT_PUBLIC_*` variable.
The current Pages workflow deliberately leaves the endpoint unset.

The service contract is:

- Accept `POST` JSON with `project` (`LAB-01` through `LAB-08`) and `password`.
  Validate project IDs against an explicit private build manifest; never resolve
  arbitrary client file paths. Verify the password on the server before reading
  or returning any file. Keep secrets in private service configuration only.
- Require HTTPS, allow CORS only for the production website origin, rate-limit
  failed attempts, and redact request bodies and secrets from all logs/analytics.
  Passwords must not appear in URLs. The client sends no cookies, stores no
  password, clears the form on submit/close, and rejects redirects.
- Return `401`/`403` for invalid access, `404` for a build not yet available,
  and `429` for throttling. The UI displays localized, generic messages.
- On success return the **actual AES-256 password-encrypted ZIP** bytes with
  `Content-Type: application/zip` and `Cache-Control: no-store` (also on errors).
  Do not return a JSON/public file URL or an unencrypted ZIP. Use private storage
  with no public bypass. Disable request-body logging and response caching at
  every proxy/CDN layer. A UI/MIME check cannot prove ZIP encryption.
- Before placing a build in the private manifest, verify every ZIP member is
  AES encrypted; extraction without a password or with a wrong password must
  fail, and correct-password extraction must reproduce the approved current files.
  Do not invent a build for projects that only have research/design records.

Prepare encrypted ZIPs privately (for example using the 7-Zip GUI with archive
format ZIP and encryption method AES-256). Enter the private password interactively;
do not put it in shell arguments, scripts, commits, documentation or CI output.
Keep both ZIPs and source builds outside the public repository and Pages assets.
Do not encode a password hint or verifier into the frontend.

## Verification before enabling

Check absent-service contact flow, keyboard focus/Escape, narrow mobile layout,
and all eight project buttons. With the private service, test invalid access,
throttling, unavailable projects, timeout, malformed responses and successful
encrypted ZIP download/extraction. Inspect published HTML/JS/CSS and Git changes
for secrets. Test direct private-storage access is denied. A mock service does
not constitute production authorization or encrypted-build validation.

References: [GitHub Pages hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
and [7-Zip](https://www.7-zip.org/).
