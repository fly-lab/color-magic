import { BlendMode, HSL, RGB } from "./types";
import { modeMapping, safeAlpha, safeHex, safeRgb } from "./utils";

export const normal = (source: number, ref: number): number => ref + source * 0;
export const multiply = (source: number, ref: number): number => source * ref;
export const screen = (source: number, ref: number): number => source + ref - source * ref;
export const hard = (source: number, ref: number): number => ref <= 0.5 ? multiply(source, ref * 2) : screen(source, ref * 2 - 1);
export const soft = (source: number, ref: number): number => ref <= 0.5 ? source - (1 - 2 * ref) * source * (1 - source) : source + (2 * ref - 1) * ((source <= 0.25 ? ((16 * source - 12) * source + 4) * source : Math.sqrt(source)) - source);
export const overlay = (source: number, ref: number): number => hard(ref, source);
export const difference = (source: number, ref: number): number => Math.abs(source - ref);
export const exclusion = (source: number, ref: number): number => source + ref - 2 * source * ref;
export const darken = (source: number, ref: number): number => Math.min(source, ref);
export const lighten = (source: number, ref: number): number => Math.min(Math.max(source, ref), 1);
export const dodge = (source: number, ref: number): number => source === 0 ? 0 : ref === 1 ? 1 : Math.min(1, source / (1 - ref));
export const burn = (source: number, ref: number): number => source === 1 ? 1 : ref === 0 ? 0 : 1 - Math.min(1, (1 - source) / ref);

export const separableBlend = (mode: BlendMode, source: number, ref: number): number => safeRgb(Math.round((modeMapping(mode)(source / 255, ref / 255)) * 255));

export const rgbDistance = (c1: RGB, c2: RGB): number => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));

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

export const rgbToHsl = (r: number, g: number, b: number, a: number): HSL => {
	r = toB10(r);
	g = toB10(g);
	b = toB10(b);

	const min: number = Math.min(r, g, b),
		max: number = Math.max(r, g, b),
		t: number = max + min,
		d: number = max - min;

	let h: number = 0, s: number = 0;
	const l: number = t / 2;

	if (d !== 0) {
		s = l > 0.5 ? d / (2 - t) : d / t;

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h = Math.round(h * 360);
		if (h < 0) h += 360;
	}

	return {h, s: Math.round(s * 100), l: Math.round(l * 100), a};
}

export const hslToRgb = (h: number, s: number, l: number, a: number): RGB => {
	s = s / 100;
	l = l / 100;

	const c: number = (1 - Math.abs(2 * l - 1)) * s,
		x: number = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m: number = l - c / 2;
	let r: number = 0, g: number = 0, b: number = 0;

	if (0 <= h && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (60 <= h && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (120 <= h && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (180 <= h && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (240 <= h && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (300 <= h && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	return { r: toB255((r + m)), g: toB255((g + m)), b: toB255((b + m)), a };
}
