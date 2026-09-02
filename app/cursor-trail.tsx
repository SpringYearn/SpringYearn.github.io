"use client";

import { useEffect, useRef } from "react";

const trailCount = 3;
const trailMarks = Array.from({ length: trailCount }, (_, index) => index);

type TrailPoint = {
  x: number;
  y: number;
  angle: number;
};

export function CursorTrail() {
  const marks = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const supportsPointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!supportsPointer || reducedMotion) return;

    const points: TrailPoint[] = trailMarks.map(() => ({ x: -80, y: -80, angle: 0 }));
    const target = { x: -80, y: -80 };
    let initialized = false;
    let lastMove = 0;
    let animationFrame = 0;

    const renderTrail = (time: number) => {
      const idleFade = Math.max(0, 1 - (time - lastMove) / 520);
      let unsettled = false;

      points.forEach((point, index) => {
        const leader = index === 0 ? target : points[index - 1];
        const followStrength = Math.max(.18, .31 - index * .022);
        const deltaX = leader.x - point.x;
        const deltaY = leader.y - point.y;
        const distance = Math.hypot(deltaX, deltaY);

        point.x += deltaX * followStrength;
        point.y += deltaY * followStrength;
        if (distance > .25) {
          point.angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          unsettled = true;
        }

        const mark = marks.current[index];
        if (!mark) return;

        const motionVisibility = Math.min(1, Math.max(0, (distance - 2) / 9));
        const opacity = idleFade * motionVisibility * Math.max(.2, .5 - index * .11);
        mark.style.setProperty("--trail-x", `${point.x.toFixed(2)}px`);
        mark.style.setProperty("--trail-y", `${point.y.toFixed(2)}px`);
        mark.style.setProperty("--trail-angle", `${point.angle.toFixed(2)}deg`);
        mark.style.setProperty("--trail-scale", `${(1 - index * .17).toFixed(2)}`);
        mark.style.opacity = opacity.toFixed(3);
      });

      if (idleFade > 0 || unsettled) {
        animationFrame = window.requestAnimationFrame(renderTrail);
      } else {
        animationFrame = 0;
        marks.current.forEach((mark) => {
          if (mark) mark.style.opacity = "0";
        });
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      target.x = event.clientX;
      target.y = event.clientY;
      lastMove = performance.now();

      if (!initialized) {
        points.forEach((point) => {
          point.x = target.x;
          point.y = target.y;
        });
        initialized = true;
      }

      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(renderTrail);
      }
    };

    const hideTrail = () => {
      lastMove = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hideTrail);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hideTrail);
    };
  }, []);

  return (
    <>
      {trailMarks.map((index) => (
        <span
          className="cursor-trail-mark"
          ref={(element) => {
            marks.current[index] = element;
          }}
          aria-hidden="true"
          key={index}
        >
          <span className="cursor-trail-corner" />
          <span className="cursor-trail-node" />
        </span>
      ))}
    </>
  );
}
