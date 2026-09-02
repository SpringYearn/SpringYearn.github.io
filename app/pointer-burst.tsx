"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type BurstKind = "press" | "tap" | "hold";

type Burst = {
  id: number;
  x: number;
  y: number;
  kind: BurstKind;
};

type ActivePointer = {
  pointerId: number;
  x: number;
  y: number;
  moved: boolean;
  held: boolean;
  timer: number;
};

const rays = Array.from({ length: 8 }, (_, index) => index);

export function PointerBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const activePointer = useRef<ActivePointer | null>(null);
  const removalTimers = useRef<number[]>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const timers = removalTimers.current;

    const addBurst = (x: number, y: number, kind: BurstKind) => {
      const id = nextId.current++;
      setBursts((current) => [...current.slice(-14), { id, x, y, kind }]);

      const timer = window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
      }, kind === "hold" ? 1150 : 760);
      timers.push(timer);
    };

    const clearHoldTimer = () => {
      if (!activePointer.current) return;
      window.clearTimeout(activePointer.current.timer);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;

      clearHoldTimer();
      addBurst(event.clientX, event.clientY, "press");

      const pointer: ActivePointer = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        moved: false,
        held: false,
        timer: 0,
      };

      pointer.timer = window.setTimeout(() => {
        if (activePointer.current !== pointer || pointer.moved) return;
        pointer.held = true;
        addBurst(pointer.x, pointer.y, "hold");
      }, 440);

      activePointer.current = pointer;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const pointer = activePointer.current;
      if (!pointer || pointer.pointerId !== event.pointerId) return;

      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 12) {
        pointer.moved = true;
        window.clearTimeout(pointer.timer);
      }
    };

    const finishPointer = (event: PointerEvent, cancelled = false) => {
      const pointer = activePointer.current;
      if (!pointer || pointer.pointerId !== event.pointerId) return;

      window.clearTimeout(pointer.timer);
      if (!cancelled && !pointer.moved && !pointer.held) {
        addBurst(event.clientX, event.clientY, "tap");
      }
      activePointer.current = null;
    };

    const handlePointerUp = (event: PointerEvent) => finishPointer(event);
    const handlePointerCancel = (event: PointerEvent) => finishPointer(event, true);

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerCancel, { passive: true });

    return () => {
      clearHoldTimer();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, []);

  return (
    <>
      {bursts.map((burst) => (
        <span
          className={`interaction-burst burst-${burst.kind}`}
          style={{ left: burst.x, top: burst.y }}
          aria-hidden="true"
          key={burst.id}
        >
          <span className="burst-ring" />
          <span className="burst-cross" />
          {rays.map((ray) => (
            <i
              key={ray}
              style={
                {
                  "--burst-angle": `${ray * 45 + (burst.kind === "hold" ? 22.5 : 0)}deg`,
                  "--burst-distance": burst.kind === "hold" ? "44px" : "27px",
                  "--burst-delay": `${ray * 12}ms`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </>
  );
}
