import { ColorNames, HEX, HSL, RGB } from "./types";
import { safeAlpha, safeHue, safePct, safeRgb } from "./utils";

export class Color {
	private rgba: RGB = {r: 0, g: 0, b: 0, a: 1,};
	private hsla: HSL = {h: 0, s: 0, l: 0, a: 1,};
	private hexa: HEX = {x: "00", y: "00", z: "00", a: "ff",};
	private colorNames: ColorNames = {
		"aliceblue": "#f0f8ff",
		"antiquewhite": "#faebd7",
		"aqua": "#00ffff",
		"aquamarine": "#7fffd4",
		"azure": "#f0ffff",
		"beige": "#f5f5dc",
		"bisque": "#ffe4c4",
		"black": "#000000",
		"blanchedalmond": "#ffebcd",
		"blue": "#0000ff",
		"blueviolet": "#8a2be2",
		"brown": "#a52a2a",
		"burlywood": "#deb887",
		"cadetblue": "#5f9ea0",
		"chartreuse": "#7fff00",
		"chocolate": "#d2691e",
		"coral": "#ff7f50",
		"cornflowerblue": "#6495ed",
		"cornsilk": "#fff8dc",
		"crimson": "#dc143c",
		"cyan": "#00ffff",
		"darkblue": "#00008b",
		"darkcyan": "#008b8b",
		"darkgoldenrod": "#b8860b",
		"darkgray": "#a9a9a9",
		"darkgreen": "#006400",
		"darkgrey": "#a9a9a9",
		"darkkhaki": "#bdb76b",
		"darkmagenta": "#8b008b",
		"darkolivegreen": "#556b2f",
		"darkorange": "#ff8c00",
		"darkorchid": "#9932cc",
		"darkred": "#8b0000",
		"darksalmon": "#e9967a",
		"darkseagreen": "#8fbc8f",
		"darkslateblue": "#483d8b",
		"darkslategray": "#2f4f4f",
		"darkslategrey": "#2f4f4f",
		"darkturquoise": "#00ced1",
		"darkviolet": "#9400d3",
		"deeppink": "#ff1493",
		"deepskyblue": "#00bfff",
		"dimgray": "#696969",
		"dimgrey": "#696969",
		"dodgerblue": "#1e90ff",
		"firebrick": "#b22222",
		"floralwhite": "#fffaf0",
		"forestgreen": "#228b22",
		"fuchsia": "#ff00ff",
		"gainsboro": "#dcdcdc",
		"ghostwhite": "#f8f8ff",
		"goldenrod": "#daa520",
		"gold": "#ffd700",
		"gray": "#808080",
		"green": "#008000",
		"greenyellow": "#adff2f",
		"grey": "#808080",
		"honeydew": "#f0fff0",
		"hotpink": "#ff69b4",
		"indianred": "#cd5c5c",
		"indigo": "#4b0082",
		"ivory": "#fffff0",
		"khaki": "#f0e68c",
		"lavenderblush": "#fff0f5",
		"lavender": "#e6e6fa",
		"lawngreen": "#7cfc00",
		"lemonchiffon": "#fffacd",
		"lightblue": "#add8e6",
		"lightcoral": "#f08080",
		"lightcyan": "#e0ffff",
		"lightgoldenrodyellow": "#fafad2",
		"lightgray": "#d3d3d3",
		"lightgreen": "#90ee90",
		"lightgrey": "#d3d3d3",
		"lightpink": "#ffb6c1",
		"lightsalmon": "#ffa07a",
		"lightseagreen": "#20b2aa",
		"lightskyblue": "#87cefa",
		"lightslategray": "#778899",
		"lightslategrey": "#778899",
		"lightsteelblue": "#b0c4de",
		"lightyellow": "#ffffe0",
		"lime": "#00ff00",
		"limegreen": "#32cd32",
		"linen": "#faf0e6",
		"magenta": "#ff00ff",
		"maroon": "#800000",
		"mediumaquamarine": "#66cdaa",
		"mediumblue": "#0000cd",
		"mediumorchid": "#ba55d3",
		"mediumpurple": "#9370db",
		"mediumseagreen": "#3cb371",
		"mediumslateblue": "#7b68ee",
		"mediumspringgreen": "#00fa9a",
		"mediumturquoise": "#48d1cc",
		"mediumvioletred": "#c71585",
		"midnightblue": "#191970",
		"mintcream": "#f5fffa",
		"mistyrose": "#ffe4e1",
		"moccasin": "#ffe4b5",
		"navajowhite": "#ffdead",
		"navy": "#000080",
		"oldlace": "#fdf5e6",
		"olive": "#808000",
		"olivedrab": "#6b8e23",
		"orange": "#ffa500",
		"orangered": "#ff4500",
		"orchid": "#da70d6",
		"palegoldenrod": "#eee8aa",
		"palegreen": "#98fb98",
		"paleturquoise": "#afeeee",
		"palevioletred": "#db7093",
		"papayawhip": "#ffefd5",
		"peachpuff": "#ffdab9",
		"peru": "#cd853f",
		"pink": "#ffc0cb",
		"plum": "#dda0dd",
		"powderblue": "#b0e0e6",
		"purple": "#800080",
		"rebeccapurple": "#663399",
		"red": "#ff0000",
		"rosybrown": "#bc8f8f",
		"royalblue": "#4169e1",
		"saddlebrown": "#8b4513",
		"salmon": "#fa8072",
		"sandybrown": "#f4a460",
		"seagreen": "#2e8b57",
		"seashell": "#fff5ee",
		"sienna": "#a0522d",
		"silver": "#c0c0c0",
		"skyblue": "#87ceeb",
		"slateblue": "#6a5acd",
		"slategray": "#708090",
		"slategrey": "#708090",
		"snow": "#fffafa",
		"springgreen": "#00ff7f",
		"steelblue": "#4682b4",
		"tan": "#d2b48c",
		"teal": "#008080",
		"thistle": "#d8bfd8",
		"tomato": "#ff6347",
		"transparent": "#00000000",
		"turquoise": "#40e0d0",
		"violet": "#ee82ee",
		"wheat": "#f5deb3",
		"white": "#ffffff",
		"whitesmoke": "#f5f5f5",
		"yellow": "#ffff00",
		"yellowgreen": "#9acd32",
	}

	#colorChannelMixer(colorChannelA: number, colorChannelB: number, percentage: number): number {
		const channelA = colorChannelA * percentage;
		const channelB = colorChannelB * (1 - percentage);
		return channelA + channelB;
	}

	#fromRgb(rgb: RGB): Color {
		this.rgba = {
			r: safeRgb(rgb.r),
			g: safeRgb(rgb.g),
			b: safeRgb(rgb.b),
			a: rgb.a !== undefined ? safeAlpha(rgb.a) : this.rgba.a
		};

		return this;
	}

	#fromHsl(hsl: HSL): Color {
		this.hsla = {
			h: safeHue(hsl.h),
			s: safePct(hsl.s),
			l: safePct(hsl.l),
			a: hsl.a !== undefined ? safeAlpha(hsl.a) : this.hsla.a
		};

		return this;
	}

	#fromHex(hex: string): Color {
		const len = hex.length;
		let x = "00", y = "00", z = "00", a = "ff";

		if (len === 3 || len === 4) {
			const result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
			if (result) {
				x = result[1] + result[1];
				y = result[2] + result[2];
				z = result[3] + result[3];
			}
		} else if (len === 6 || len === 7) {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (result) {
				x = result[1];
				y = result[2];
				z = result[3];
			}
		} else if (len === 8 || len === 9) {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (result) {
				x = result[1];
				y = result[2];
				z = result[3];
				a = result[4];
			}
		}

		this.hexa = {x, y, z, a};

		return this;
	}

	#rgbToHex(): Color {
		const x = this.rgba.r.toString(16).padStart(2, "0");
		const y = this.rgba.g.toString(16).padStart(2, "0");
		const z = this.rgba.b.toString(16).padStart(2, "0");
		const a = Math.round(this.rgba.a! * 255).toString(16).padStart(2, "0");

		this.hexa = {x, y, z, a};

		return this;
	}

	#hexToRgb(): Color {
		const r = Number("0x" + this.hexa.x);
		const g = Number("0x" + this.hexa.y);
		const b = Number("0x" + this.hexa.z);

		const a = this.hexa.a ? Number((Number("0x" + this.hexa.a) / 255).toFixed(2)) : 1;

		this.rgba = {r, g, b, a};

		return this;
	}

	#rgbToHsl(): Color {
		const r = this.rgba.r / 255;
		const g = this.rgba.g / 255;
		const b = this.rgba.b / 255;
		const a = this.rgba.a;

		let min = Math.min(r, g, b), max = Math.max(r, g, b), d = max - min, h = 0, s = 0, l = (max + min) / 2;

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

		this.hsla = {h, s: Number((s * 100).toFixed(1)), l: Number((l * 100).toFixed(1)), a};

		return this;
	}

	#hslToRgb(): Color {
		const h = this.hsla.h;
		const s = this.hsla.s / 100;
		const l = this.hsla.l / 100;
		const a = this.hsla.a;

		let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0,
			b = 0;

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

		this.rgba = {r, g, b, a};

		return this;
	}

	#hslToHex(): Color {
		this.#hslToRgb();
		this.#rgbToHex();

		return this;
	}

	#hexToHsl(): Color {
		this.#hexToRgb();
		this.#rgbToHsl();

		return this;
	}
}
