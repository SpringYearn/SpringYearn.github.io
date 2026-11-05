/** 1× in the controls is five times the V.076 animation rate. */
export const BUILD_RATE = 5;
export const INTRO_DURATION = 1.4;
export const buildStep = (delta: number, speed: number) => Math.min(.05, Math.max(0, delta)) * speed * BUILD_RATE;
