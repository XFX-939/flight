export const FT_PER_METER = 3.28084;
export const METER_PER_FT = 0.3048;
export const KNOTS_PER_MPS = 1.94384;
export const MPS_PER_KNOT = 0.514444;

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * clamp(alpha, 0, 1);
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function normalizeHeading(degrees: number): number {
  const value = degrees % 360;
  return value < 0 ? value + 360 : value;
}

export function headingDelta(a: number, b: number): number {
  const diff = Math.abs(normalizeHeading(a) - normalizeHeading(b));
  return Math.min(diff, 360 - diff);
}

export function safeRound(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
