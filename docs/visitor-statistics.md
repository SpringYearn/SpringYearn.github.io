# Visitor statistics

V.022 replaces the unavailable legacy Busuanzi JSONP endpoint, which returned HTTP 502 during verification on 2026-10-03, with the maintained Busuanzi API at `https://busuanzi.9420.ltd/api`.

The displayed total remains **3,240 historical visitors + the new service's server-backed estimated unique visitors**. The legacy service's subsequent count could not be read during this outage; it has not been invented or silently treated as imported. The tooltip records the service change date.

POST counts the visit and returns `data.site_uv`. Only the canonical site origin is sent in `x-bsz-referer`, so home, work and LAB share a total. The service's signed anonymous visitor identity is reused when storage is available. Local previews and private backup hosts do not register visits. A successful request is shared across client-side navigation; failures are evicted and retried up to three times, with a fresh attempt when the network reconnects. No visitor count is generated or incremented in local storage.

API reference: https://github.com/soxft/busuanzi/wiki/API

# Logo asset

`public/springyearn-logo.glb` is exported from the supplied `springyearn logo.fbx` (FBX 7400, one mesh / 12,767 polygons). The silhouette, lettering and bevel geometry are retained. Only transforms and the satin sage material are adapted for the browser. Three.js and the model load when the existing brand-story panel approaches view. The scene renders on resize and pointer interaction, stops when idle or hidden, and keeps the original logo image as a fallback when WebGL is unavailable. Reduced-motion users receive a stationary model.
