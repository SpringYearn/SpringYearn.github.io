"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

type TiltStatus = "checking" | "ready" | "requesting" | "active" | "denied" | "unavailable";
type OrientationPermission = "granted" | "denied";
type PermissionAwareDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<OrientationPermission>;
};

const tiltProperties = [
  "--tilt-x",
  "--tilt-y",
  "--tilt-x-soft",
  "--tilt-y-soft",
  "--tilt-x-reverse",
  "--tilt-y-reverse",
  "--tilt-rotate",
  "--tilt-rotate-reverse",
  "--tilt-spot-x",
  "--tilt-spot-y",
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function screenAngle() {
  const modernAngle = window.screen.orientation?.angle;
  const legacyAngle = (window as Window & { orientation?: number }).orientation;
  return typeof modernAngle === "number"
    ? modernAngle
    : typeof legacyAngle === "number"
      ? legacyAngle
      : 0;
}

function normalizedOrientation(beta: number, gamma: number) {
  const angle = ((screenAngle() % 360) + 360) % 360;

  if (angle === 90) return { x: beta, y: -gamma };
  if (angle === 270) return { x: -beta, y: gamma };
  if (angle === 180) return { x: -gamma, y: -beta };
  return { x: gamma, y: beta };
}

export function DeviceTiltControl() {
  const [status, setStatus] = useState<TiltStatus>("checking");
  const frameRef = useRef<number | null>(null);
  const orientationHandlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const orientationChangeHandlerRef = useRef<(() => void) | null>(null);
  const referenceRef = useRef<{ x: number; y: number } | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const teardown = useCallback((nextStatus?: TiltStatus) => {
    if (typeof window === "undefined") return;

    if (orientationHandlerRef.current) {
      window.removeEventListener("deviceorientation", orientationHandlerRef.current);
      orientationHandlerRef.current = null;
    }
    if (orientationChangeHandlerRef.current) {
      window.removeEventListener("orientationchange", orientationChangeHandlerRef.current);
      orientationChangeHandlerRef.current = null;
    }
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const root = document.documentElement;
    root.classList.remove("device-tilt-enabled");
    tiltProperties.forEach((property) => root.style.removeProperty(property));
    referenceRef.current = null;
    targetRef.current = { x: 0, y: 0 };
    currentRef.current = { x: 0, y: 0 };

    if (nextStatus) setStatus(nextStatus);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const updateAvailability = () => {
      const supported =
        "DeviceOrientationEvent" in window && coarsePointer.matches && !reducedMotion.matches;

      if (!supported) {
        teardown("unavailable");
        return;
      }

      setStatus((current) =>
        current === "active" || current === "requesting" ? current : "ready",
      );
    };

    updateAvailability();
    reducedMotion.addEventListener("change", updateAvailability);
    coarsePointer.addEventListener("change", updateAvailability);

    return () => {
      reducedMotion.removeEventListener("change", updateAvailability);
      coarsePointer.removeEventListener("change", updateAvailability);
      teardown();
    };
  }, [teardown]);

  const enableTilt = async () => {
    if (status === "active") {
      teardown("ready");
      return;
    }

    setStatus("requesting");

    try {
      const orientationEvent = DeviceOrientationEvent as PermissionAwareDeviceOrientationEvent;
      if (typeof orientationEvent.requestPermission === "function") {
        const permission = await orientationEvent.requestPermission();
        if (permission !== "granted") {
          setStatus("denied");
          return;
        }
      }

      const root = document.documentElement;
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.beta === null || event.gamma === null) return;

        const reading = normalizedOrientation(event.beta, event.gamma);
        if (!referenceRef.current) {
          referenceRef.current = reading;
          return;
        }

        targetRef.current = {
          x: clamp((reading.x - referenceRef.current.x) / 18, -1, 1),
          y: clamp((reading.y - referenceRef.current.y) / 18, -1, 1),
        };
      };

      const resetReference = () => {
        referenceRef.current = null;
        targetRef.current = { x: 0, y: 0 };
      };

      const renderTilt = () => {
        const current = currentRef.current;
        const target = targetRef.current;
        current.x += (target.x - current.x) * 0.085;
        current.y += (target.y - current.y) * 0.085;

        root.style.setProperty("--tilt-x", `${(current.x * 7).toFixed(2)}px`);
        root.style.setProperty("--tilt-y", `${(current.y * 5).toFixed(2)}px`);
        root.style.setProperty("--tilt-x-soft", `${(current.x * 3.2).toFixed(2)}px`);
        root.style.setProperty("--tilt-y-soft", `${(current.y * 2.4).toFixed(2)}px`);
        root.style.setProperty("--tilt-x-reverse", `${(current.x * -5).toFixed(2)}px`);
        root.style.setProperty("--tilt-y-reverse", `${(current.y * -3.6).toFixed(2)}px`);
        root.style.setProperty("--tilt-rotate", `${(current.x * 0.55).toFixed(3)}deg`);
        root.style.setProperty("--tilt-rotate-reverse", `${(current.x * -0.38).toFixed(3)}deg`);
        root.style.setProperty("--tilt-spot-x", `${(50 + current.x * 9).toFixed(2)}%`);
        root.style.setProperty("--tilt-spot-y", `${(50 + current.y * 7).toFixed(2)}%`);
        frameRef.current = window.requestAnimationFrame(renderTilt);
      };

      orientationHandlerRef.current = handleOrientation;
      orientationChangeHandlerRef.current = resetReference;
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
      window.addEventListener("orientationchange", resetReference, { passive: true });
      root.classList.add("device-tilt-enabled");
      frameRef.current = window.requestAnimationFrame(renderTilt);
      setStatus("active");
    } catch {
      teardown("denied");
    }
  };

  if (status === "checking" || status === "unavailable") return null;

  const isActive = status === "active";
  const isRequesting = status === "requesting";
  const primaryLabel = isActive ? "TILT ON" : status === "denied" ? "TILT OFF" : "TILT";
  const secondaryLabel = isActive ? "ACTIVE" : status === "denied" ? "RETRY" : "DEVICE MOTION";

  return (
    <Button
      type="button"
      variant="outline"
      className="tilt-control"
      data-active={isActive}
      aria-pressed={isActive}
      aria-label={isActive ? "Disable device tilt / 關閉體感" : "Enable device tilt / 啟用體感"}
      disabled={isRequesting}
      onClick={enableTilt}
    >
      <Compass aria-hidden="true" />
      <span className="tilt-control-copy">
        <strong>{isRequesting ? "REQUEST" : primaryLabel}</strong>
        <span>{isRequesting ? "PERMISSION" : secondaryLabel}</span>
      </span>
    </Button>
  );
}
