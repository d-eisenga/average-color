import {Point} from '../types';

export const pointsToString = (points: Point[]) => {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d = `${d}L${points[i].x},${points[i].y}`;
  }
  if (points.length > 2) {
    d = `${d}Z`;
  }
  return d;
};
