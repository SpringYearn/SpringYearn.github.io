import { ENTRANCE_ATTRIBUTE } from "./availability";
import { logoDeformation } from "./logo-deformation";
import { ENTRANCE_TRAVEL_MS } from "./timing";

type Spark = { angle: number; phase: number; range: number; size: number; turn: number };
type Field = {
  x: number; y: number; width: number; height: number; radius: number;
  time: number; progress: number; rush: number; fade: number; ink: string;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
function ease(start: number, end: number, value: number) {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
}

function sparks(count: number, offset = 0): Spark[] {
  return Array.from({ length: count }, (_, index) => {
    const i = index + offset;
    return {
      angle: i * 2.399963,
      phase: (i * 17 % 101) / 101,
      range: (i * 31 % 89) / 89,
      size: .62 + (i * 13 % 21) * .064,
      turn: (i * 11 % 19) / 13 - .38,
    };
  });
}

function glowTexture() {
  const image = document.createElement("canvas");
  const radius = 120;
  image.width = image.height = radius * 2;
  const context = image.getContext("2d");
  if (!context) return image;
  const light = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
  for (let step = 0; step <= 16; step++) {
    const t = step / 16;
    // Exponential falloff with a short fade at the texture's edge.
    const alpha = Math.exp(-5.3 * t) * (1 - ease(.78, 1, t));
    light.addColorStop(t, `rgba(157,222,186,${alpha})`);
  }
  context.fillStyle = light;
  context.fillRect(0, 0, image.width, image.height);
  return image;
}

function drawGrid(context: CanvasRenderingContext2D, field: Field) {
  const { width, height, x, y, radius, progress, rush, fade, ink } = field;
  const strength = rush * fade;
  if (strength < .01) return;

  const spacing = Math.max(32, Math.min(59, radius * .105));
  const wave = radius * (.18 + progress * 1.49);
  const vertex = (dx: number, dy: number, first: boolean) => {
    const distance = Math.hypot(dx, dy);
    const near = Math.exp(-distance / (radius * .47));
    const ripple = Math.exp(-(((distance - wave) / (radius * .24)) ** 2));
    const angle = strength * (.93 * near + .24 * ripple);
    const scale = 1 + strength * (.16 * ripple - .43 * near);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const px = x + (dx * cos - dy * sin) * scale;
    const py = y + (dx * sin + dy * cos) * scale;
    if (first) context.moveTo(px, py);
    else context.lineTo(px, py);
  };
  const h = Math.ceil(width * .5 / spacing) + 2;
  const v = Math.ceil(height * .5 / spacing) + 2;
  context.beginPath();
  for (let row = -v; row <= v; row++) {
    for (let column = -2 * h; column <= 2 * h; column++) {
      vertex(column * spacing * .5, (row - .5) * spacing, column === -2 * h);
    }
  }
  for (let column = -h; column <= h; column++) {
    for (let row = -2 * v; row <= 2 * v; row++) {
      vertex((column - .5) * spacing, row * spacing * .5, row === -2 * v);
    }
  }
  context.strokeStyle = `rgba(${ink},${strength * .24})`;
  context.lineWidth = .76;
  context.stroke();
}

function drawParticles(context: CanvasRenderingContext2D, field: Field, motes: Spark[], burst: Spark[]) {
  const { x, y, radius, time, progress, rush, fade, ink } = field;
  context.fillStyle = `rgb(${ink})`;
  for (const mote of motes) {
    const age = (time / (4.6 + mote.range * 4.2) + mote.phase) % 1;
    const r = radius * (.045 + age * (.18 + mote.range * .54) * (1 + rush));
    const angle = mote.angle + age * mote.turn * .22;
    context.globalAlpha = Math.sin(Math.PI * age) * (.26 + mote.range * .48) * fade;
    context.beginPath();
    context.arc(x + Math.cos(angle) * r, y + Math.sin(angle) * r, mote.size, 0, Math.PI * 2);
    context.fill();
  }
  if (progress > 0) {
    for (const mote of burst) {
      const age = clamp((progress - mote.phase * .27) / (.6 + .14 * mote.range));
      if (age === 0 || age === 1) continue;
      const distance = radius * (.065 + age ** 1.65 * (.55 + mote.range * 1.22));
      const angle = mote.angle + mote.turn * age * .43;
      context.globalAlpha = Math.sin(Math.PI * age) ** .62 * (.36 + mote.range * .46) * fade;
      context.beginPath();
      context.arc(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance,
        mote.size * (1 + .45 * age), 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}

function drawStreams(context: CanvasRenderingContext2D, field: Field, streams: Spark[], hover: number, clock: number) {
  const { x, y, radius, progress, rush, fade, ink } = field;
  if (hover + rush < .012) return;
  const normalCount = Math.ceil(streams.length * .53);
  for (let i = 0; i < streams.length; i++) {
    const strength = i < normalCount ? Math.min(1, hover + rush) : rush;
    if (strength < .012) continue;
    const stream = streams[i];
    const front = (clock * (.51 + stream.range * .32) + stream.phase) % 1;
    const back = Math.max(0, front - (.13 + .14 * rush));
    const outer = radius * (.4 + stream.range * .78 + .37 * rush);
    const inner = radius * (.066 + .026 * stream.range);
    const turn = (.31 + .88 * rush) * stream.turn;
    const point = (p: number) => {
      const r = inner + (outer - inner) * (1 - p ** 1.65);
      const angle = stream.angle + turn * p * p;
      return { x: x + r * Math.cos(angle), y: y + r * Math.sin(angle) };
    };
    const a = point(back), b = point((back + front) / 2), c = point(front);
    if (Math.hypot(c.x - a.x, c.y - a.y) < .5) continue;
    const visible = Math.sin(Math.PI * front) * strength * fade * (.69 + stream.range * .22);
    const gradient = context.createLinearGradient(a.x, a.y, c.x, c.y);
    gradient.addColorStop(0, `rgba(${ink},0)`);
    gradient.addColorStop(.72, `rgba(${ink},${visible * .56})`);
    gradient.addColorStop(1, `rgba(${ink},${visible})`);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.quadraticCurveTo(2 * b.x - (a.x + c.x) / 2, 2 * b.y - (a.y + c.y) / 2, c.x, c.y);
    context.lineWidth = 3.1 + .7 * stream.range;
    context.globalAlpha = .19;
    context.stroke();
    context.globalAlpha = 1;
    context.lineWidth = .65 + .52 * stream.range + .29 * progress;
    context.stroke();
  }
}

export function animateEntrance(canvas: HTMLCanvasElement, emblem: HTMLElement, button: HTMLButtonElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const smallBudget = (navigator.hardwareConcurrency || 8) <= 4;
  const motes = sparks(smallBudget ? 34 : 53);
  const burst = sparks(smallBudget ? 60 : 105, 59);
  const streams = sparks(smallBudget ? 36 : 58, 173);
  const glow = glowTexture();
  const logo = logoDeformation(emblem, smallBudget);
  const started = performance.now();
  let previous = started, launch: number | null = null, hover = 0, clock = 0;
  let width = 1, height = 1, frame = 0;
  let stopped = false;

  const resize = () => {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    const density = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2_600_000 / (width * height)));
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    canvas.width = canvas.height = 1;
    logo?.stop();
    emblem.style.removeProperty("transform");
  };
  const paint = (now: number) => {
    const phase = document.documentElement.getAttribute(ENTRANCE_ATTRIBUTE);
    if (!phase || phase === "handoff") { stop(); return; }
    if (phase === "launching" && launch === null) launch = now;
    const progress = launch === null ? 0 : clamp((now - launch) / ENTRANCE_TRAVEL_MS);
    if (progress >= 1) { stop(); return; }

    const delta = Math.max(0, Math.min(.04, (now - previous) / 1000));
    previous = now;
    const target = launch !== null || button.matches(":hover:enabled") ? 1 : 0;
    hover += (target - hover) * (1 - Math.exp(-delta * 8.4));
    const rush = ease(.018, .57, progress);
    const fade = 1 - ease(.82, 1, progress);
    const time = Math.max(0, (now - started) / 1000);
    clock += delta * (1 + 2.8 * rush);
    const bob = Math.sin(time * 1.12) * 5.6 * (1 - ease(.12, .8, progress));
    emblem.style.transform = `translate3d(0,${bob.toFixed(2)}px,0)`;
    const ink = "188,231,206";
    const field = { x: width / 2, y: height / 2 + bob, width, height, radius: Math.min(width, height) / 2,
      time, progress, rush, fade, ink };
    context.clearRect(0, 0, width, height);
    const glowSize = field.radius * (1.39 + hover * .16 + rush * 1.85);
    context.globalAlpha = (.65 + hover * .16 + rush * .18) * fade;
    context.drawImage(glow, field.x - glowSize / 2, field.y - glowSize / 2, glowSize, glowSize);
    context.globalAlpha = 1;
    drawGrid(context, field);
    drawParticles(context, field, motes, burst);
    drawStreams(context, field, streams, hover, clock);
    logo?.draw(ease(.25, .86, progress));
    frame = requestAnimationFrame(paint);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  frame = requestAnimationFrame(paint);
  return stop;
}
