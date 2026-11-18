type Point = { x: number; y: number; time: number };
type Wake = Point & { dx: number; dy: number; strength: number };
export type GridOffset = { x: number; y: number };
export type GridBend = {
  bounds: { left: number; right: number; top: number; bottom: number };
  offset: (x: number, y: number, output: GridOffset) => void;
};

export const ENTRANCE_GRID_SPACING = 44;
const sampleStep = ENTRANCE_GRID_SPACING / 4;
const radius = 83;
const lifetime = 660;

/** One grid bends behind the pointer and then around the opening logo. */
export class EntranceGrid {
  private previous: Point | undefined;
  private trail: Wake[] = [];
  private width = 1;
  private height = 1;
  private ink: CanvasGradient | undefined;
  private launchInk: CanvasGradient | undefined;

  resize(context: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.previous = undefined;
    this.trail = [];
    const x = width / 2, y = height / 2;
    this.ink = context.createRadialGradient(x, y, 0, x, y, Math.hypot(x, y));
    this.ink.addColorStop(0, "rgba(189,207,206,.073)");
    this.ink.addColorStop(.6, "rgba(189,207,206,.040)");
    this.ink.addColorStop(1, "rgba(189,207,206,.010)");
    this.launchInk = context.createRadialGradient(x, y, 0, x, y, Math.hypot(x, y));
    this.launchInk.addColorStop(0, "rgba(188,231,206,.153)");
    this.launchInk.addColorStop(.55, "rgba(188,231,206,.074)");
    this.launchInk.addColorStop(1, "rgba(188,231,206,.010)");
  }

  move(x: number, y: number, time: number) {
    const from = this.previous;
    if (!from || time - from.time > 180) {
      this.previous = { x, y, time };
      return;
    }
    const dx = x - from.x, dy = y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 5) return;
    this.previous = { x, y, time };
    const length = Math.min(distance, 130);
    const count = Math.ceil(length / 27);
    for (let index = 1; index <= count; index++) {
      const back = length * (1 - index / count) / distance;
      this.trail.push({ x: x - dx * back, y: y - dy * back, time,
        dx: dx / distance, dy: dy / distance, strength: Math.min(1, .52 + distance / 64) });
    }
    this.trail = this.trail.slice(-12);
  }

  resetPointer() {
    this.previous = undefined;
  }

  paint(context: CanvasRenderingContext2D, now: number, opacity: number, bend?: GridBend) {
    const { width, height } = this;
    const ink = bend ? this.launchInk : this.ink;
    if (!ink || opacity <= 0) return;
    this.trail = this.trail.filter(point => now - point.time < lifetime);
    const points = bend ? [] : this.trail.map(point => ({
      ...point, strength: point.strength * Math.max(0, 1 - (now - point.time) / lifetime) ** 1.7,
    }));
    const limit = (axis: "x" | "y", max: number, start?: number, end?: number) => {
      const positions = points.map(point => point[axis]);
      const min = Math.min(start ?? Infinity, Math.min(...positions) - radius);
      const far = Math.max(end ?? -Infinity, Math.max(...positions) + radius);
      return [Math.max(0, Math.floor(min / sampleStep) * sampleStep),
        Math.min(max, Math.ceil(far / sampleStep) * sampleStep)];
    };
    const [left, right] = limit("x", width, bend?.bounds.left, bend?.bounds.right);
    const [top, bottom] = limit("y", height, bend?.bounds.top, bend?.bounds.bottom);
    const displacement = { x: 0, y: 0 };
    const previousVertex = { x: 0, y: 0 };
    const startLine = (x: number, y: number) => {
      previousVertex.x = x;
      previousVertex.y = y;
      context.moveTo(x, y);
    };
    const vertex = (x: number, y: number) => {
      if (bend) {
        bend.offset(x, y, displacement);
        const nextX = x + displacement.x, nextY = y + displacement.y;
        context.quadraticCurveTo(previousVertex.x, previousVertex.y,
          (previousVertex.x + nextX) / 2, (previousVertex.y + nextY) / 2);
        previousVertex.x = nextX;
        previousVertex.y = nextY;
        return;
      }
      let mx = 0, my = 0, total = 0;
      for (const point of points) {
        const dx = x - point.x, dy = y - point.y;
        const distance = (dx * dx + dy * dy) / (radius * radius);
        if (distance >= 1) continue;
        const weight = (1 - distance) ** 2 * point.strength;
        mx += (point.dx * 5.2 - dy * .065) * weight;
        my += (point.dy * 5.2 + dx * .065) * weight;
        total += weight;
      }
      const divisor = Math.max(1, total);
      context.lineTo(x + mx / divisor, y + my / divisor);
    };

    context.beginPath();
    for (let y = .5; y <= height; y += ENTRANCE_GRID_SPACING) {
      startLine(0, y);
      if (y >= top && y <= bottom) for (let x = left; x <= right; x += sampleStep) vertex(x, y);
      context.lineTo(width, y);
    }
    for (let x = .5; x <= width; x += ENTRANCE_GRID_SPACING) {
      startLine(x, 0);
      if (x >= left && x <= right) for (let y = top; y <= bottom; y += sampleStep) vertex(x, y);
      context.lineTo(x, height);
    }
    context.strokeStyle = ink;
    context.globalAlpha = opacity;
    context.lineWidth = .85;
    context.stroke();
    context.globalAlpha = 1;
  }
}
