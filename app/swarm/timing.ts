/** Half the V.077 rate; the controls remain relative to this default. */
export const BUILD_RATE = 2.5;
export const INTRO_DURATION = 1.4;
export const buildStep = (delta: number, speed: number) => Math.min(.05, Math.max(0, delta)) * speed * BUILD_RATE;
