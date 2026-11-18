import type { GridBend, GridOffset } from "./entrance-grid";

type Artwork = HTMLImageElement | HTMLCanvasElement;
const pad = 18;
const blurRadius = 4;

function soften(input: Float32Array, output: Float32Array, width: number, height: number, horizontal: boolean) {
  const stride = horizontal ? 1 : width;
  const length = horizontal ? width : height;
  const lines = horizontal ? height : width;
  const window = blurRadius * 2 + 1;
  for (let line = 0; line < lines; line++) {
    const start = horizontal ? line * width : line;
    let sum = 0;
    for (let index = 0; index < blurRadius; index++) sum += input[start + index * stride];
    for (let index = 0; index < length; index++) {
      const entering = index + blurRadius;
      const leaving = index - blurRadius - 1;
      if (entering < length) sum += input[start + entering * stride];
      if (leaving >= 0) sum -= input[start + leaving * stride];
      output[start + index * stride] = sum / window;
    }
  }
}

/** A soft stencil sampled from the same transparent artwork being drawn on screen. */
export class LogoGridWarp implements GridBend {
  readonly bounds = { left: 0, right: 0, top: 0, bottom: 0 };
  private readonly stencil = document.createElement("canvas");
  private readonly context = this.stencil.getContext("2d", { willReadFrequently: true });
  private alpha = new Float32Array(0);
  private scratch = new Float32Array(0);
  private source: Artwork | undefined;
  private amount = -1;
  private scaleX = 1;
  private scaleY = 1;
  private pull = 0;

  constructor(private readonly resolution: number) {}

  update(artwork: Artwork, amount: number, pressure: number) {
    const sourceWidth = artwork instanceof HTMLImageElement ? artwork.naturalWidth : artwork.width;
    const sourceHeight = artwork instanceof HTMLImageElement ? artwork.naturalHeight : artwork.height;
    if (!this.context || !sourceWidth || !sourceHeight || pressure <= .012) return false;
    const box = artwork.getBoundingClientRect();
    if (!box.width || !box.height) return false;

    const width = this.resolution;
    const height = Math.max(1, Math.round(width * sourceHeight / sourceWidth));
    if (this.source !== artwork || Math.abs(amount - this.amount) >= .012) {
      const paddedWidth = width + pad * 2, paddedHeight = height + pad * 2;
      if (paddedWidth !== this.stencil.width || paddedHeight !== this.stencil.height) {
        this.stencil.width = paddedWidth;
        this.stencil.height = paddedHeight;
        this.alpha = new Float32Array(paddedWidth * paddedHeight);
        this.scratch = new Float32Array(this.alpha.length);
      }
      this.context.clearRect(0, 0, paddedWidth, paddedHeight);
      this.context.drawImage(artwork, pad, pad, width, height);
      const pixels = this.context.getImageData(0, 0, paddedWidth, paddedHeight).data;
      for (let index = 0; index < this.alpha.length; index++) this.alpha[index] = pixels[index * 4 + 3] / 255;
      for (let pass = 0; pass < 2; pass++) {
        soften(this.alpha, this.scratch, paddedWidth, paddedHeight, true);
        soften(this.scratch, this.alpha, paddedWidth, paddedHeight, false);
      }
      this.source = artwork;
      this.amount = amount;
    }

    this.scaleX = width / box.width;
    this.scaleY = height / box.height;
    this.bounds.left = box.left - pad / this.scaleX;
    this.bounds.right = box.right + pad / this.scaleX;
    this.bounds.top = box.top - pad / this.scaleY;
    this.bounds.bottom = box.bottom + pad / this.scaleY;
    this.pull = Math.min(52, box.width * .092) * pressure;
    return true;
  }

  private sample(x: number, y: number) {
    const column = Math.floor(x), row = Math.floor(y);
    const fx = x - column, fy = y - row;
    const index = row * this.stencil.width + column;
    const lower = index + this.stencil.width;
    const a = this.alpha[index] * (1 - fx) + this.alpha[index + 1] * fx;
    const b = this.alpha[lower] * (1 - fx) + this.alpha[lower + 1] * fx;
    return a * (1 - fy) + b * fy;
  }

  offset(x: number, y: number, output: GridOffset) {
    output.x = output.y = 0;
    const u = (x - this.bounds.left) * this.scaleX;
    const v = (y - this.bounds.top) * this.scaleY;
    if (u < 2 || v < 2 || u >= this.stencil.width - 2 || v >= this.stencil.height - 2) return;
    // The alpha gradient points out of each stroke, including the gaps inside the mark.
    const nx = this.sample(u - 1, v) - this.sample(u + 1, v);
    const ny = this.sample(u, v - 1) - this.sample(u, v + 1);
    const length = Math.hypot(nx, ny);
    if (length < .0015) return;
    const push = this.pull * Math.min(length * 6.2, 1);
    output.x = nx * push / length;
    output.y = ny * push / length;
  }
}
