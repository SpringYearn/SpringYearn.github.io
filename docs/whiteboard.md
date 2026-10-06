# Shared whiteboard

The `/whiteboard/` UI is a static GitHub Pages route. Shared vectors and requests are persisted separately in a Sites Cloudflare D1 service; browser storage only holds an anonymous session token and unsent edits for recovery.

- Service: https://springyearn-whiteboard.springyearn.chatgpt.site
- Sites project: `appgprj_6ac50f6125c08191888e900fa0c7f9bf`
- Binding: `DB`; tables: `boards`, `strokes`, `sessions`, `requests`, `limits`.
- The service source is maintained in its Sites source repository, with schema migrations. There are no private service credentials in the portfolio source.
- `GET /api/board?id=1` returns persisted strokes with ETag support. Visible clients refresh every three seconds; inactive tabs pause periodic polling.
- Anonymous writes require a random session token. The server stores its hash, validates coordinates/colors, limits strokes to 1–6 px and 256 points, and rate-limits writes. Only the same anonymous browser session can erase its strokes. Erasure removes a whole vector stroke.
- `POST /api/request` records at most one new-board request per current board count. Codex checks for new requests hourly and avoids repeat notifications. It does not automatically add or clear boards.
- To add another board, increase the service’s `BOARD_COUNT` runtime variable and deploy its saved version through Sites. Existing boards and drawings remain. The UI lists new boards automatically.
- Live QA removes only marks created by its own temporary test sessions. Local test requests are never copied into the production database.
