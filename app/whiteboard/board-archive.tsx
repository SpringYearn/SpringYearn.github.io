"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Dialog } from "radix-ui";
import { ArrowUpRight, RefreshCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";
import { boardFetch, paintBoard, type BoardData, type Stroke } from "./board-client";
import { BoardLoading } from "./board-loading";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./erase-geometry";

const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
type PointerPosition = { x: number; y: number };

export function BoardArchive({ boards }: { boards: number[] }) {
  const { language } = useSiteLanguage();
  const zh = language === "zh";
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useState<number | null>(null);
  const [ink, setInk] = useState<Stroke[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [scale, setScale] = useState(MIN_ZOOM);
  const [dragging, setDragging] = useState(false);
  const scaleRef = useRef(MIN_ZOOM);
  const anchor = useRef<{ point: PointerPosition; offset: PointerPosition } | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null);
  const sheet = useRef<HTMLCanvasElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const label = zh ? "舊畫布" : "Canvas archive";
  const number = (id: number) => (zh ? "畫布 " : "Canvas ") + String(id).padStart(2, "0");

  useEffect(() => {
    if (!open || board === null) return;
    const controller = new AbortController();
    setInk(null);
    setFailed(false);
    boardFetch(`/board?id=${board}`, { signal: controller.signal })
      .then(response => response.json() as Promise<BoardData>)
      .then(data => {
        if (data.board.id !== board) throw new Error("Archive unavailable");
        if (!controller.signal.aborted) setInk(data.strokes);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [open, board, retry]);

  useEffect(() => {
    if (open) paintBoard(sheet.current, ink ?? []);
  }, [open, ink]);

  const zoomTo = useCallback((value: number, pointer?: PointerPosition) => {
    const viewport = view.current;
    const canvas = sheet.current;
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
    if (!viewport || !canvas?.clientWidth || !canvas.clientHeight || next === scaleRef.current) return;
    const bounds = viewport.getBoundingClientRect();
    const offset = pointer ? {
      x: Math.max(0, Math.min(viewport.clientWidth, pointer.x - bounds.left - viewport.clientLeft)),
      y: Math.max(0, Math.min(viewport.clientHeight, pointer.y - bounds.top - viewport.clientTop)),
    } : { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    anchor.current = {
      point: {
        x: (viewport.scrollLeft + offset.x) / canvas.clientWidth,
        y: (viewport.scrollTop + offset.y) / canvas.clientHeight,
      },
      offset,
    };
    scaleRef.current = next;
    setScale(next);
  }, []);

  useLayoutEffect(() => {
    const viewport = view.current;
    const canvas = sheet.current;
    const current = anchor.current;
    if (!viewport || !canvas || !current) return;
    anchor.current = null;
    viewport.scrollTo({
      left: current.point.x * canvas.clientWidth - current.offset.x,
      top: current.point.y * canvas.clientHeight - current.offset.y,
      behavior: "instant",
    });
  }, [scale]);

  const attachViewport = useCallback((element: HTMLDivElement | null) => {
    view.current = element;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      const mode = event.deltaMode;
      if (event.ctrlKey || event.metaKey || event.deltaY === 0) return;
      event.preventDefault();
      if (drag.current) return;
      const unit = mode === WheelEvent.DOM_DELTA_LINE ? 16 : mode === WheelEvent.DOM_DELTA_PAGE ? element.clientHeight : 1;
      zoomTo(scaleRef.current * Math.exp(-event.deltaY * unit * .0018), { x: event.clientX, y: event.clientY });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", wheel);
      view.current = null;
    };
  }, [zoomTo]);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0) return;
    const viewport = event.currentTarget;
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(".board-sheet")) return;
    if (viewport.scrollWidth <= viewport.clientWidth && viewport.scrollHeight <= viewport.clientHeight) return;
    event.preventDefault();
    viewport.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop,
    };
    setDragging(true);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    event.currentTarget.scrollLeft = current.left + current.x - event.clientX;
    event.currentTarget.scrollTop = current.top + current.y - event.clientY;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
  };

  const selectBoard = (id: number) => {
    setInk(null);
    setFailed(false);
    scaleRef.current = MIN_ZOOM;
    anchor.current = null;
    drag.current = null;
    setDragging(false);
    setScale(MIN_ZOOM);
    view.current?.scrollTo(0, 0);
    setBoard(id);
  };
  if (boards.length === 0) return null;

  return <Localized>
    <section className="section-block board-archive-section" aria-label={label}>
      <Dialog.Root open={open} onOpenChange={next => {
        if (next) selectBoard(boards.at(-1)!);
        setOpen(next);
      }}>
        <Dialog.Trigger asChild>
          <button className="board-folder-trigger" type="button">
            <span className="board-folder-art" aria-hidden="true">
              <span className="board-folder-back" />
              <span className="board-folder-paper board-folder-paper-back" />
              <span className="board-folder-paper board-folder-paper-front" />
              <span className="board-folder-cover"><span /></span>
            </span>
            <span className="board-folder-label">{label}<ArrowUpRight aria-hidden="true" /></span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="board-archive-overlay" />
          <Dialog.Content className="board-archive-dialog" data-no-ripple>
            <div className="board-archive-header">
              <div>
                <Dialog.Title>{label}</Dialog.Title>
                <Dialog.Description>
                  <span className="board-archive-touch-help">{zh ? "這裡收藏以前的共用畫布，可縮放瀏覽。" : "Browse previous shared canvases and zoom in on the drawings."}</span>
                  <span className="board-archive-mouse-help">{zh ? "用滑鼠滾輪縮放，按住左鍵拖曳畫布。" : "Use the mouse wheel to zoom, and hold the left button to drag the canvas."}</span>
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="board-archive-close" type="button" aria-label={zh ? "關閉舊畫布" : "Close canvas archive"}>
                  <X aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>
            <div className="board-archive-tools">
              <div className="board-archive-list">
                {boards.length === 1 ? <span>{number(boards[0])}</span> : boards.map(id =>
                  <button key={id} type="button" onClick={() => { if (board !== id) selectBoard(id); }} aria-pressed={board === id}>{number(id)}</button>
                )}
                <span className="status-pill">{zh ? "唯讀" : "Read-only"}</span>
              </div>
              <div className="board-archive-zoom" aria-label={zh ? "畫布縮放" : "Canvas zoom"}>
                <button type="button" onClick={() => zoomTo(scaleRef.current - 25)} disabled={scale <= MIN_ZOOM} aria-label={zh ? "縮小畫布" : "Zoom out"}><ZoomOut aria-hidden="true" /></button>
                <output>{Math.round(scale)}%</output>
                <button type="button" onClick={() => zoomTo(scaleRef.current + 25)} disabled={scale >= MAX_ZOOM} aria-label={zh ? "放大畫布" : "Zoom in"}><ZoomIn aria-hidden="true" /></button>
              </div>
            </div>
            <div className="board-archive-viewport" ref={attachViewport} tabIndex={0} role="region"
              aria-label={zh ? "舊畫布預覽" : "Archived canvas preview"}
              data-dragging={dragging}
              onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag}
              onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
              <div className="board-sheet" style={{ width: `${scale}%` }}>
                <canvas ref={sheet} width={BOARD_WIDTH} height={BOARD_HEIGHT} role="img" aria-label={board === null ? label : number(board)} />
                {ink === null && <BoardLoading offline={failed} />}
              </div>
            </div>
            {failed && <button type="button" className="board-archive-retry" onClick={() => setRetry(value => value + 1)}>
              <RefreshCw aria-hidden="true" />{zh ? "重試連線" : "Retry connection"}
            </button>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  </Localized>;
}
