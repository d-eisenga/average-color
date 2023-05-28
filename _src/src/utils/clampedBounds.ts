import {Bounds} from '../types';

export const clampedBounds = (
  bounds: Bounds,
  maxX: number,
  maxY: number,
  minX = 0,
  minY = 0
): Bounds => {
  const left = Math.max(Math.min(bounds.left, maxX), minX);
  const right = Math.max(Math.min(bounds.right, maxX), minX);
  const top = Math.max(Math.min(bounds.top, maxY), minY);
  const bottom = Math.max(Math.min(bounds.bottom, maxY), minY);
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top,
  };
};
