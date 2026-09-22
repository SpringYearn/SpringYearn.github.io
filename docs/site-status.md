# Footer update date and visitors

The first release of the footer feature intentionally displays **2026-09-02**,
the previous website update. Verified public release:
`e1b6642743d812be6fdfcb269381a1a1a712c0dd`.

`npm run build:github` runs `scripts/build-github.mjs`. It identifies the commit
that first added `site-history.json`. That introduction commit keeps the initial
date. Later changes to site source, assets, dependencies, build configuration or
deployment code use their latest Git commit date in **Asia/Taipei**. Rebuilding
an unchanged commit and documentation-only commits do not move the date. CI must
check out full history (`fetch-depth: 0`). Do not replace this with today's date
or a date calculated in the visitor's browser. Future website edits do not need
a manual date change.

Check the date without building: `node scripts/build-github.mjs --print-date`.
The normal preview uses the initial fallback date; the production build embeds
the resolved date with `NEXT_PUBLIC_SITE_UPDATED`.

## Latest update summary

The date opens a small bilingual update summary on hover, keyboard focus or tap.
The popup and both pages read `latestUpdate.en` / `latestUpdate.zh` from
`site-history.json`. For **every future website update**, replace these short
visitor-facing notes with the actual changes in that release (for example, newly
added works). Keep both languages in sync. Do not reuse the example as a claim
that new works were added, and do not fill this with raw commit messages or
technical build details. The date still follows the automated Git rule above.

Visitors use Busuanzi's remotely persisted `site_uv` total, as documented at
https://ibruce.info/2015/04/04/busuanzi/ . The HTTPS JSONP request sends only the
public origin as its referrer. No account, secret, local counter, or historical
seed is used. Both routes share the same origin and one request per document.
The production hostname guard excludes local QA and the private Sites backup.
Counts begin when enabled; prior traffic cannot be recovered. This is an estimate
of unique browsers, not a precise count of human identities. Browser privacy
settings, blockers and provider availability can affect the number. Failed or
blocked requests display an em dash and an explanatory hover/focus note, never
zero or made-up visitors; all other site features continue independently.
