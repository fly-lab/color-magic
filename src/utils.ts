import { BlendMode, ModeCb } from "./types";
import {
	burn,
	darken,
	difference,
	dodge,
	exclusion,
	hard,
	lighten,
	multiply,
	normal,
	overlay,
	screen,
	soft,
} from "./algorithoms";

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
export const safeRgb = (value: number): number => clamp(value, 0, 255);
export const safeHex = (value: string): string =>
	(clamp(parseInt(value, 16), 0, 255) || 0).toString(16).padStart(2, "0");
export const safeHue = (value: number): number => clamp(value, 0, 360);
export const safePct = (value: number): number => clamp(value, 0, 100);
export const safeAlpha = (value: number): number => clamp(value, 0, 1);

export const random = (min: number = 0, max: number = 10): number => Math.floor(Math.random() * (max - min) + min);

export const modeMap: Record<BlendMode, ModeCb> = {
	normal: normal,
	multiply: multiply,
	screen: screen,
	overlay: overlay,
	difference: difference,
	exclusion: exclusion,
	darken: darken,
	lighten: lighten,
	dodge: dodge,
	burn: burn,
	hard: hard,
	soft: soft,
};

export const modeMapping = (mode: BlendMode): ModeCb => modeMap[mode];

// converts 0-255 to 00-ff
export const toHexCh = (v: number): string => safeRgb(v).toString(16).padStart(2, "0");
// converts decimal to 255 multiples
export const toB255 = (v: number): number => Math.round(v * 255);
// converts 0-1 to 0-255
export const toB255Alpha = (v: number): number => toB255(safeAlpha(v));
// converts decimal to 255 divisions
export const toB10 = (v: number): number => v / 255;
// converts 0-255 to 0-1 with 2 decimal precisions
export const toB10Alpha = (v: number): number => Number(toB10(safeRgb(v)).toFixed(2));
// converts 00-ff to 0-255
export const toB16Ch = (v: string): number => parseInt(safeHex(v), 16);

export const hueSwitch = (p: number, q: number, t: number): number => {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
};

// D65 white point references
export const REF_X: number = 95.047;
export const REF_Y: number = 100.0;
export const REF_Z: number = 108.883;

export const EPSILON: number = 0.008856;
export const KAPPA: number = 903.3;

export const f = (c: number): number => (c > EPSILON ? Math.pow(c, 1 / 3) : (KAPPA * c + 16) / 116);

export const p = (v: number): number => (Math.pow(v, 3) > EPSILON ? Math.pow(v, 3) : (116 * v - 16) / KAPPA);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
