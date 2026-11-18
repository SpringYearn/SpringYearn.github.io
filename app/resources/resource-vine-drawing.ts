type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };
type Side = "top" | "bottom" | "left" | "right";
type Edges = Record<Side, number>;
type Knot = Point & { angle: number; t: number; halfWidth: number };
type Sprig = { knots: Knot[]; leaves: number[]; leafSize: number };
type Vine = { stem: Sprig; branch: Sprig | null; fork: number; delay: number };

const roots = [
  { side: "top", at: .43, run: .28, reach: .91, delay: .025 },
  { side: "top", at: .85, run: -.32, reach: .65, delay: .10 },
  { side: "bottom", at: .18, run: .37, reach: .77, delay: .02 },
  { side: "bottom", at: .74, run: .22, reach: .94, delay: .13 },
  { side: "left", at: .74, run: -.64, reach: .85, delay: .115 },
  { side: "right", at: .24, run: .63, reach: .83, delay: .06 },
] as const;

const palettes = [
  { stem: "#8ba985", leaves: ["#a8bc92", "#b9c99f", "#91ad8d"], vein: "#526f54" },
  { stem: "#77a496", leaves: ["#8caca0", "#a1bcaa", "#82a79b"], vein: "#4c7569" },
];

const limit = (n: number) => Math.max(0, Math.min(n, 1));
const polar = (point: Point, angle: number, distance: number): Point => ({
  x: point.x + Math.cos(angle) * distance,
  y: point.y + Math.sin(angle) * distance,
});

function outside(box: Box, point: Point) {
  return Math.hypot(
    Math.max(box.x - point.x, point.x - box.x - box.width, 0),
    Math.max(box.y - point.y, point.y - box.y - box.height, 0),
  );
}

function curve(box: Box, points: [Point, Point, Point, Point], girth: number, leafSize: number, leaves: number[]): Sprig {
  const [a, b, c, d] = points;
  const coordinate = (t: number, key: keyof Point) => {
    const r = 1 - t;
    return r ** 3 * a[key] + 3 * r * r * t * b[key] + 3 * r * t * t * c[key] + t ** 3 * d[key];
  };
  const derivative = (t: number, key: keyof Point) => {
    const r = 1 - t;
    return r * r * (b[key] - a[key]) + 2 * r * t * (c[key] - b[key]) + t * t * (d[key] - c[key]);
  };
  const knots = Array.from({ length: 37 }, (_, index) => {
    const t = index / 36;
    const point = { x: coordinate(t, "x"), y: coordinate(t, "y") };
    // Measure against the actual card, so a strand narrows even on a short branch.
    const halfWidth = .095 + girth * Math.exp(-outside(box, point) / 43) * (1 - t) ** .55;
    return { ...point, t, halfWidth, angle: Math.atan2(derivative(t, "y"), derivative(t, "x")) };
  });
  return { knots, leafSize, leaves };
}

function onSide(box: Box, side: Side, along: number, away: number): Point {
  if (side === "top") return { x: box.x + along, y: box.y - away };
  if (side === "bottom") return { x: box.x + along, y: box.y + box.height + away };
  if (side === "left") return { x: box.x - away, y: box.y + along };
  return { x: box.x + box.width + away, y: box.y + along };
}

export function growVines(box: Box, edges: Edges, lab: boolean): Vine[] {
  return roots.map(({ side, at, run, reach, delay }, index) => {
    const horizontal = side === "top" || side === "bottom";
    const span = horizontal ? box.width : box.height;
    const space = edges[side];
    const handedness = lab && horizontal ? -1 : 1;
    const start = (handedness === 1 ? at : 1 - at) * span;
    const drift = Math.sign(run) * handedness * Math.min(Math.abs(run) * span, 218);
    const depth = Math.max(1, space - 4) * reach;
    const leafSize = Math.max(5, Math.min(horizontal ? 22 : 17, space * .48));
    const point = (offset: number, away: number) => onSide(box, side, start + drift * offset, away);
    const girth = (horizontal ? 1.7 : 1.22) * (space < 24 ? .73 : 1);
    const stem = curve(box, [
      point(0, -2),
      point(.085, depth * (index % 2 ? 1.26 : 1.03)),
      point(.75, depth * (index % 2 ? .13 : .50)),
      point(1, depth * .82),
    ], girth, leafSize, [.22, .37, .53, .68, .81, .92]);

    const fork = index % 2 ? .42 : .53;
    const anchor = stem.knots[Math.round(fork * (stem.knots.length - 1))];
    const turn = anchor.angle + (index % 2 ? .69 : -.68);
    const length = Math.min(span * .12, depth * .57, 45);
    const branch = length < 16 ? null : curve(box, [
      anchor, polar(anchor, turn - .34, length * .38),
      polar(anchor, turn + .12, length * .72), polar(anchor, turn - .21, length),
    ], .62, leafSize * .74, [.4, .72, .91]);
    return { stem, branch, fork, delay };
  });
}

function sprigPoint(sprig: Sprig, t: number) {
  const position = limit(t) * (sprig.knots.length - 1);
  const a = sprig.knots[Math.floor(position)], b = sprig.knots[Math.ceil(position)];
  const blend = position % 1;
  return { x: a.x + (b.x - a.x) * blend, y: a.y + (b.y - a.y) * blend,
    angle: a.angle, halfWidth: a.halfWidth + (b.halfWidth - a.halfWidth) * blend, t };
}

function leaf(context: CanvasRenderingContext2D, at: Knot, angle: number, length: number, color: string, vein: string) {
  const width = length * .3;
  context.save();
  context.translate(at.x, at.y);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(length * .24, -width, length * .67, -width, length, 0);
  context.bezierCurveTo(length * .65, width * .64, length * .25, width * .85, 0, 0);
  context.fillStyle = color;
  context.fill();
  context.beginPath();
  context.moveTo(0, 0);
  context.quadraticCurveTo(length * .46, -width * .18, length * .92, 0);
  context.strokeStyle = vein;
  context.lineWidth = .48;
  context.stroke();
  context.restore();
}

function paintSprig(context: CanvasRenderingContext2D, sprig: Sprig, length: number, palette: typeof palettes[number], index: number) {
  if (length <= 0) return;
  const points = sprig.knots.slice(0, Math.ceil(length * (sprig.knots.length - 1)));
  points.push(sprigPoint(sprig, length));
  const edge = (point: Knot, sign: number) => polar(point, point.angle + Math.PI / 2,
    sign * point.halfWidth * limit((length - point.t) * 18));
  context.beginPath();
  const base = edge(points[0], 1);
  context.moveTo(base.x, base.y);
  for (const point of points) { const side = edge(point, 1); context.lineTo(side.x, side.y); }
  for (let i = points.length - 1; i >= 0; i--) { const side = edge(points[i], -1); context.lineTo(side.x, side.y); }
  context.closePath();
  context.fillStyle = palette.stem;
  context.fill();
  for (const [n, t] of sprig.leaves.entries()) {
    const open = limit((length - t) / .15);
    if (open <= .03) continue;
    const point = sprigPoint(sprig, t);
    const side = (index + n) % 2 ? 1 : -1;
    leaf(context, point, point.angle + side * (.77 + .35 * open),
      sprig.leafSize * (1.1 - t * .44) * open, palette.leaves[(index + n) % palette.leaves.length], palette.vein);
  }
}

export function paintVines(context: CanvasRenderingContext2D, vines: Vine[], progress: number, lab: boolean) {
  const palette = palettes[lab ? 1 : 0];
  for (const [index, vine] of vines.entries()) {
    const arrival = limit((progress - vine.delay) / (1 - vine.delay));
    const length = 1 - (1 - arrival) ** 1.55;
    const fork = limit((length - vine.fork) / (1 - vine.fork));
    paintSprig(context, vine.stem, length, palette, index);
    if (vine.branch) paintSprig(context, vine.branch, fork ** 1.18, palette, index + 1);
  }
}
