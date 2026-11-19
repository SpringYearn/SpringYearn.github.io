"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { REDUCED_MOTION_QUERY } from "./swarm/availability";

// Each seed starts on an edge of the card and drifts out into the surrounding light.
const motes = [
  [8, 0, -18, -45], [22, 0, 12, -66], [36, 0, -22, -50],
  [55, 0, 15, -64], [72, 0, -14, -38], [88, 0, 23, -48],
  [0, 18, -33, -29], [0, 44, -45, -42], [0, 73, -30, -51],
  [100, 17, 27, -42], [100, 42, 39, -27], [100, 64, 42, -48], [100, 88, 29, -28],
  [10, 100, -32, 22], [26, 100, 15, 49], [43, 100, -17, 29],
  [63, 100, 21, 40], [81, 100, -13, 49], [93, 100, 19, 26],
];
const restingGlow = .54;

export function WorkGatewayAtmosphere({ playing }: { playing: boolean }) {
  const light = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const glow = light.current;
    if (!playing || !glow?.animate) return;
    const reduced = matchMedia(REDUCED_MOTION_QUERY);
    let timer = 0;
    let flicker: Animation | undefined;

    const pulse = () => {
      flicker = glow.animate([
        { opacity: restingGlow },
        { opacity: .74 + Math.random() * .18, offset: .25 },
        { opacity: .58, offset: .52 },
        { opacity: .63 + Math.random() * .10, offset: .70 },
        { opacity: restingGlow },
      ], { duration: 640 + Math.random() * 460, easing: "ease-in-out" });
      schedule();
    };
    const schedule = () => {
      timer = window.setTimeout(pulse, 1700 + Math.random() * 4500);
    };
    const stop = () => {
      window.clearTimeout(timer);
      flicker?.cancel();
    };
    const update = () => {
      stop();
      if (!reduced.matches && !document.hidden) schedule();
    };
    reduced.addEventListener("change", update);
    update();
    return () => {
      reduced.removeEventListener("change", update);
      stop();
    };
  }, [playing]);

  return <div className="work-gateway-atmosphere" aria-hidden="true" data-swarm-ignore>
    <span className="work-gateway-light" ref={light} style={{ opacity: restingGlow }} />
    {motes.map(([x, y, dx, dy], index) => <i className="work-gateway-mote" key={index} style={{
      left: `${x}%`, top: `${y}%`,
      "--mote-size": `${1.3 + (index * 7 % 12) * .12}px`,
      "--mote-x": `${dx}px`, "--mote-y": `${dy}px`,
      animationDuration: `${5.6 + (index * 17 % 32) * .14}s`,
      animationDelay: `${-(index * 19 % 71) * .1}s`,
    } as CSSProperties} />)}
  </div>;
}
