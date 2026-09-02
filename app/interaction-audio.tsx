"use client";

import { useEffect } from "react";

type ToneOptions = {
  startFrequency: number;
  endFrequency: number;
  duration: number;
  level: number;
  delay?: number;
  type?: OscillatorType;
};

const interactiveSelector =
  'a[href], button:not(:disabled), [role="button"], input[type="button"], input[type="submit"]';
const workGatewaySelector = '[data-audio="work-gateway"]';

function playTone(context: AudioContext, options: ToneOptions) {
  const startAt = context.currentTime + (options.delay ?? 0);
  const endAt = startAt + options.duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = options.type ?? "sine";
  oscillator.frequency.setValueAtTime(options.startFrequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, endAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(options.level, startAt + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt + 0.01);
}

function playClick(context: AudioContext) {
  playTone(context, {
    startFrequency: 1480,
    endFrequency: 2100,
    duration: 0.055,
    level: 0.022,
  });
  playTone(context, {
    startFrequency: 2860,
    endFrequency: 2340,
    duration: 0.038,
    level: 0.009,
    delay: 0.012,
  });
}

function playHover(context: AudioContext) {
  playTone(context, {
    startFrequency: 1880,
    endFrequency: 2380,
    duration: 0.036,
    level: 0.007,
    type: "triangle",
  });
}

function playGatewayClick(context: AudioContext) {
  playTone(context, {
    startFrequency: 520,
    endFrequency: 760,
    duration: 0.13,
    level: 0.011,
    type: "triangle",
  });
  playTone(context, {
    startFrequency: 1180,
    endFrequency: 1760,
    duration: 0.1,
    level: 0.017,
    delay: 0.018,
    type: "triangle",
  });
  playTone(context, {
    startFrequency: 2140,
    endFrequency: 3420,
    duration: 0.17,
    level: 0.01,
    delay: 0.048,
  });
}

function playGatewayHover(context: AudioContext) {
  playTone(context, {
    startFrequency: 1120,
    endFrequency: 1510,
    duration: 0.085,
    level: 0.006,
    type: "triangle",
  });
  playTone(context, {
    startFrequency: 1880,
    endFrequency: 2680,
    duration: 0.12,
    level: 0.005,
    delay: 0.032,
  });
}

export function InteractionAudio() {
  useEffect(() => {
    let context: AudioContext | null = null;
    let lastInteractive: Element | null = null;
    let disposed = false;

    const getContext = () => {
      context ??= new AudioContext();
      return context;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;

      const isWorkGateway =
        event.target instanceof Element && Boolean(event.target.closest(workGatewaySelector));
      const playTargetClick = (audioContext: AudioContext) =>
        isWorkGateway ? playGatewayClick(audioContext) : playClick(audioContext);

      const audioContext = getContext();
      if (audioContext.state === "suspended") {
        void audioContext.resume().then(() => {
          if (!disposed) playTargetClick(audioContext);
        });
        return;
      }

      if (audioContext.state === "running") playTargetClick(audioContext);
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;

      const interactive = event.target.closest(interactiveSelector);
      if (!interactive || interactive === lastInteractive) return;

      lastInteractive = interactive;
      if (context?.state === "running") {
        if (interactive.matches(workGatewaySelector)) playGatewayHover(context);
        else playHover(context);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;

      const interactive = event.target.closest(interactiveSelector);
      const nextInteractive = event.relatedTarget instanceof Element
        ? event.relatedTarget.closest(interactiveSelector)
        : null;

      if (interactive && interactive !== nextInteractive) lastInteractive = null;
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      disposed = true;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      if (context && context.state !== "closed") void context.close();
    };
  }, []);

  return null;
}
