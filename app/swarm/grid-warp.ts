/** A brief displacement along a drag, with a stationary grid around its edge. */
export class GridWarp {
  private x = 0;
  private y = 0;
  private dx = 0;
  private dy = 0;
  private strength = 0;

  move(x: number, y: number, dx: number, dy: number) {
    const distance = Math.hypot(dx, dy);
    if (distance < .5) return;
    this.x = x;
    this.y = y;
    this.dx = dx / distance;
    this.dy = dy / distance;
    this.strength = Math.max(this.strength, Math.min(1, .26 + distance / 38));
  }

  paint(context: CanvasRenderingContext2D, seconds: number) {
    this.strength *= Math.exp(-Math.max(0, seconds) * 7.4);
    if (this.strength < .025) return false;

    const { x, y, dx, dy, strength } = this;
    const radius = 104 + strength * 68;
    const step = 28;
    const left = Math.floor((x - radius) / step) * step;
    const top = Math.floor((y - radius) / step) * step;
    const right = x + radius + step;
    const bottom = y + radius + step;
    const light = context.createRadialGradient(x, y, 0, x, y, radius);
    light.addColorStop(0, `rgba(172,232,205,${strength * .48})`);
    light.addColorStop(.67, `rgba(143,212,204,${strength * .23})`);
    light.addColorStop(1, "rgba(143,212,204,0)");

    const vertex = (px: number, py: number, first: boolean) => {
      const vx = px - x, vy = py - y;
      const weight = Math.max(0, 1 - (vx * vx + vy * vy) / (radius * radius)) ** 2 * strength;
      const nextX = px + weight * (dx * 28 - vy * .48);
      const nextY = py + weight * (dy * 28 + vx * .48);
      if (first) context.moveTo(nextX, nextY);
      else context.lineTo(nextX, nextY);
    };

    context.save();
    context.beginPath();
    for (let y = top; y <= bottom; y += step) {
      for (let x = left; x <= right; x += step / 2) vertex(x, y, x === left);
    }
    for (let x = left; x <= right; x += step) {
      for (let y = top; y <= bottom; y += step / 2) vertex(x, y, y === top);
    }
    context.strokeStyle = light;
    context.lineWidth = 1;
    context.stroke();
    context.restore();
    return true;
  }
}
