"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { FolderClosed, FolderOpen, RefreshCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { Localized } from "../localized";
import { useSiteLanguage } from "../site-language";
import { boardFetch, paintBoard, type BoardData, type Stroke } from "./board-client";
import { BoardLoading } from "./board-loading";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./erase-geometry";

export function BoardArchive({ boards }: { boards: number[] }) {
  const { language } = useSiteLanguage();
  const zh = language === "zh";
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useState<number | null>(null);
  const [ink, setInk] = useState<Stroke[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [scale, setScale] = useState(100);
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

  const selectBoard = (id: number) => {
    setInk(null);
    setFailed(false);
    setScale(100);
    view.current?.scrollTo(0, 0);
    setBoard(id);
  };
  if (boards.length === 0) return null;

  return <Localized>
    <Dialog.Root open={open} onOpenChange={next => {
      if (next) selectBoard(boards.at(-1)!);
      setOpen(next);
    }}>
      <Dialog.Trigger asChild>
        <button className="board-folder-trigger" type="button">
          <FolderClosed className="board-folder-closed" aria-hidden="true" />
          <FolderOpen className="board-folder-open" aria-hidden="true" />
          <span>{label}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="board-archive-overlay" />
        <Dialog.Content className="board-archive-dialog" data-no-ripple>
          <div className="board-archive-header">
            <div><Dialog.Title>{label}</Dialog.Title>
              <Dialog.Description>{zh ? "這裡收藏以前的共用畫布，可縮放瀏覽。" : "Browse previous shared canvases and zoom in on the drawings."}</Dialog.Description></div>
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
              <span className="board-archive-read-only">{zh ? "唯讀" : "Read-only"}</span>
            </div>
            <div className="board-archive-zoom" aria-label={zh ? "畫布縮放" : "Canvas zoom"}>
              <button type="button" onClick={() => setScale(value => Math.max(100, value - 25))} disabled={scale <= 100} aria-label={zh ? "縮小畫布" : "Zoom out"}><ZoomOut aria-hidden="true" /></button>
              <output>{scale}%</output>
              <button type="button" onClick={() => setScale(value => Math.min(300, value + 25))} disabled={scale >= 300} aria-label={zh ? "放大畫布" : "Zoom in"}><ZoomIn aria-hidden="true" /></button>
            </div>
          </div>
          <div className="board-archive-viewport" ref={view} tabIndex={0} role="region" aria-label={zh ? "舊畫布預覽" : "Archived canvas preview"}>
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
  </Localized>;
}
