import {Bounds, Point} from '../types';

export const pointsBounds = (points: Point[]): Bounds => {
  let left = points[0].x;
  let right = points[0].x;
  let top = points[0].y;
  let bottom = points[0].y;
  for (let i = 1; i < points.length; i++) {
    left = Math.min(left, points[i].x);
    right = Math.max(right, points[i].x);
    top = Math.min(top, points[i].y);
    bottom = Math.max(bottom, points[i].y);
  }
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top,
  };
};
