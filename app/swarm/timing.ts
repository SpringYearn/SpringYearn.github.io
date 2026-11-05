/** Half the V.077 rate; the controls remain relative to this default. */
export const BUILD_RATE = 2.5;
export const SCROLL_MULTIPLIER = 2;
export const INTRO_DURATION = 1.4;
export const buildStep = (delta: number, speed: number, multiplier=1) => Math.min(.05, Math.max(0, delta)) * speed * BUILD_RATE * multiplier;
export const scrollTempo = (entryTop:number,currentTop:number,height:number) => Math.abs(currentTop-entryTop)>=Math.max(48,Math.min(160,height*.2))?SCROLL_MULTIPLIER:1;
