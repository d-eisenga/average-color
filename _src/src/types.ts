import {
  CHANNEL_FORMATS,
  MODE_CALCULATING,
  MODE_DRAGGING,
  MODE_DRAWING,
  MODE_READY,
  RGB_FORMATS,
} from './constants';

export type Point = {
  x: number;
  y: number;
};

export type Path = {
  id: string;
  name: string;
  points: Point[];
};

export type Color = {
  name: string;
  r: number;
  g: number;
  b: number;
};

export type Image = {
  name: string;
  el: HTMLImageElement;
};

export type Mode = (
  | typeof MODE_READY
  | typeof MODE_DRAWING
  | typeof MODE_DRAGGING
  | typeof MODE_CALCULATING
);

export type RGBFormat = typeof RGB_FORMATS[number];

export const isRGBFormat = (format: unknown): format is RGBFormat => (
  RGB_FORMATS.includes(format as RGBFormat)
);

export type ChannelFormat = typeof CHANNEL_FORMATS[number];

export const isChannelFormat = (format: unknown): format is ChannelFormat => (
  CHANNEL_FORMATS.includes(format as ChannelFormat)
);

export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type WorkerMessage = {
  imageData: ImageData;
  pathsD: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type WorkerResponse = [red: number, green: number, blue: number][];
