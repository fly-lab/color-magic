import { BlendMode, HEX, HSL, LAB, RGB, TempAlgorithm, XYZ } from "./types";
import { modeMapping, safeAlpha, safeHex, safePct, safeRgb } from "./utils";

export const normal = (source: number, ref: number): number => ref + source * 0;
export const multiply = (source: number, ref: number): number => source * ref;
export const screen = (source: number, ref: number): number => source + ref - source * ref;
export const hard = (source: number, ref: number): number =>
	ref <= 0.5 ? multiply(source, ref * 2) : screen(source, ref * 2 - 1);
export const soft = (source: number, ref: number): number =>
	ref <= 0.5
		? source - (1 - 2 * ref) * source * (1 - source)
		: source +
		  (2 * ref - 1) * ((source <= 0.25 ? ((16 * source - 12) * source + 4) * source : Math.sqrt(source)) - source);
export const overlay = (source: number, ref: number): number => hard(ref, source);
export const difference = (source: number, ref: number): number => Math.abs(source - ref);
export const exclusion = (source: number, ref: number): number => source + ref - 2 * source * ref;
export const darken = (source: number, ref: number): number => Math.min(source, ref);
export const lighten = (source: number, ref: number): number => Math.min(Math.max(source, ref), 1);
export const dodge = (source: number, ref: number): number =>
	source === 0 ? 0 : ref === 1 ? 1 : Math.min(1, source / (1 - ref));
export const burn = (source: number, ref: number): number =>
	source === 1 ? 1 : ref === 0 ? 0 : 1 - Math.min(1, (1 - source) / ref);

export const separableBlend = (mode: BlendMode, source: number, ref: number): number =>
	safeRgb(Math.round(modeMapping(mode)(source / 255, ref / 255) * 255));

export const rgbDistance = (c1: RGB, c2: RGB): number =>
	Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));

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

const hueSwitch = (p: number, q: number, t: number): number => {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
};

export const rgbToHsl = (r: number, g: number, b: number, a: number): HSL => {
	r = toB10(r);
	g = toB10(g);
	b = toB10(b);

	const min: number = Math.min(r, g, b),
		max: number = Math.max(r, g, b),
		t: number = max + min,
		d: number = max - min;

	let h: number = 0,
		s: number = 0;
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

		h /= 6;
		h *= 360;

		if (h < 0) h += 360;
	}

	return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), a };
};

export const hslToRgb = (h: number, s: number, l: number, a: number): RGB => {
	h /= 360;
	s /= 100;
	l /= 100;

	let r: number = 0,
		g: number = 0,
		b: number = 0;

	if (s === 0) {
		r = g = b = l;
	} else {
		const q: number = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p: number = 2 * l - q;
		r = hueSwitch(p, q, h + 1 / 3);
		g = hueSwitch(p, q, h);
		b = hueSwitch(p, q, h - 1 / 3);
	}

	return { r: toB255(r), g: toB255(g), b: toB255(b), a };
};

export const stringToRgb = (c: string, alpha: boolean): RGB => {
	const slice: number = alpha ? 5 : 4;
	const sep: string = c.indexOf(",") > -1 ? "," : " ";
	const rgba: string[] = c.slice(slice).split(")")[0].split(sep);

	if (rgba.indexOf("/") > -1) rgba.splice(3, 1);

	for (let i: number = 0; i < rgba.length; i++) {
		const r: string = rgba[i];

		if (r.indexOf("%") > -1) {
			const p: number = safePct(Number(r.replace("%", ""))) / 100;
			if (i < 3) rgba[i] = String(Math.round(p * 255));
			else rgba[i] = String(p);
		} else {
			if (i > 2) rgba[i] = r;
		}
	}

	return { r: Number(rgba[0]), g: Number(rgba[1]), b: Number(rgba[2]), a: rgba[3] ? Number(rgba[3]) : 1 };
};

export const stringToHsl = (c: string, alpha: boolean): HSL => {
	const slice: number = alpha ? 5 : 4;
	const sep: string = c.indexOf(",") > -1 ? "," : " ";
	const hsla: string[] = c.slice(slice).split(")")[0].split(sep);

	if (hsla.indexOf("/") > -1) hsla.splice(3, 1);

	let h: string = hsla[0],
		s: string = hsla[1].replace("%", ""),
		l: string = hsla[2].replace("%", ""),
		a: string = alpha ? hsla[3] : "1";

	if (a.indexOf("%") > -1) {
		a = String(safePct(Number(a.replace("%", ""))) / 100);
	}

	if (h.indexOf("deg") > -1) h = h.replace("deg", "");
	else if (h.indexOf("rad") > -1) h = String(Math.round(Number(h.replace("rad", "")) * (180 / Math.PI)));
	else if (h.indexOf("turn") > -1) h = String(Math.round(Number(h.replace("turn", "")) * 360));

	return { h: Number(h), s: Number(s), l: Number(l), a: Number(a) };
};

export const stringToHex = (hex: string): HEX => {
	const len: number = hex.length;
	let x: string = "00",
		y: string = "00",
		z: string = "00",
		a: string = "ff";

	if (len === 3 || len === 4) {
		const result: RegExpExecArray | null = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
		if (result) {
			x = result[1] + result[1];
			y = result[2] + result[2];
			z = result[3] + result[3];
		}
	} else if (len === 6 || len === 7) {
		const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			x = result[1];
			y = result[2];
			z = result[3];
		}
	} else if (len === 8 || len === 9) {
		const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			x = result[1];
			y = result[2];
			z = result[3];
			a = result[4];
		}
	}

	return { x, y, z, a };
};

// D65 white point references
export const REF_X: number = 95.047;
export const REF_Y: number = 100.0;
export const REF_Z: number = 108.883;

export const EPSILON: number = 0.008856;
export const KAPPA: number = 903.3;

export const f = (c: number): number => (c > EPSILON ? Math.pow(c, 1 / 3) : (KAPPA * c + 16) / 116);

export const p = (v: number): number => (Math.pow(v, 3) > EPSILON ? Math.pow(v, 3) : (116 * v - 16) / KAPPA);

export const gammaCorrection = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export const inverseGammaCorrection = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export const labToXyz = (l: number, a_: number, b: number, a: number): XYZ => {
	let y: number = (l + 16) / 116;
	let x: number = a_ / 500 + y;
	let z: number = y - b / 200;

	x = p(x) * REF_X;
	y = p(y) * REF_Y;
	z = p(z) * REF_Z;

	return { x, y, z, a };
};

export const xyzToLab = (x: number, y: number, z: number, a: number): LAB => {
	const xr: number = x / (REF_X / 100);
	const yr: number = y / (REF_Y / 100);
	const zr: number = z / (REF_Z / 100);

	const xrF: number = f(xr);
	const yrF: number = f(yr);
	const zrF: number = f(zr);

	const l: number = 116 * yrF - 16;
	const a_: number = 500 * (xrF - yrF);
	const b: number = 200 * (yrF - zrF);

	return { l, a_, b, a };
};

export const tempToR = (k: number, a: TempAlgorithm): number => {
	const t: number = k / 100.0;

	if (t <= 66.0) return 255;

	if (a === "tanner_helland") return safeRgb(Math.round(329.698727446 * Math.pow(t - 60.0, -0.1332047592)));

	return safeRgb(
		Math.round(351.97690566805693 + 0.114206453784165 * (t - 55.0) - 40.25366309332127 * Math.log(t - 55.0)),
	);
};

export const tempToG = (k: number, a: TempAlgorithm): number => {
	const t: number = k / 100.0;

	if (a === "tanner_helland") {
		if (t <= 66.0) return safeRgb(Math.round(99.4708025861 * Math.log(t) - 161.1195681661));
		return safeRgb(Math.round(288.1221695283 * Math.pow(t - 60, -0.0755148492)));
	} else {
		if (t < 66.0)
			return safeRgb(
				Math.round(-155.25485562709179 - 0.44596950469579133 * (t - 2) + 104.49216199393888 * Math.log(t - 2)),
			);
		return safeRgb(
			Math.round(325.4494125711974 + 0.07943456536662342 * (t - 50) - 28.0852963507957 * Math.log(t - 50)),
		);
	}
};

export const tempToB = (k: number, a: TempAlgorithm): number => {
	const t: number = k / 100.0;

	if (t <= 66.0) return 255;

	if (a === "tanner_helland")
		return t <= 19.0 ? 0 : safeRgb(Math.round(138.5177312231 * Math.log(t - 10) - 305.0447927307));

	return t <= 20.0
		? 0
		: safeRgb(
				Math.round(-254.76935184120902 + 0.8274096064007395 * (t - 10) + 115.67994401066147 * Math.log(t - 10)),
		  );
};

export const tempToRgb = (k: number, a: TempAlgorithm): RGB => ({
	r: tempToR(k, a),
	g: tempToG(k, a),
	b: tempToB(k, a),
	a: 1,
});

export const colorChannelMixer = (colorChannelA: number, colorChannelB: number, percentage: number): number => {
	const channelA: number = colorChannelA * percentage;
	const channelB: number = colorChannelB * (1 - percentage);
	return channelA + channelB;
};

export const blendAlpha = (s: number, r: number): number => Number((s + r - s * r).toFixed(2));

export const blenderCb = (source: RGB, ref: RGB, mode: BlendMode): RGB => {
	const r: number = separableBlend(mode, source.r, ref.r);
	const g: number = separableBlend(mode, source.g, ref.g);
	const b: number = separableBlend(mode, source.b, ref.b);
	const a: number = blendAlpha(source.a, ref.a);

	return { r, g, b, a };
};
