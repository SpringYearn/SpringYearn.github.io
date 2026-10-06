export type XY = [number, number];
export type Ink = { id: string; owner: string; color: string; width: number; points: XY[]; created?: number };
type Interval = [number, number];
const size = (p: XY): XY => [p[0] * 1600, p[1] * 1000];
const same = (a: XY, b: XY) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-9;
function linear(base: number, delta: number, lo: number, hi: number): Interval | null {
  if (Math.abs(delta) < 1e-12) return base >= lo && base <= hi ? [0, 1] : null;
  const a = (lo - base) / delta, b = (hi - base) / delta;
  const start = Math.max(0, Math.min(a, b)), end = Math.min(1, Math.max(a, b));
  return start <= end ? [start, end] : null;
}
function circle(a: XY, b: XY, center: XY, radius: number): Interval | null {
  const dx = b[0] - a[0], dy = b[1] - a[1], x = a[0] - center[0], y = a[1] - center[1];
  const aa = dx * dx + dy * dy, bb = 2 * (x * dx + y * dy), cc = x * x + y * y - radius * radius;
  if (aa < 1e-12) return cc <= 0 ? [0, 1] : null;
  const discriminant = bb * bb - 4 * aa * cc;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant), start = Math.max(0, (-bb - root) / (2 * aa)), end = Math.min(1, (-bb + root) / (2 * aa));
  return start <= end ? [start, end] : null;
}
function capsule(a: XY, b: XY, c: XY, d: XY, radius: number): Interval | null {
  const ex = d[0] - c[0], ey = d[1] - c[1], length = Math.hypot(ex, ey);
  const intervals: Interval[] = [];
  for (const center of [c, d]) { const i = circle(a, b, center, radius); if (i) intervals.push(i); }
  if (length > 1e-9) {
    const dx = b[0] - a[0], dy = b[1] - a[1], x = a[0] - c[0], y = a[1] - c[1];
    const u = linear((x * ex + y * ey) / length, (dx * ex + dy * ey) / length, 0, length);
    const v = linear((ex * y - ey * x) / length, (ex * dy - ey * dx) / length, -radius, radius);
    if (u && v && Math.max(u[0], v[0]) <= Math.min(u[1], v[1])) intervals.push([Math.max(u[0], v[0]), Math.min(u[1], v[1])]);
  }
  return intervals.length ? [Math.min(...intervals.map(i => i[0])), Math.max(...intervals.map(i => i[1]))] : null;
}
function merge(intervals: Interval[]) {
  const result: Interval[] = [];
  for (const i of intervals.sort((a, b) => a[0] - b[0])) {
    const last = result.at(-1);
    if (last && i[0] <= last[1] + 1e-9) last[1] = Math.max(last[1], i[1]); else result.push([...i]);
  }
  return result;
}
export function clipInk(points: XY[], eraser: XY[], radius: number): XY[][] {
  if (!points.length || !eraser.length) return points.length ? [points] : [];
  const path = eraser.map(size), runs: XY[][] = [];
  let current: XY[] = [];
  const flush = () => { if (current.length) runs.push(current); current = []; };
  const clipped = (a: XY, b: XY) => merge(path.flatMap((c, j) => {
    const d = path[Math.max(0, j - 1)];
    if (Math.max(a[0], b[0]) < Math.min(c[0], d[0]) - radius || Math.min(a[0], b[0]) > Math.max(c[0], d[0]) + radius || Math.max(a[1], b[1]) < Math.min(c[1], d[1]) - radius || Math.min(a[1], b[1]) > Math.max(c[1], d[1]) + radius) return [];
    const interval = capsule(a, b, c, d, radius); return interval ? [interval] : [];
  }));
  if (points.length === 1) return clipped(size(points[0]), size(points[0])).length ? [] : [points];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], cuts = clipped(size(a), size(b));
    const lerp = (t: number): XY => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    let t = 0;
    for (const [start, end] of [...cuts, [1, 1] as Interval]) {
      if (start > t + 1e-9) {
        const from = lerp(t), to = lerp(start);
        if (current.length && !same(current.at(-1)!, from)) flush();
        if (!current.length) current.push(from);
        if (!same(current.at(-1)!, to)) current.push(to);
      }
      if (end > start + 1e-9) flush();
      t = Math.max(t, end);
    }
  }
  flush(); return runs;
}
export function eraseInk(strokes: Ink[], path: XY[], radius: number, operationId: string, owner: string) {
  const removed: string[] = [], added: Ink[] = [];
  let ordinal = 0;
  for (const stroke of strokes) {
    if (stroke.owner !== owner) continue;
    const runs = clipInk(stroke.points, path, radius + stroke.width / 2);
    if (runs.length === 1 && runs[0].length === stroke.points.length && runs[0].every((p, i) => same(p, stroke.points[i]))) continue;
    removed.push(stroke.id);
    for (const points of runs) added.push({ ...stroke, id: `${operationId}-${ordinal++}`, points });
  }
  return { removed, added };
}
export function applyErase(strokes: Ink[], path: XY[], radius: number, operationId: string, owner: string) {
  const change = eraseInk(strokes, path, radius, operationId, owner), removed = new Set(change.removed);
  return [...strokes.filter(s => !removed.has(s.id)), ...change.added];
}
