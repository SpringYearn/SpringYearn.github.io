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

      const audioContext = getContext();
      if (audioContext.state === "suspended") {
        void audioContext.resume().then(() => {
          if (!disposed) playClick(audioContext);
        });
        return;
      }

      if (audioContext.state === "running") playClick(audioContext);
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;

      const interactive = event.target.closest(interactiveSelector);
      if (!interactive || interactive === lastInteractive) return;

      lastInteractive = interactive;
      if (context?.state === "running") playHover(context);
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
