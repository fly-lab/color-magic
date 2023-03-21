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
export const safeHex = (value: string): string => (clamp(parseInt(value, 16), 0, 255) || 0).toString(16).padStart(2, "0");
export const safeHue = (value: number): number => clamp(value, 0, 360);
export const safePct = (value: number): number => clamp(value, 0, 100);
export const safeAlpha = (value: number): number => clamp(value, 0, 1);

export const random = (min: number = 0, max: number = 10): number => Math.floor(Math.random() * (max - min) + min);

export const modeMap: Record<BlendMode, ModeCb> = {
	"normal": normal,
	"multiply": multiply,
	"screen": screen,
	"overlay": overlay,
	"difference": difference,
	"exclusion": exclusion,
	"darken": darken,
	"lighten": lighten,
	"dodge": dodge,
	"burn": burn,
	"hard": hard,
	"soft": soft,
}

export const modeMapping = (mode: BlendMode): ModeCb => modeMap[mode];
