# Shared whiteboard

The `/whiteboard/` UI is a static GitHub Pages route. Shared vectors and requests are persisted separately in a Sites Cloudflare D1 service; browser storage only holds an anonymous session token and unsent edits for recovery.

- Service: https://springyearn-whiteboard.springyearn.chatgpt.site
- Sites project: `appgprj_6ac50f6125c08191888e900fa0c7f9bf`
- Binding: `DB`; tables: `boards`, `strokes`, `sessions`, `requests`, `limits`, `operations`.
- The service source is maintained in its Sites source repository, with schema migrations. There are no private service credentials in the portfolio source.
- `GET /api/board` returns the newest canvas and the archive index with ETag support. `GET /api/board?id=1` serves the original drawing as a read-only canvas. Visible clients refresh every three seconds; inactive tabs pause periodic polling.
- Anonymous writes require a random session token. The server stores its hash, validates coordinates/colors, limits strokes to 1–6 px and 256 points, and rate-limits writes. Only the same anonymous browser session can erase its strokes. Area erasure clips only the passed region into surviving vector fragments.
- `POST /api/request?id=<active-id>` sends at most one successful email request per active canvas and reset version. The request button becomes available again when a new canvas opens.
- To start a new blank canvas, increase the service’s `BOARD_COUNT` runtime variable and deploy its saved version through Sites. The highest canvas ID accepts edits; earlier canvases keep their drawings and open from the archive folder. A future reset applies only to the active canvas.
- Live QA removes only marks created by its own temporary test sessions. Local test requests are never copied into the production database.

V.048 adds `/api/edit` for regional erasure and Undo. A private operations ledger retains recent snapshots by anonymous author and board. Draw and erase chunks share a gesture identifier, so one Undo restores the entire gesture, including after reload. Updates apply transactionally against the board revision and do not overwrite another author’s records. The frontend supplies authorization for its own Undo availability; legacy draw/delete requests remain supported.
