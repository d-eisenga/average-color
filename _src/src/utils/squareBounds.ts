import {Bounds} from '../types';

export const squareBounds = (bounds: Bounds): Bounds => {
  const {left, top, width, height} = bounds;
  const x = left + (width * 0.5);
  const y = top + (height * 0.5);
  const size = Math.max(width, height);
  const halfSize = size * 0.5;
  return {
    left: x - halfSize,
    right: x + halfSize,
    top: y - halfSize,
    bottom: y + halfSize,
    width: size,
    height: size,
  };
};
