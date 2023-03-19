import {
	BlendMode,
	ColorMethod,
	ColorNames,
	HEX,
	HSL,
	NamedColor,
	PossibleColors,
	PossibleColorStrings,
	RGB,
	ValidationResult,
} from "./types";
import { colorNamesJson, random, rgbDistance, safeAlpha, safeHue, safePct, safeRgb, separableBlend } from "./utils";

export class Color {
	private rgba: RGB = { r: 0, g: 0, b: 0, a: 1 };
	private hsla: HSL = { h: 0, s: 0, l: 0, a: 1 };
	private hexa: HEX = { x: "00", y: "00", z: "00", a: "ff" };
	private colorNames: ColorNames = colorNamesJson;

	public constructor(c?: PossibleColorStrings) {
		if (c) this.string(c);
	}

	public static isValid(c: string | NamedColor): boolean {
		return new Color().validate(c)[0];
	}

	public static string(c: string): Color {
		return new Color().string(c);
	}

	public static getName(c: PossibleColors): PossibleColorStrings {
		const col: string = new Color().base(c).toHex(false);
		const arr: [string, string][] = Object.entries(new Color().colorNames);
		const index: number = arr.findIndex(c => c[1] === col);
		return index > -1 ? arr[index][0] : col;
	}

	public static validate(c: string | NamedColor): ValidationResult {
		return new Color().validate(c);
	}

	public static complementary(c: PossibleColors): Color[] {
		return new Color().fromHueArray(c, [180]);
	}

	public static analogous(c: PossibleColors): Color[] {
		return new Color().fromHueArray(c, [30, 60]);
	}

	public static triadic(c: PossibleColors): Color[] {
		return new Color().fromHueArray(c, [120, 240]);
	}

	public static splitComplementary(c: PossibleColors): Color[] {
		return new Color().fromHueArray(c, [150, 210]);
	}

	public static doubleComplementary(c: PossibleColors, hue: number): Color[] {
		const set1: Color[] = new Color().fromHueArray(c, [90]);
		const col: Color = new Color().base(c);
		const set2: Color[] = new Color().fromHueArray(col.rotate(hue), [90]);
		return [...set1, ...set2];
	}

	public static distance(c1: PossibleColors, c2: PossibleColors): number {
		return rgbDistance(new Color().base(c1).toRgbObj(), new Color().base(c2).toRgbObj());
	}

	public getName(): PossibleColorStrings {
		// console.log(this.toHex())
		return Color.getName(this.toHex());
	}

	public rgb(r: number, g: number, b: number, a?: number): Color {
		this.fromRgb({ r, g, b, a });
		this.rgbToHsl();
		this.rgbToHex();

		return this;
	}

	public hsl(h: number, s: number, l: number, a?: number): Color {
		this.fromHsl({ h, s, l, a });
		this.hslToHex();
		this.hslToRgb();

		return this;
	}

	public hex(hex: string): Color {
		this.fromHex(hex);
		this.hexToHsl();
		this.hexToRgb();

		return this;
	}

	public name(name: NamedColor): Color {
		const hex: string = this.colorNames[name];
		this.hex(hex);

		return this;
	}

	public string(c: PossibleColorStrings): Color {
		const valid_c: ValidationResult = this.validate(c);

		if (valid_c[0]) {
			if (valid_c[1].method === "hex") {
				this.hex(c);
			} else if (valid_c[1].method === "hsl") {
				this.fromHslString(c, valid_c[1].alpha!);
			} else if (valid_c[1].method === "rgb") {
				this.fromRgbString(c, valid_c[1].alpha!);
			} else if (valid_c[1].method === "css_name") {
				this.name(c as NamedColor);
			}
		}

		return this;
	}

	public red(r: number): Color {
		this.rgb(r, this.rgba.g, this.rgba.b, this.rgba.a);

		return this;
	}

	public green(g: number): Color {
		this.rgb(this.rgba.r, g, this.rgba.b, this.rgba.a);

		return this;
	}

	public blue(b: number): Color {
		this.rgb(this.rgba.r, this.rgba.g, b, this.rgba.a);

		return this;
	}

	public hue(h: number): Color {
		this.hsl(h, this.hsla.s, this.hsla.l, this.hsla.a);

		return this;
	}

	public saturation(s: number): Color {
		this.hsl(this.hsla.h, s, this.hsla.l, this.hsla.a);

		return this;
	}

	public lightness(l: number): Color {
		this.hsl(this.hsla.h, this.hsla.s, l, this.hsla.a);

		return this;
	}

	public alpha(value: number): Color {
		const v: number = safePct(value) / 100;
		this.hsl(this.hsla.h, this.hsla.s, this.hsla.l, Number(v.toFixed(2)));

		return this;
	}

	public transparent(): Color {
		this.rgb(0, 0, 0, 0);

		return this;
	}

	public lighten(value: number): Color {
		const l: number = this.hsla.l * (1 + (safePct(value) / 100));
		this.lightness(Number(l.toFixed(1)));

		return this;
	}

	public darken(value: number): Color {
		const l: number = this.hsla.l * (1 - (safePct(value) / 100));
		this.lightness(Number(l.toFixed(1)));

		return this;
	}

	public saturate(value: number): Color {
		const s: number = this.hsla.s * (1 + (safePct(value) / 100));
		this.saturation(Number(s.toFixed(1)));

		return this;
	}

	public desaturate(value: number): Color {
		const s: number = this.hsla.s * (1 - (safePct(value) / 100));
		this.saturation(Number(s.toFixed(1)));

		return this;
	}

	public rotate(value: number): Color {
		const rem: number = value % 360;
		let h: number = this.hsla.h + rem;

		if (h > 360) h -= 360;
		if (h < 0) h += 360;

		this.hue(h);

		return this;
	}

	public fade(value: number): Color {
		const v: number = this.hsla.a! * (1 - (safePct(value) / 100));
		this.hsl(this.hsla.h, this.hsla.s, this.hsla.l, v);

		return this;
	}

	public brighten(value: number): Color {
		const v: number = this.hsla.a! * (1 + (safePct(value) / 100));
		this.hsl(this.hsla.h, this.hsla.s, this.hsla.l, Number(v.toFixed(2)));

		return this;
	}

	public mix(c: Color, percentage: number = 50): Color {
		percentage = safePct(percentage) / 100;

		const r: number = Math.round(this.colorChannelMixer(c.rgba.r, this.rgba.r, percentage));
		const g: number = Math.round(this.colorChannelMixer(c.rgba.g, this.rgba.g, percentage));
		const b: number = Math.round(this.colorChannelMixer(c.rgba.b, this.rgba.b, percentage));

		this.rgb(r, g, b);

		return this;
	}

	public blend(ref: Color, mode: BlendMode = "normal"): Color {
		const a: number = Number((this.rgba.a! + ref.rgba.a! - this.rgba.a! * ref.rgba.a!).toFixed(2));
		const rgb: RGB = this.blenderCb(this, ref, mode);
		this.rgb(rgb.r, rgb.g, rgb.b, a);

		return this;
	}

	public grayscale(algorithm: "luminosity" | "averaged" = "luminosity"): Color {
		if (algorithm === "luminosity") {
			const value: number = Math.round(this.rgba.r * 0.3 + this.rgba.g * 0.59 + this.rgba.b * 0.11);
			this.rgb(value, value, value);
		} else if (algorithm === "averaged") {
			const value: number = Math.round((this.rgba.r + this.rgba.g + this.rgba.b) / 3);
			this.rgb(value, value, value);
		}

		return this;
	}

	public negate(): Color {
		const r: number = 255 - this.rgba.r;
		const g: number = 255 - this.rgba.g;
		const b: number = 255 - this.rgba.b;

		this.rgb(r, g, b);

		return this;
	}

	public isDark(): boolean {
		return ((this.rgba.r * 2126 + this.rgba.g * 7152 + this.rgba.b * 722) / 10000) < 128;
	}

	public isLight(): boolean {
		return !this.isDark();
	}

	public luminance(): number {
		const rx: number = this.rgba.r / 255;
		const gx: number = this.rgba.g / 255;
		const bx: number = this.rgba.b / 255;
		const r: number = rx <= 0.03928 ? rx / 12.92 : ((rx + 0.055) / 1.055) ** 2.4;
		const g: number = gx <= 0.03928 ? gx / 12.92 : ((gx + 0.055) / 1.055) ** 2.4;
		const b: number = bx <= 0.03928 ? bx / 12.92 : ((bx + 0.055) / 1.055) ** 2.4;

		return Number((0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(4));
	}

	public contrast(c: Color): number {
		const l1: number = this.luminance();
		const l2: number = c.luminance();
		const div: number = (l1 + 0.05) / (l2 + 0.05);

		return l1 > l2 ? div : 1 / div;
	}

	public level(c: Color): "AAA" | "AA" | "AA Large" | "" {
		const ratio: number = this.contrast(c);

		return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3.0 ? "AA Large" : "";
	}

	public distance(c: PossibleColors): number {
		return rgbDistance(this.toRgbObj(), new Color().base(c).toRgbObj());
	}

	public complementary(): Color[] {
		return Color.complementary(this);
	}

	public analogous(): Color[] {
		return Color.analogous(this);
	}

	public triadic(): Color[] {
		return Color.triadic(this);
	}

	public splitComplementary(): Color[] {
		return Color.splitComplementary(this);
	}

	public doubleComplementary(hue: number): Color[] {
		return Color.doubleComplementary(this, hue);
	}

	public swatch(band: 3 | 5 | 7 | 9 = 5): Color[] {
		const h: number = this.hsla.h, s: number = this.hsla.s, l: number = this.hsla.l,
			a: number = this.hsla.a as number;

		const colors: Color[] = [this];

		for (let i: number = 1; i < band; i++) {
			if (i % 2 === 0) {
				colors.push(new Color().hsl(h, s, l, a).rotate(10 * i).desaturate(5 * i).darken(2.5 * i));
			} else {
				colors.unshift(new Color().hsl(h, s, l, a).rotate(-10 * i).saturate(5 * i).lighten(2.5 * i));
			}
		}

		return colors;
	}

	public randomSwatch(band: 3 | 5 | 7 | 9 = 5): Color[] {
		const h: number = this.hsla.h, s: number = this.hsla.s, l: number = this.hsla.l,
			a: number = this.hsla.a as number;

		const colors: Color[] = [this];

		for (let i: number = 1; i < band; i++) {
			if (i % 2 === 0) {
				colors.push(new Color().hsl(h, s, l, a).rotate(random() * i * 10).desaturate(random() * i * 5).darken(random() * i * 5));
			} else {
				colors.unshift(new Color().hsl(h, s, l, a).rotate(random() * i * 10).saturate(random() * i * 5).lighten(random() * i * 5));
			}
		}

		return colors;
	}

	public colors(): object {
		return {
			rgb: this.rgba, hsl: this.hsla, hex: this.hexa,
		};
	}

	public toRgbObj(): RGB {
		return this.rgba;
	}

	public toHslObj(): HSL {
		return this.hsla;
	}

	public toHexObj(): HEX {
		return this.hexa;
	}

	public to(): string {
		return this.toRgb();
	}

	public toRgb(withAlpha: boolean = true, withPct: boolean = false): string {
		let r: number = this.rgba.r, g: number = this.rgba.g, b: number = this.rgba.b,
			a: number = this.rgba.a as number;

		if (withPct) {
			r = Number((r / 255 * 100).toFixed(1));
			g = Number((g / 255 * 100).toFixed(1));
			b = Number((b / 255 * 100).toFixed(1));
			a = Number((a! * 100).toFixed(1));

			if (withAlpha) return `rgba(${r}%, ${g}%, ${b}%, ${a}%)`; else return `rgb(${r}%, ${g}%, ${b}%)`;
		}

		if (withAlpha) return `rgba(${r}, ${g}, ${b}, ${a})`; else return `rgb(${r}, ${g}, ${b})`;
	}

	public toHex(withAlpha: boolean = true): string {
		const x: string = this.hexa.x, y: string = this.hexa.y, z: string = this.hexa.z,
			a: string = this.hexa.a as string;

		if (withAlpha) return `#${x}${y}${z}${a}`; else return `#${x}${y}${z}`;
	}

	public toHsl(withAlpha: boolean = true): string {
		const h: number = this.hsla.h, s: number = this.hsla.s, l: number = this.hsla.l,
			a: number = this.hsla.a as number;

		if (withAlpha) return `hsla(${h}, ${s}%, ${l}%, ${a})`; else return `hsl(${h}, ${s}%, ${l}%)`;
	}

	public validate(c: PossibleColorStrings): ValidationResult {
		const hex: ValidationResult = this.validateHex(c);
		if (hex[0]) return hex;

		const hsl: ValidationResult = this.validateHsl(c);
		if (hsl[0]) return hsl;

		const css: ValidationResult = this.validateName(c as NamedColor);
		if (css[0]) return css;

		return this.validateRgb(c);
	}

	public validateName(c: NamedColor): ValidationResult {
		const method = "css_name";

		if (Object.keys(this.colorNames).includes(c)) {
			return [true, { method, alpha: true }];
		} else {
			return [false, { method: undefined }];
		}
	}

	public validateRgb(c: string): ValidationResult {
		const exp: RegExp = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
		const expAlpha: RegExp = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
		const method: ColorMethod = "rgb";

		if (exp.test(c)) {
			return [true, { method, alpha: false }];
		} else if (expAlpha.test(c)) {
			return [true, { method, alpha: true }];
		} else {
			return [false, { method: undefined }];
		}
	}

	public validateHsl(c: string): ValidationResult {
		const exp: RegExp = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad|360)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
		const expAlpha: RegExp = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad|360)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
		const method: ColorMethod = "hsl";

		if (exp.test(c)) {
			return [true, { method, alpha: false }];
		} else if (expAlpha.test(c)) {
			return [true, { method, alpha: true }];
		} else {
			return [false, { method: undefined }];
		}
	}

	public validateHex(c: string): ValidationResult {
		const exp: RegExp = /^#?([\da-f]{3}){1,2}$/i;
		const expAlpha: RegExp = /^#?([\da-f]{4}){1,2}$/i;
		const method: ColorMethod = "hex";

		if (exp.test(c)) {
			return [true, { method, alpha: false }];
		} else if (expAlpha.test(c)) {
			return [true, { method, alpha: true }];
		} else {
			return [false, { method: undefined }];
		}
	}

	private base(c: PossibleColors): Color {
		return c instanceof Color ? new Color().fromHsl(c.toHslObj()) : new Color().string(c);
	}

	private fromHueArray(c: PossibleColors, hue: number[]): Color[] {
		const base: Color = this.base(c);
		return [base, ...hue.map((h: number) => new Color().fromHsl(base.toHslObj()).rotate(h))];
	}

	private blenderCb(source: Color, ref: Color, mode: BlendMode): RGB {
		const r: number = separableBlend(mode, source.rgba.r, ref.rgba.r);
		const g: number = separableBlend(mode, source.rgba.g, ref.rgba.g);
		const b: number = separableBlend(mode, source.rgba.b, ref.rgba.b);

		return { r, g, b };
	}

	private colorChannelMixer(colorChannelA: number, colorChannelB: number, percentage: number): number {
		const channelA: number = colorChannelA * percentage;
		const channelB: number = colorChannelB * (1 - percentage);
		return channelA + channelB;
	}

	private fromRgb(rgb: RGB): Color {
		this.rgba = {
			r: safeRgb(rgb.r),
			g: safeRgb(rgb.g),
			b: safeRgb(rgb.b),
			a: rgb.a !== undefined ? safeAlpha(rgb.a) : this.rgba.a,
		};

		return this;
	}

	private fromRgbString(c: string, alpha: boolean): Color {
		const slice: number = alpha ? 5 : 4;
		const sep: string = c.indexOf(",") > -1 ? "," : " ";
		const rgba: string[] = c.slice(slice).split(")")[0].split(sep);

		if (rgba.indexOf("/") > -1) rgba.splice(3, 1);

		for (let i: number = 0; i < rgba.length; i++) {
			const r: string = rgba[i];

			if (r.indexOf("%") > -1) {
				const p: number = Number(r.replace("%", "")) / 100;
				if (Number(i) < 3) rgba[i] = String(Math.round(p * 255));
				else rgba[i] = String(p);
			} else {
				if (Number(i) > 2) rgba[i] = r;
			}
		}
		this.rgb(Number(rgba[0]), Number(rgba[1]), Number(rgba[2]), rgba[3] ? Number(rgba[3]) : 1);

		return this;
	}

	private fromHsl(hsl: HSL): Color {
		this.hsla = {
			h: safeHue(hsl.h),
			s: safePct(hsl.s),
			l: safePct(hsl.l),
			a: hsl.a !== undefined ? safeAlpha(hsl.a) : this.hsla.a,
		};

		return this;
	}

	private fromHslString(c: string, alpha: boolean): Color {
		const slice: number = alpha ? 5 : 4;
		const sep: string = c.indexOf(",") > -1 ? "," : " ";
		const hsla: string[] = c.slice(slice).split(")")[0].split(sep);

		if (hsla.indexOf("/") > -1) hsla.splice(3, 1);

		let h: string = hsla[0],
			s: string = hsla[1].replace("%", ""),
			l: string = hsla[2].replace("%", ""),
			a: string = alpha ? hsla[3] : "1";

		if (a.indexOf("%") > -1) {
			a = String(Number(a.replace("%", "")) / 100);
		}

		if (h.indexOf("deg") > -1) h = h.replace("deg", "");
		else if (h.indexOf("rad") > -1) h = String(Math.round(Number(h.replace("rad", "")) * (180 / Math.PI)));
		else if (h.indexOf("turn") > -1) h = String(Math.round(Number(h.replace("turn", "")) * 360));

		this.hsl(Number(h), Number(s), Number(l), Number(a));

		return this;
	}

	private fromHex(hex: string): Color {
		const len: number = hex.length;
		let x: string = "00", y: string = "00", z: string = "00", a: string = "ff";

		if (len === 3 || len === 4) {
			const result: RegExpExecArray | null = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
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

		this.hexa = { x, y, z, a };

		return this;
	}

	private rgbToHex(): Color {
		const x: string = this.rgba.r.toString(16).padStart(2, "0");
		const y: string = this.rgba.g.toString(16).padStart(2, "0");
		const z: string = this.rgba.b.toString(16).padStart(2, "0");
		const a: string = Math.round(this.rgba.a! * 255).toString(16).padStart(2, "0");

		this.hexa = { x, y, z, a };

		return this;
	}

	private hexToRgb(): Color {
		const r: number = Number("0x" + this.hexa.x);
		const g: number = Number("0x" + this.hexa.y);
		const b: number = Number("0x" + this.hexa.z);

		const a: number = this.hexa.a ? Number((Number("0x" + this.hexa.a) / 255).toFixed(2)) : 1;

		this.rgba = { r, g, b, a };

		return this;
	}

	private rgbToHsl(): Color {
		const r: number = this.rgba.r / 255;
		const g: number = this.rgba.g / 255;
		const b: number = this.rgba.b / 255;
		const a: number = this.rgba.a as number;

		let min: number = Math.min(r, g, b), max: number = Math.max(r, g, b), d: number = max - min, h: number = 0,
			s: number = 0, l: number = (max + min) / 2;

		if (d === 0) h = s = 0; else {
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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

			h = Math.round(h * 60);
			if (h < 0) h += 360;
		}

		this.hsla = { h, s: Number((s * 100).toFixed(1)), l: Number((l * 100).toFixed(1)), a };

		return this;
	}

	private hslToRgb(): Color {
		const h: number = this.hsla.h;
		const s: number = this.hsla.s / 100;
		const l: number = this.hsla.l / 100;
		const a: number = this.hsla.a as number;

		let c: number = (1 - Math.abs(2 * l - 1)) * s, x: number = c * (1 - Math.abs((h / 60) % 2 - 1)),
			m: number = l - c / 2, r: number = 0, g: number = 0,
			b: number = 0;

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

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		this.rgba = { r, g, b, a };

		return this;
	}

	private hslToHex(): Color {
		this.hslToRgb();
		this.rgbToHex();

		return this;
	}

	private hexToHsl(): Color {
		this.hexToRgb();
		this.rgbToHsl();

		return this;
	}
}
