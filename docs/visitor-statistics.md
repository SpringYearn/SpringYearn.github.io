# Visitor statistics

V.022 replaces the unavailable legacy Busuanzi JSONP endpoint, which returned HTTP 502 during verification on 2026-10-03, with the maintained Busuanzi API at `https://busuanzi.9420.ltd/api`.

As of V.023, the displayed total is **3,280 historical visitors + the new service's server-backed estimated unique visitors**. The historical baseline was adjusted from 3,240 to 3,280 at the site owner's explicit request. The legacy service's subsequent count could not be read during its outage; it is not presented as imported. The tooltip records the service change date.

POST counts the visit and returns `data.site_uv`. Only the canonical site origin is sent in `x-bsz-referer`, so home, work and LAB share a total. The service's signed anonymous visitor identity is reused when storage is available. Local previews and private backup hosts do not register visits. A successful request is shared across client-side navigation; failures are evicted and retried up to three times, with a fresh attempt when the network reconnects. No visitor count is generated or incremented in local storage.

API reference: https://github.com/soxft/busuanzi/wiki/API

# Logo asset

`public/springyearn-logo.glb` is exported from the supplied `springyearn logo.fbx` (FBX 7400, one mesh / 12,767 polygons). The silhouette, lettering and bevel geometry are retained. Browser materials use three discrete toon-shading bands and a fine contour outline. Three.js and the model load when the existing brand-story panel approaches view. Mouse, pen and touch drags rotate the model; the chosen angle remains after release. Pointer capture supports drags beyond the panel, cancellation and reset release the capture, and the toolbar resets the view. Arrow keys rotate and Home resets. The canvas consumes touch gestures only inside its viewer; the rest of the page scrolls normally. Rendering stops when idle or hidden and the original logo image remains a fallback when WebGL is unavailable. Reduced-motion users retain direct drag / keyboard control without animated easing.
