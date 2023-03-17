export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const safeRgb = (value: number): number => clamp(value, 0, 255);

export const safeHex = (value: number): number => clamp(value, 0x00, 0xff);

export const safeHue = (value: number): number => clamp(value, 0, 360);

export const safePct = (value: number): number => clamp(value, 0, 100);

export const safeAlpha = (value: number): number => clamp(value, 0, 1);

export const random = (min: number = 0, max: number = 10): number => Math.floor(Math.random() * (max - min) + min);
