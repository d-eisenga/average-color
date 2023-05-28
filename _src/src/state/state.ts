import {computed, effect, signal} from '@preact/signals';
import {
  CHANNEL_FORMAT_INT,
  MODE_READY,
  RGB_FORMAT_HEX,
  ZOOM_DEFAULT,
  ZOOM_LEVELS,
} from '../constants';
import {
  ChannelFormat,
  Color,
  Image,
  Mode,
  Path,
  Point,
  RGBFormat,
  isChannelFormat,
  isRGBFormat,
} from '../types';

export const mode = signal<Mode>(MODE_READY);

export const image = signal<Image | null>(null);
export const width = computed(() => image.value?.el.width ?? 0);
export const height = computed(() => image.value?.el.height ?? 0);

export const ctx = signal<CanvasRenderingContext2D | null>(null);
export const zoomIndex = signal(ZOOM_DEFAULT);
export const zoom = computed(() => ZOOM_LEVELS[zoomIndex.value]);
export const pan = signal({x: 0, y: 0});

export const paths = signal<Path[]>([]);
export const newPath = signal<Path | null>(null);
export const newPoint = signal<Point | null>(null);

export const results = signal<Color[]>([]);

const storedSignal = <T>(
  key: string,
  decode: (value: string | null) => T,
  encode: (value: T) => string
) => {
  const stored = localStorage.getItem(key);
  const value = decode(stored);
  localStorage.setItem(key, encode(value));
  const s = signal<T>(value);
  effect(() => {
    localStorage.setItem(key, encode(s.value));
  });
  return s;
};

export const rgbFormat = storedSignal<RGBFormat>(
  'rgbFormat',
  value => isRGBFormat(value) ? value : RGB_FORMAT_HEX,
  s => s
);
export const channelFormat = storedSignal<ChannelFormat>(
  'channelFormat',
  value => isChannelFormat(value) ? value : CHANNEL_FORMAT_INT,
  s => s
);
export const convertSRGB = storedSignal<boolean>(
  'convertSRGB',
  value => value === 'true',
  String
);

effect(() => {
  if (image.value && ctx.value) {
    ctx.value.canvas.width = width.value;
    ctx.value.canvas.height = height.value;
    ctx.value.clearRect(0, 0, width.value, height.value);
    ctx.value.drawImage(image.value.el, 0, 0);
  }
});
