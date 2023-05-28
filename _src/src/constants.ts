/* eslint-disable array-element-newline */
export const ZOOM_LEVELS = [
  0.1, 0.125, 0.15, 0.175, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.8, 0.9,
  1,
  1.1, 1.2, 1.3, 1.5, 2, 2.5, 3, 4, 5, 6, 8,
];
/* eslint-enable array-element-newline */
export const ZOOM_DEFAULT = ZOOM_LEVELS.indexOf(1);

export const MODE_READY = 'MODE_READY' as const;
export const MODE_DRAWING = 'MODE_DRAWING' as const;
export const MODE_DRAGGING = 'MODE_DRAGGING' as const;
export const MODE_CALCULATING = 'MODE_CALCULATING' as const;

export const RGB_FORMAT_CSS = 'RGB_FORMAT_CSS' as const;
export const RGB_FORMAT_HEX = 'RGB_FORMAT_HEX' as const;
export const RGB_FORMAT_BLENDER = 'RGB_FORMAT_BLENDER' as const;

export const RGB_FORMATS = [
  RGB_FORMAT_CSS,
  RGB_FORMAT_HEX,
  RGB_FORMAT_BLENDER,
] as const;

export const CHANNEL_FORMAT_INT = 'CHANNEL_FORMAT_INT' as const;
export const CHANNEL_FORMAT_FLOAT = 'CHANNEL_FORMAT_FLOAT' as const;

export const CHANNEL_FORMATS = [
  CHANNEL_FORMAT_INT,
  CHANNEL_FORMAT_FLOAT,
] as const;
