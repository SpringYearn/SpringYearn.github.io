"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSiteLanguage } from "./site-language";

export function BrandWord({ word }: { word: "SPRING" | "YEARN" }) {
  const { language } = useSiteLanguage();
  const button = useRef<HTMLButtonElement>(null);
  const seen = useRef(false);
  const [replay, setReplay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setReplay(value => value + 1);
    setPlaying(true);
  };
  useEffect(() => {
    const touch = window.matchMedia("(hover: none)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer?.disconnect();
      const target = button.current;
      if (!target || seen.current || !touch.matches || reduced.matches) return;
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .75)) return;
        seen.current = true;
        setReplay(value => value + 1);
        setPlaying(true);
        observer?.disconnect();
      }, { threshold: .75, rootMargin: "-96px 0px -8% 0px" });
      observer.observe(target);
    };
    observe();
    const changed = () => { if (reduced.matches) setPlaying(false); observe(); };
    touch.addEventListener("change", changed);
    reduced.addEventListener("change", changed);
    return () => { observer?.disconnect(); touch.removeEventListener("change", changed); reduced.removeEventListener("change", changed); };
  }, []);
  return <button ref={button} type="button" className="brand-word" data-brand-word={word} data-replay={playing || undefined} onClick={play}
    onKeyDown={event => { if (event.repeat && (event.key === "Enter" || event.key === " ")) event.preventDefault(); }}
    aria-label={language === "en" ? `Replay the ${word} animation` : `重播 ${word} 動畫`}>
    <span className="sr-only">{word}</span>
    {Array.from(word).map((letter, index) => <span className="brand-letter" aria-hidden="true" key={`${replay}-${index}`}
      style={{ "--brand-letter-index": index } as CSSProperties}
      onAnimationEnd={index === word.length - 1 ? () => setPlaying(false) : undefined}>{letter}</span>)}
  </button>;
}
