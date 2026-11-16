const footprint = 1.68;

function paintTriangle(context: CanvasRenderingContext2D, image: HTMLImageElement, mesh: Float32Array,
  a: number, b: number, c: number, x: number, y: number, stepX: number, stepY: number) {
  const ax = mesh[a], ay = mesh[a + 1], bx = mesh[b], by = mesh[b + 1], cx = mesh[c], cy = mesh[c + 1];
  const mx = (ax + bx + cx) / 3, my = (ay + by + cy) / 3;
  const xx = (bx - ax) / stepX, yx = (by - ay) / stepX;
  const xy = (cx - ax) / stepY, yy = (cy - ay) / stepY;
  const left = Math.max(0, Math.min(x, x + stepX) - 6);
  const top = Math.max(0, Math.min(y, y + stepY) - 6);
  const width = Math.min(image.naturalWidth, Math.max(x, x + stepX) + 6) - left;
  const height = Math.min(image.naturalHeight, Math.max(y, y + stepY) + 6) - top;

  context.save();
  context.beginPath();
  // A small overlap avoids hairline seams between antialiased triangles.
  context.moveTo(ax + (ax - mx) * .034, ay + (ay - my) * .034);
  context.lineTo(bx + (bx - mx) * .034, by + (by - my) * .034);
  context.lineTo(cx + (cx - mx) * .034, cy + (cy - my) * .034);
  context.closePath();
  context.clip();
  context.setTransform(xx, yx, xy, yy, ax - xx * x - xy * y, ay - yx * x - yy * y);
  context.drawImage(image, left, top, width, height, left, top, width, height);
  context.restore();
}

/** Stretch the four corners of the actual image while keeping its center fixed. */
export function logoDeformation(emblem: HTMLElement, smallBudget: boolean) {
  const image = emblem.querySelector<HTMLImageElement>(".site-entrance-logo");
  const canvas = emblem.querySelector<HTMLCanvasElement>(".site-entrance-logo-warp");
  if (!image || !canvas) return;
  const divisions = smallBudget ? 8 : 11;
  const stride = 2 * (divisions + 1);
  const mesh = new Float32Array((divisions + 1) * stride);
  let initialized = false;
  let context: CanvasRenderingContext2D | null = null;

  return {
    draw(amount: number) {
      if (amount < .005 || !image.complete || !image.naturalWidth) return;
      if (!initialized) {
        initialized = true;
        canvas.width = smallBudget ? 744 : 1080;
        canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);
        context = canvas.getContext("2d");
        if (context) context.imageSmoothingQuality = "medium";
      }
      if (!context) return;

      const centerX = canvas.width / 2, centerY = canvas.height / 2;
      const strength = .63 * amount;
      for (let row = 0; row <= divisions; row++) {
        const y = row * 2 / divisions - 1;
        for (let column = 0; column <= divisions; column++) {
          const x = column * 2 / divisions - 1;
          const index = row * stride + column * 2;
          mesh[index] = centerX + centerX / footprint * x * (1 + strength * y * y);
          mesh[index + 1] = centerY + centerY / footprint * y * (1 + strength * x * x);
        }
      }

      const stepX = image.naturalWidth / divisions, stepY = image.naturalHeight / divisions;
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < divisions; row++) {
        const y = row * stepY;
        for (let column = 0; column < divisions; column++) {
          const a = row * stride + column * 2, b = a + 2, c = a + stride, d = c + 2;
          const x = column * stepX;
          paintTriangle(context, image, mesh, a, b, c, x, y, stepX, stepY);
          paintTriangle(context, image, mesh, d, c, b, x + stepX, y + stepY, -stepX, -stepY);
        }
      }
      if (!emblem.hasAttribute("data-warped")) emblem.setAttribute("data-warped", "");
    },
    stop() {
      emblem.removeAttribute("data-warped");
      canvas.width = canvas.height = 1;
    },
  };
}
