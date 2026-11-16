import { BOARD_WIDTH, BOARD_HEIGHT } from "./erase-geometry";
export const BOARD_API = "https://springyearn-whiteboard.springyearn.chatgpt.site/api";
export type Point = [number, number];
export type Stroke = { id: string; owner: string; color: string; width: number; points: Point[]; created?: number; group?:string };
export type Session = { token: string; owner: string };
type BoardInfo = { id: number; revision: number; epoch: number };
export type BoardData = {
  board: BoardInfo;
  boards: BoardInfo[];
  activeBoardId?: number;
  requested: boolean;
  emailReady: boolean;
  strokes: Stroke[];
  undoId?: string | null;
};
let sessionPromise: Promise<Session> | undefined;
export function readStored(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
export function writeStored(key: string, value: string) { try { localStorage.setItem(key,value); } catch { /* In-memory drawing still works. */ } }
export async function boardFetch(path: string, init: RequestInit = {}) {
  const timeout = AbortSignal.timeout(12000);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  const response = await fetch(BOARD_API + path, {...init, signal, mode:"cors", credentials:"omit"});
  if (!response.ok && response.status !== 304) { if(response.status===401){sessionPromise=undefined;writeStored("springyearn:board-session","null");} const detail = await response.json().catch(() => null); throw Object.assign(new Error(detail?.error ?? "Connection unavailable"),{status:response.status,code:detail?.code}); }
  return response;
}

export function paintBoard(canvas: HTMLCanvasElement | null, strokes: Stroke[]) {
  const context = canvas?.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  context.lineCap = "round";
  context.lineJoin = "round";
  const sorted = [...strokes].sort((a, b) => (a.created ?? 0) - (b.created ?? 0) || a.id.localeCompare(b.id));
  for (const stroke of sorted) {
    context.beginPath();
    if (stroke.points.length === 1) {
      const [x, y] = stroke.points[0];
      context.fillStyle = stroke.color;
      context.arc(x * BOARD_WIDTH, y * BOARD_HEIGHT, stroke.width / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      stroke.points.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x * BOARD_WIDTH, y * BOARD_HEIGHT);
        else context.lineTo(x * BOARD_WIDTH, y * BOARD_HEIGHT);
      });
      context.stroke();
    }
  }
}
export function getSession() {
  if (!sessionPromise) sessionPromise = (async() => {
    let saved: Session | null = null;
    try { saved = JSON.parse(readStored("springyearn:board-session") ?? "null"); } catch { /* Start a new anonymous session. */ }
    if (saved && /^[a-f0-9]{64}$/.test(saved.token) && /^[a-f0-9-]{36}$/.test(saved.owner)) return saved;
    const session: Session = await (await boardFetch("/session",{method:"POST"})).json();
    writeStored("springyearn:board-session",JSON.stringify(session));
    return session;
  })().catch(error => { sessionPromise = undefined; throw error; });
  return sessionPromise;
}
export function nearStroke(stroke: Stroke, point: Point, radius = 12) {
  const [x,y] = [point[0]*BOARD_WIDTH,point[1]*BOARD_HEIGHT];
  return stroke.points.some((p,i) => {
    const prev = stroke.points[Math.max(0,i-1)], ax=prev[0]*BOARD_WIDTH, ay=prev[1]*BOARD_HEIGHT, dx=p[0]*BOARD_WIDTH-ax, dy=p[1]*BOARD_HEIGHT-ay;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(x-ax-t*dx,y-ay-t*dy) <= radius+stroke.width/2;
  });
}
