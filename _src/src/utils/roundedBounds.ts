import {Bounds} from '../types';

export const roundedBounds = (bounds: Bounds): Bounds => {
  const left = Math.floor(bounds.left);
  const right = Math.ceil(bounds.right);
  const top = Math.floor(bounds.top);
  const bottom = Math.ceil(bounds.bottom);

  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top,
  };
};
